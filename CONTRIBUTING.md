# Contributing to UnClear

Contributions are welcome — bug fixes, new selectors, improved tests, documentation. Here's how to get started.

## Getting started

```bash
git clone https://github.com/michaelsanford/UnClear.git
cd UnClear
npm install
npm test
```

All tests must pass before submitting a PR.

## What makes a good contribution

- **New selectors or text patterns** — if CLEAR is embedding in a new way, open a bug report or PR with the selector/text and a description of where you saw it
- **Bug fixes** — include a failing test that your fix makes pass
- **Test coverage** — additional test cases for edge cases are always welcome
- **Documentation** — README clarifications, typo fixes, etc.

## Ground rules

UnClear's core design principle is **zero trust expansion**:

- Do not add browser permissions to `manifest.json`
- Do not add network requests to `content.js`
- Do not introduce external dependencies (runtime or build) without discussion
- Keep `host_permissions` empty — the extension should only need `content_scripts` matches

PRs that expand the extension's access or attack surface will not be merged.

## Security vulnerabilities

Please do **not** open a public issue for security vulnerabilities. See [SECURITY.md](SECURITY.md) for the private disclosure process.

## Pull requests

- Keep PRs focused — one concern per PR
- Reference any related issue in the PR description
- CI must be green before review

## Releasing (maintainers)

UnClear is published as an unlisted item on the [Chrome Web Store](https://chromewebstore.google.com/detail/unclear/bilmbccofgemneflaknfifappajdbcco) (ID `bilmbccofgemneflaknfifappajdbcco`).

1. Bump `version` in `manifest.json` (and `package.json` to match). The Web Store rejects uploads whose version isn't higher than the published one.
2. Commit, push to `main`, and wait for CI to go green.
3. Tag the release. The tag must be `v` + the manifest version:
   ```bash
   git tag -a vX.Y -m "vX.Y" && git push origin vX.Y
   ```
   The **Release** workflow runs the tests, checks the tag matches `manifest.json`, then creates a **draft** GitHub release with `unclear-extension-vX.Y.zip` (plus its cosign `.bundle` and a build provenance attestation).
4. Download the zip from the draft release and upload it in the Chrome Web Store Developer Dashboard: UnClear → Package → *Upload new package* → *Submit for review*. Keep visibility unlisted.
5. Once the Web Store publishes the update, open the draft release on GitHub and click **Publish release**.

Uploading to the Web Store is deliberately manual: automating it would mean storing a credential in CI that can publish code to every user.
