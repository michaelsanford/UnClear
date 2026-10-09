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
3. Download the `unclear-extension` zip artifact from the CI run, or build it locally:
   ```powershell
   Compress-Archive -Path manifest.json, content.js, icon48.png, icon128.png -DestinationPath unclear-extension.zip -Force
   ```
4. In the Chrome Web Store Developer Dashboard: UnClear → Package → *Upload new package* → *Submit for review*. Keep visibility unlisted.
5. Once published, tag and create the GitHub release:
   ```bash
   git tag -a vX.Y -m "vX.Y" && git push origin vX.Y
   gh release create vX.Y --title "vX.Y" --generate-notes
   ```
   Optionally attach the published `.crx` with `gh release upload vX.Y <id>.crx` and link the store listing in the notes.
