# SlopDetector Widget Implementation Plan

The goal is to build an embeddable, lightweight Javascript widget that analyzes the text content of any webpage it's plugged into. It will calculate a "slop score" using the `https://api.slopdetector.me/api/analyze` API and display this score in a color-coded bubble. Clicking the bubble will reveal a modal with more details.

## User Review Required

> [!IMPORTANT]
> To ensure the widget's styles don't conflict with the host webpage, I plan to use **Shadow DOM** to encapsulate the widget's HTML and CSS. Let me know if you prefer a different approach.

## Open Questions

> [!WARNING]
> Please clarify the following details before we proceed:
> 1. **API Details**: What is the exact expected request payload (e.g., `POST` with `{"text": "..."}`) and response structure (e.g., `{"score": 42}`) for `https://api.slopdetector.me/api/analyze`?
> 2. **Widget Positioning**: Where should the bubble be positioned on the screen by default? (e.g., fixed at the bottom-right corner).
> 3. **Bundling**: Would you like to use a tool like Vite to bundle and minify the widget into a single, clean `widget.js` file for distribution?

## Proposed Changes

We will set up a modern, lightweight build process to produce a single distributable JavaScript file.

### Project Setup
#### [NEW] package.json
Initialize a basic Node project with Vite as a dev dependency to bundle the widget.
#### [NEW] vite.config.js
Configure Vite to output a single IIFE or UMD format `widget.js` without external CSS files (CSS will be injected).

### Application Logic
#### [NEW] src/main.js
The main entry point. 
- Extracts text from `document.body.innerText`.
- Enforces the length constraints (min 100 characters, max 20,000 characters).
- Calls the API function and passes the result to the UI manager.

#### [NEW] src/api.js
Handles the network request to `https://api.slopdetector.me/api/analyze`. 
- Includes error handling for network issues or API failures.

#### [NEW] src/ui.js
Manages the creation of the Shadow DOM and rendering of the UI.
- **Bubble**: Displays the score. Applies background color based on score thresholds (Green < 20, Yellow 20-50, Red > 50).
- **Modal**: A hidden overlay that becomes visible when the bubble is clicked, showing the score and an explanation.

#### [NEW] src/styles.css
Contains the encapsulated CSS for the bubble and modal components. This will be imported as a raw string and injected into the Shadow DOM.

## Verification Plan

### Automated Tests
- We can serve a dummy `index.html` locally using `npm run dev` to test the widget's visual appearance, layout, and responsiveness.

### Manual Verification
- Test text extraction with various lengths (under 100 chars, over 20k chars).
- Mock the API response to verify the color thresholds (Green, Yellow, Red) update correctly.
- Verify that the modal opens and closes correctly, and that the widget doesn't break or inherit styles from the parent webpage.
