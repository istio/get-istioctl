# get-istioctl
This action returns the latest version of istioctl matching your input semver range, operating system, and architecture.  It returns the version components of the selected version, as well as the url at which the binary may be downloaded directly.

## Usage
```
- uses: ./.github/actions/get-istioctl
  id: getit
  with:
    version: "1.11.*"
- name: Get the output time
  run: |
    echo "Selected version ${{ steps.getit.outputs.version }}"
    echo "patch version ${{ steps.getit.outputs.patch }}"
    echo "download link ${{ steps.getit.outputs.istioctl-url }}"
```
