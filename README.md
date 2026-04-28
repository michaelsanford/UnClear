# UnClear

![UnClear logo](icon128.png)

A Chromium extension that silently removes CLEAR identity verification prompts and banners from LinkedIn and other sites. Works in Edge, Chrome, Brave, and other Chromium-based browsers.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/michaelsanford/UnClear/actions/workflows/ci.yml/badge.svg)](https://github.com/michaelsanford/UnClear/actions/workflows/ci.yml)

---

## What it does

CLEAR (clearme.com) embeds identity-verification prompts, iframes, and "Verify with CLEAR" banners on LinkedIn and affiliated sites. UnClear detects and removes these elements before they render — no clicks required.

**Detected and removed:**

- Iframes loading clearme.com / clearidentity.com
- LinkedIn "Verify now" and "Verify with CLEAR" links
- "Add verification badge" profile prompts
- Modals, banners, and overlays identified by CLEAR-specific selectors or text

## How it works

`content.js` is injected at `document_start` (before the page renders) and:

1. **Selector scan** — removes any element matching 16 CSS selectors targeting known CLEAR UI patterns
2. **Text scan** — walks the DOM and removes elements whose own text matches any of 7 case-insensitive CLEAR phrases
3. **Smart removal** — climbs the DOM to find the appropriate container (dialog, modal, banner) to remove rather than just the innermost element
4. **Continuous watch** — a `MutationObserver` re-runs the scan whenever new nodes are added, handling LinkedIn's SPA navigation

## Privacy

- **Zero permissions** — the extension requests no special browser permissions
- **No network requests** — content.js is entirely local; nothing is sent anywhere
- **No data collection** — the extension reads the DOM and removes nodes; that's it

## Installation

### From source (manual)

1. Clone or download this repository
2. Open Edge and navigate to `edge://extensions`
3. Enable **Developer mode** (toggle in the bottom-left corner)
4. Click **Load unpacked** and select the project folder
5. The extension is now active on LinkedIn and Clear-related sites

### Extension zip (CI artifact)

Each CI run produces an `unclear-extension.zip` artifact (see the Actions tab) ready for sideloading or submission to the Edge Add-ons store.

## Development

### Prerequisites

- Node.js 18+
- npm

### Run tests

```bash
npm install
npm test
```

Tests use [Jest](https://jestjs.io/) with a jsdom environment and cover selector validity, text pattern matching, DOM traversal logic, and integration scenarios for `scanAndRemove`.

### Regenerate icons

Open `generate-icons.html` in a browser, then right-click each canvas to save the PNG files.

## Project structure

```
UnClear/
├── manifest.json          Extension configuration (Manifest V3)
├── content.js             Core blocking logic
├── icon48.png             Extension icon (48×48)
├── icon128.png            Extension icon (128×128)
├── generate-icons.html    Developer utility for regenerating icons
├── tests/
│   └── content.test.js    Jest test suite
└── .github/
    └── workflows/
        └── ci.yml         CI: test → validate manifest → pack artifact
```

## GitHub Actions

| Workflow | Trigger | What it does |
|---|---|---|
| **Tests** | push / PR | Runs the Jest test suite |
| **Validate manifest** | push / PR | Checks `manifest.json` is valid JSON with `manifest_version: 3` |
| **Pack extension** | after tests pass | Zips the extension files and uploads as a build artifact |

## License

[MIT](LICENSE) © 2026 Michael Sanford
