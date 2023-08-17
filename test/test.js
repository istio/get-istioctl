import AsyncTestUtil from 'async-test-util'
import {maybeDownloadIstioctl, getIstioRelease} from '../src/functions.js'
import assert from 'assert'
import validUrl from 'valid-url'
import fs from 'fs'
import {join} from 'path'

function getLocalDir(dir)  {
  const localDir = join(
    '.',
    'runner',
    join(
      Math.random()
        .toString(36)
        .substring(7)
    ),
    dir,
  )
  return localDir
}

it('should wait until server is online', async function() {
  // fail test if it takes longer that 30 seconds
  this.timeout(30000)

  const tempPath =  getLocalDir('temp')
  const cachePath = getLocalDir('tools')
  process.env['RUNNER_TEMP'] = tempPath
  process.env['RUNNER_TOOL_CACHE'] = cachePath

  // note: the istioctl version being searched must appear within the first 30
  // most recent releases, or the call to `getIstioRelease()` won't return it;
  // therefore, this needs to be kept up-to-date
  const testReleaseMajorMinor = '1.18'
  // note: it needs to be known ahead of time what patch version will be returned
  const testReleaseExpected = `${testReleaseMajorMinor}.2`

  var max, istioctlkey, istiokey
  const doGetRelease = async() => {
    [max, istioctlkey, istiokey] = await getIstioRelease(`${testReleaseMajorMinor}.*`, 'local', '-local')
    await maybeDownloadIstioctl(istioctlkey, max.raw)
    assert.equal(max.version, testReleaseExpected)
    assert.ok(validUrl.isUri(istiokey))
    assert.ok(validUrl.isUri(istioctlkey))
    // TODO: check that istioctl is on the path
    return true
  }

  await AsyncTestUtil.waitUntil(doGetRelease)

  // TODO: add assertions and cleanup for istioctl file

})
