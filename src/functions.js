import fs from 'fs';
import download from 'download';
import tar from 'tar';
import {Octokit} from '@octokit/rest';
import semver from 'semver';
import os from 'os';
import util from 'util';
import cache from '@actions/tool-cache'
import core from '@actions/core'


export async function getIstioRelease(expr, osvar, arch) {
  const octokit = new Octokit()
  let result = await octokit.rest.repos.listReleases({
    owner: 'istio',
    repo: 'istio',
  })
  console.log("listReleases got status " + result.status)
  const relmap = new Map();
  result.data.forEach( rel => relmap.set(rel.tag_name, rel));
  let max = semver.parse(semver.maxSatisfying(Array.from(relmap.keys()), expr));
  console.log("chose version  " + max.raw)
  let artifacts = relmap.get(max.raw).assets.reduce(function(map,obj) {
    map.set(obj.name, obj);
    return map;
  }, new Map());
  let extension = '';
  if (arch === "-local") {
    switch(os.arch()){
      case 'arm':
        arch = "-armv7"
        break;
      case 'arm64':
        break;
      default:
        arch = "-amd64"
    }
  }
  if (osvar === "local") {
    switch(os.platform()) {
      case 'darwin':
      case 'osx':
        osvar = "osx";
        extension = '.tar.gz'
        if (arch !== '-arm64') {
          arch = ''
        }
        break;
      case 'win32':
        osvar = "win"
        extension = '.zip'
        break;
      default:
        osvar = "linux"
        extension = '.tar.gz'
        break;
    }
  }
  let istioctlkey = util.format("%s-%s-%s%s%s", "istioctl", max.raw, osvar, arch, extension)
  let istiokey = util.format("%s-%s-%s%s%s", "istio", max.raw, osvar, arch, extension)
  console.log("returning data for " + istioctlkey)
  return [max, artifacts.get(istioctlkey).browser_download_url, artifacts.get(istiokey).browser_download_url]
}

export async function maybeDownloadIstioctl(uri, version) {
  // TODO: caching should allow us to speed things up, but I don't understand if this is right
  let cp = ""
  try {
    cp = cache.find("istioctl", version)
  } catch (ex){
    console.log("find caused an exception " + ex)
  }
  if (cp === "") {
    console.log("find returned an empty string")
    const localFile = 'istioctl.tar.gz'
    const dlp = await cache.downloadTool(uri)
    const exp = await cache.extractTar(dlp)
    cp = await cache.cacheDir(exp, "istioctl", version)
  }
  core.addPath(cp)
}

