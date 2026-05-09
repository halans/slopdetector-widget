import styles from './styles.css?raw';
import { escapeHtml } from './utils.js';

export class SlopUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`SlopDetector: Container with id '${containerId}' not found.`);
      return;
    }

    // Create shadow root to encapsulate styles
    this.shadow = this.container.attachShadow({ mode: 'open' });
    
    // Inject styles
    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    this.shadow.appendChild(styleTag);

    // Render basic structure
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'slop-container';
    this.shadow.appendChild(this.wrapper);

    this.renderLoading();
  }

  renderLoading() {
    this.wrapper.innerHTML = `
      <div class="slop-bubble" title="Analyzing for slop...">
        ...
      </div>
    `;
  }

  hide() {
    this.wrapper.innerHTML = '';
  }

  renderResult(data) {
    if (!data) {
      this.wrapper.innerHTML = `
        <div class="slop-bubble" style="background: #666; font-size: 12px;">
          Err
        </div>
      `;
      return;
    }

    const score = data.confidence_score;
    let colorClass = 'green';
    let textColor = '#059669';
    if (score > 50) {
      colorClass = 'red';
      textColor = '#dc2626';
    } else if (score >= 20) {
      colorClass = 'yellow';
      textColor = '#d97706';
    }

    const patternsHtml = data.patterns_detected && data.patterns_detected.length > 0 
      ? `
        <div class="slop-modal-patterns">
          <div class="slop-modal-patterns-title">Detected Patterns</div>
          ${data.patterns_detected.map(p => `<span class="slop-pattern">${escapeHtml(p.patternName)}</span>`).join('')}
        </div>
      `
      : '';

    this.wrapper.innerHTML = `
      <div class="slop-bubble ${colorClass}" id="slop-trigger" title="Slop Score: ${score}">
        ${score}
      </div>
      <div class="slop-modal-backdrop" id="slop-backdrop">
        <div class="slop-modal" id="slop-modal-content">
          <button class="slop-modal-close" id="slop-close">&times;</button>
          <div class="slop-modal-header">
            <div class="slop-modal-score" style="color: ${textColor};">${score}</div>
            <div>
              <h3 class="slop-modal-title">Slop Score</h3>
              <div class="slop-modal-class">${escapeHtml(data.classification || 'Unknown')}</div>
            </div>
          </div>
          <div class="slop-modal-explanation">
            ${escapeHtml(data.explanation || 'No explanation provided.')}
          </div>
          ${patternsHtml}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const trigger = this.shadow.getElementById('slop-trigger');
    const backdrop = this.shadow.getElementById('slop-backdrop');
    const closeBtn = this.shadow.getElementById('slop-close');
    const modalContent = this.shadow.getElementById('slop-modal-content');

    const openModal = () => backdrop.classList.add('visible');
    const closeModal = () => backdrop.classList.remove('visible');

    trigger.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    
    // Close when clicking outside modal
    backdrop.addEventListener('click', (e) => {
      // If we clicked directly on the backdrop, close it.
      // (The click event target will be the element we attached the listener to)
      if (e.target === backdrop) {
        closeModal();
      }
    });
  }
}
