/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import '../src/main.js'; // Imports and sets window.SlopDetector
import * as api from '../src/api.js';

describe('SlopDetector Privacy', () => {
  beforeEach(() => {
    // Set up document body
    document.body.innerHTML = `
      <div id="slop-widget-container"></div>
      <div class="public-content">This is public text that should be analyzed. It needs to be at least 100 characters long to pass the length constraint, so I am writing some extra text here.</div>
      <div class="private-content" id="secret">This is my secret password!</div>
    `;

    // Mock the API to avoid real network requests
    vi.spyOn(api, 'fetchSlopScore').mockResolvedValue({
      confidence_score: 42,
      classification: "Likely Human",
      patterns_detected: []
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should include all text if no excludeSelectors are provided', async () => {
    await window.SlopDetector.init('slop-widget-container');
    
    // Check the argument passed to the API
    const capturedText = api.fetchSlopScore.mock.calls[0][0];
    expect(capturedText).toContain('public text');
    expect(capturedText).toContain('secret password!');
  });

  it('should exclude text matching excludeSelectors', async () => {
    await window.SlopDetector.init('slop-widget-container', {
      excludeSelectors: ['.private-content']
    });
    
    // Check the argument passed to the API
    const capturedText = api.fetchSlopScore.mock.calls[0][0];
    expect(capturedText).toContain('public text');
    expect(capturedText).not.toContain('secret password!');
  });

  it('should handle invalid selectors gracefully', async () => {
    // Should not throw, should still extract other text
    await window.SlopDetector.init('slop-widget-container', {
      excludeSelectors: [':::invalid:::']
    });
    
    const capturedText = api.fetchSlopScore.mock.calls[0][0];
    expect(capturedText).toContain('public text');
    expect(capturedText).toContain('secret password!');
  });

  it('should strictly include text matching includeSelectors', async () => {
    await window.SlopDetector.init('slop-widget-container', {
      includeSelectors: ['.public-content']
    });
    
    const capturedText = api.fetchSlopScore.mock.calls[0][0];
    expect(capturedText).toContain('public text');
    expect(capturedText).not.toContain('secret password!');
  });

  it('should respect both includeSelectors and excludeSelectors', async () => {
    // Add a mixed container with enough text to pass the 100 char limit
    document.body.innerHTML += `
      <div class="mixed-content">
        <span class="keep">Keep this text! We need to make sure this is long enough so that the slop detector doesn't skip the analysis.</span>
        <span class="drop">Drop this text! It contains top secret private information that we do not want to be sent to the API.</span>
      </div>
    `;

    await window.SlopDetector.init('slop-widget-container', {
      includeSelectors: ['.mixed-content'],
      excludeSelectors: ['.drop']
    });
    
    const capturedText = api.fetchSlopScore.mock.calls[0][0];
    expect(capturedText).toContain('Keep this text!');
    expect(capturedText).not.toContain('Drop this text!');
    expect(capturedText).not.toContain('public text');
  });
});
