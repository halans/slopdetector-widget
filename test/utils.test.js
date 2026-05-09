import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../src/utils.js';

describe('escapeHtml', () => {
  it('should escape < and >', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
  });

  it('should escape quotes', () => {
    expect(escapeHtml('"hello" \'world\'')).toBe('&quot;hello&quot; &#039;world&#039;');
  });

  it('should escape ampersands', () => {
    expect(escapeHtml('salt & pepper')).toBe('salt &amp; pepper');
  });

  it('should handle null or undefined safely', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('should convert non-strings to strings', () => {
    expect(escapeHtml(123)).toBe('123');
  });
});
