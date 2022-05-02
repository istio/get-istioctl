const core = require('@actions/core');
const foo = require('./src/functions')

try {
  osvar = core.getInput("os")
  arch = "-" + core.getInput("arch")
  expr = core.getInput("version")

  const [max, istioctlkey, istiokey] = await foo.getIstioRelease(expr, osvar, arch)
  core.setOutput("version", max.version);
  core.setOutput("major", max.major);
  core.setOutput("minor", max.minor);
  core.setOutput("patch", max.patch);


  core.setOutput("istioctl-url", istioctlkey)
  core.setOutput("istio-url", istiokey)

  // actually get istioctl
  foo.downloadIstioctl(istioctlkey).catch(
      error => core.setFailed(error.message)
  );
} catch (error) {
  core.setFailed(error.message);
}
