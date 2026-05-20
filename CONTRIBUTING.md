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
