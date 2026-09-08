# HOMEii Flow visual identity

The card and Engine share one visual identity: the HOMEii Flow gold wave mark. Product names distinguish the roles without introducing competing logos:

- **HOMEii Music Flow** — the dashboard card.
- **HOMEii Flow Engine** — the Home Assistant integration.

| Asset | Native size | Use |
|---|---|---|
| Root `logo.png` | 1024 × 512 | Repository header and broad horizontal brand placement |
| Root `icon.png` | 512 × 512 | Compact square identity where a logo would be too small |

Both repositories use identical root assets. Preserve their natural aspect ratio: set a display width, not an unrelated fixed width and height. Do not stretch the mark, add a large surrounding badge, or place text on top of it. The gold color is an accent; use clear neutral text for setup instructions and warnings. Show the wordmark once in each repository introduction and use the compact icon only where it improves identification.

Candidate badges must show the actual beta version and **not released** preparation status. Do not show a stable/latest/download badge for a beta package that does not exist. Stable 5.9.3 links must be explicitly labeled as stable history/downloads.

Engine integration and screensaver assets reuse the same mark. The Home Assistant integration-brand catalog is independent of these files: consistent repository branding does not mean the icon is already accepted/displayed by every HA/HACS version. Review that catalog/distribution step when the owner decides to publish; do not claim official HA endorsement.

Keep a useful alt label on each image. Avoid using an icon alone to communicate setup status, warnings or compatibility requirements.
