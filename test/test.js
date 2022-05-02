import AsyncTestUtil from 'async-test-util'
import {downloadIstioctl, getIstioRelease} from'../src/functions.js'
import assert from 'assert'
import validUrl from 'valid-url'
import fs from 'fs';

const timeout = 30000
it('should wait until server is online', async function() {
  this.timeout(timeout)
  var max, istioctlkey, istiokey
  const doGetRelease = async() => {
    [max, istioctlkey, istiokey] = await getIstioRelease('1.11.*', 'local', '-local')
    await downloadIstioctl(istioctlkey)
    assert.equal(max.version, "1.11.8")
    assert.ok(validUrl.isUri(istiokey))
    assert.ok(validUrl.isUri(istioctlkey))
    fs.accessSync('istioctl', fs.constants.R_OK | fs.constants.X_OK);
    // cleanup
    fs.unlinkSync("istioctl")
    return true
  }
  await AsyncTestUtil.waitUntil(doGetRelease, timeout)

  // TODO: add assertions and cleanup for istioctl file

});
