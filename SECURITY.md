# Security Policy

## Supported Versions

Only the latest release on `main` is actively supported with security updates.

| Version | Supported |
| ------- | --------- |
| latest  | ✅        |
| older   | ❌        |

## Security Model

UnClear is designed with a minimal attack surface by intention:

- **Zero browser permissions** — no access to tabs, history, storage, or network
- **No network requests** — all logic is local DOM manipulation
- **No data collection** — nothing is read, stored, or transmitted
- **Content script only** — runs in an isolated world, scoped to `*.linkedin.com`
- **No background service worker** — active only on matching pages

## Reporting a Vulnerability

Thank you for taking the time to responsibly disclose — it's genuinely appreciated.

Please **do not** open a public GitHub issue for security vulnerabilities.

Report privately via GitHub Security Advisories at 
<https://github.com/michaelsanford/UnClear/security/advisories/new>

Include in your report:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

| Stage           | Target              |
| --------------- | ------------------- |
| Acknowledgement | 10 business days    |
| Assessment      | 21 business days    |
| Fix / Decision  | Best effort         |

Status updates will be communicated through the advisory thread.

## Disclosure

Once a fix is ready, a public disclosure date will be agreed upon with the reporter before releasing. If no response is received within 14 days of the fix being available, disclosure will proceed unilaterally.

CVEs will not be requested for issues limited to this extension.

## Scope

**In scope:**

- Code changes (PRs or merged commits) that introduce data exfiltration or unexpected network requests
- Selector or regex logic that triggers unintended behavior outside of CLEAR-related elements
- Manifest changes that silently expand permissions or `host_permissions`
- Vulnerable npm dev-dependencies (build/test chain)
- Supply-chain risks from contributions

**Out of scope:**

- Vulnerabilities in LinkedIn, CLEAR, or any third-party service — please report those to the respective vendors
- The extension behaving exactly as documented (removing CLEAR verification elements)
- Issues arising from user-modified versions of the extension
