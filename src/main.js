import { fetchSlopScore } from './api.js';
import { SlopUI } from './ui.js';

class SlopDetector {
  /**
   * Initialize the SlopDetector widget.
   * @param {string} containerId - The ID of the div where the widget will be injected.
   * @param {Object} options - Configuration options.
   * @param {string[]} [options.excludeSelectors] - Array of CSS selectors to exclude from text extraction.
   * @param {string[]} [options.includeSelectors] - Array of CSS selectors to strictly include (ignores rest of page).
   */
  static async init(containerId, options = {}) {
    // 1. Initialize UI with loading state
    const ui = new SlopUI(containerId);
    if (!ui.container) return; // Container not found

    // 2. Extract Text
    let rootElements = [document.body];

    if (options.includeSelectors && Array.isArray(options.includeSelectors) && options.includeSelectors.length > 0) {
      rootElements = [];
      options.includeSelectors.forEach(selector => {
        try {
          rootElements.push(...document.querySelectorAll(selector));
        } catch (e) {
          console.warn(`SlopDetector: Invalid include selector '${selector}'`);
        }
      });
    }

    // Clone the roots to avoid modifying the actual page
    const clones = rootElements.map(el => el.cloneNode(true));

    if (options.excludeSelectors && Array.isArray(options.excludeSelectors) && options.excludeSelectors.length > 0) {
      clones.forEach(clone => {
        options.excludeSelectors.forEach(selector => {
          try {
            const elements = clone.querySelectorAll(selector);
            elements.forEach(el => el.remove());
          } catch (e) {
            console.warn(`SlopDetector: Invalid exclude selector '${selector}'`);
          }
        });
      });
    }

    let text = clones.map(clone => clone.innerText || clone.textContent || '').join(' ');

    // Clean up text roughly (remove excess whitespace)
    text = text.replace(/\s+/g, ' ').trim();

    // Enforce constraints
    if (text.length < 100) {
      console.warn('SlopDetector: Text is too short to analyze (minimum 100 characters).');
      ui.hide();
      return;
    }

    if (text.length > 20000) {
      // Truncate text if it's too long
      text = text.substring(0, 20000);
    }

    // 3. Fetch Score
    const data = await fetchSlopScore(text);

    // 4. Update UI
    ui.renderResult(data);
  }
}

// Make it available globally
window.SlopDetector = SlopDetector;
