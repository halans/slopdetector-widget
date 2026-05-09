# SlopDetector Improvements & Next Steps

After taking a step back and reviewing the current implementation, there are a few critical areas—especially regarding security and privacy—that we should address to make this widget production-ready and safe to embed on any site. 

## User Review Required

> [!CAUTION]
> **XSS Vulnerability (Security):** Currently, the widget takes data from the API (`explanation`, `patternName`, etc.) and injects it directly into the DOM using `innerHTML`. If the API response is ever compromised or manipulated, this could lead to a Cross-Site Scripting (XSS) attack on the host website. **This must be fixed by properly escaping the API data.**

> [!WARNING]
> **Data Scraping (Privacy):** The widget currently extracts `document.body.innerText` blindly. If a developer embeds this on a site behind a login (e.g., a dashboard), it could accidentally send sensitive Personal Identifiable Information (PII) to the SlopDetector API. We should allow developers to configure what gets sent.

## Open Questions

> [!NOTE]
> Please review the proposed changes below. Do you agree with adding **Vitest** for testing, and do the privacy configuration options look good to you?

## Proposed Changes

### 1. Security: Prevent XSS
We will create a utility function to safely escape HTML characters before injecting data from the API into our UI templates.
#### [NEW] src/utils.js
- Add an `escapeHtml(unsafeStr)` function.
#### [MODIFY] src/ui.js
- Wrap all dynamic variables (`data.explanation`, `data.classification`, `p.patternName`) in the `escapeHtml` function before adding them to `this.wrapper.innerHTML`.

### 2. Privacy: Configurable Text Extraction
We will update the `SlopDetector.init()` method to accept a configuration object. This allows developers to specifically exclude sensitive parts of their DOM from being sent to the API.
#### [MODIFY] src/main.js
- Update the initialization signature: `SlopDetector.init(containerId, options = {})`
- Add support for an `excludeSelectors` array. Before extracting text, we will clone the DOM (or temporarily hide elements), remove elements matching the excluded selectors, and *then* extract the text.

### 3. Testing Framework: Vitest
Adding a modern, fast test framework is highly recommended to ensure our text extraction logic and HTML escaping utilities work flawlessly. Since we are already using Vite, **Vitest** is the perfect drop-in solution.
#### [MODIFY] package.json
- Add `vitest` and `jsdom` as dev dependencies.
- Add a `"test": "vitest"` script.
#### [NEW] test/utils.test.js
- Unit tests to verify that `escapeHtml` correctly sanitizes malicious inputs like `<script>alert(1)</script>`.
#### [NEW] test/main.test.js
- Unit tests to verify that the privacy features (`excludeSelectors`) correctly strip out private text before it gets sent to the API.

## Verification Plan

### Automated Tests
- Run `npm test` using Vitest to verify all text extraction, DOM manipulation, and HTML escaping works as expected.

### Manual Verification
- Update the `index.html` test page to include a "private" section (e.g., `<div class="secret">My secret email</div>`), configure the widget to exclude it, and verify in the Network Tab that the secret text is *not* sent to the API.
- Verify the UI still renders correctly with the escaped characters.
