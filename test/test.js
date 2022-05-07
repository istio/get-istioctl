import AsyncTestUtil from 'async-test-util'
import {maybeDownloadIstioctl, getIstioRelease} from'../src/functions.js'
import assert from 'assert'
import validUrl from 'valid-url'
import fs from 'fs';
import {join} from 'path'

function getLocalDir(dir)  {
  const localDir = join(
      ".",
      'runner',
      join(
          Math.random()
              .toString(36)
              .substring(7)
      ),
      dir
  )
  return localDir
}
const timeout = 30000
it('should wait until server is online', async function() {
  const tempPath =  getLocalDir('temp')
  const cachePath = getLocalDir('tools')
  process.env['RUNNER_TEMP'] = tempPath
  process.env['RUNNER_TOOL_CACHE'] = cachePath
  this.timeout(timeout)
  var max, istioctlkey, istiokey
  const doGetRelease = async() => {
    [max, istioctlkey, istiokey] = await getIstioRelease('1.11.*', 'local', '-local')
    await maybeDownloadIstioctl(istioctlkey, max.raw)
    assert.equal(max.version, "1.11.8")
    assert.ok(validUrl.isUri(istiokey))
    assert.ok(validUrl.isUri(istioctlkey))
    // TODO: check that istioctl is on the path
    return true
  }
  await AsyncTestUtil.waitUntil(doGetRelease, timeout)

  // TODO: add assertions and cleanup for istioctl file

});
