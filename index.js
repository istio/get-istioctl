import core from '@actions/core'
import {downloadIstioctl, getIstioRelease} from './src/functions.js'

try {
  let osvar = core.getInput("os")
  let arch = "-" + core.getInput("arch")
  let expr = core.getInput("version")

  const [max, istioctlkey, istiokey] = await getIstioRelease(expr, osvar, arch)
  core.setOutput("version", max.version);
  core.setOutput("major", max.major);
  core.setOutput("minor", max.minor);
  core.setOutput("patch", max.patch);
  core.setOutput("istioctl-url", istioctlkey)
  core.setOutput("istio-url", istiokey)

  // actually get istioctl
  downloadIstioctl(istioctlkey).catch(
      error => core.setFailed(error.message)
  );
} catch (error) {
  core.setFailed(error.message);
}
