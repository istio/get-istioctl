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
  // fail test if it takes longer than 30 seconds
  this.timeout(30000)

  const tempPath =  getLocalDir('temp')
  const cachePath = getLocalDir('tools')
  process.env['RUNNER_TEMP'] = tempPath
  process.env['RUNNER_TOOL_CACHE'] = cachePath

  // KEEP TEST VALUE UP-TO-DATE WITH istioctl RELEASES
  //   getIstioRelease() only looks at the 30 most recent releases of istioctl,
  // and the test requires the searched for version to be returned; therefore, if
  // this value isn't updated then this test could fail all of a sudden if enough
  // releases happen.
  const testReleaseMajorMinor = '1.18'
  // KEEP TEST VALUE UP-TO-DATE WITH testReleaseMajorMinor LATEST PATCH VERSION
  //   test expects this patch version to be the latest to be returned
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
