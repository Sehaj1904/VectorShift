// cursorUtils.js
// Utilities for cursor manipulation in text inputs and textareas

/**
 * Get current cursor position in an input or textarea element
 * @param {HTMLElement} element - Input or textarea element
 * @returns {number} Cursor position (0-based index)
 */
export function getCursorPosition(element) {
  if (!element) return 0;

  if (element.selectionStart !== undefined) {
    return element.selectionStart;
  }

  return 0;
}

/**
 * Set cursor position in an input or textarea element
 * @param {HTMLElement} element - Input or textarea element
 * @param {number} position - Position to set cursor (0-based index)
 */
export function setCursorPosition(element, position) {
  if (!element) return;

  if (element.setSelectionRange) {
    element.focus();
    element.setSelectionRange(position, position);
  } else if (element.createTextRange) {
    // IE support
    const range = element.createTextRange();
    range.collapse(true);
    range.moveEnd('character', position);
    range.moveStart('character', position);
    range.select();
  }
}

/**
 * Insert text at current cursor position
 * @param {HTMLElement} element - Input or textarea element
 * @param {string} text - Text to insert
 * @returns {number} New cursor position after insertion
 */
export function insertAtCursor(element, text) {
  if (!element || !text) return getCursorPosition(element);

  const startPos = element.selectionStart;
  const endPos = element.selectionEnd;
  const value = element.value;

  // Insert text at cursor position
  const newValue = value.substring(0, startPos) + text + value.substring(endPos);
  element.value = newValue;

  // Set cursor position after inserted text
  const newPosition = startPos + text.length;
  setCursorPosition(element, newPosition);

  // Trigger input event for React
  const event = new Event('input', { bubbles: true });
  element.dispatchEvent(event);

  return newPosition;
}

/**
 * Get pixel coordinates of cursor position (for dropdown positioning)
 * Uses a mirror div technique for accurate positioning
 * @param {HTMLElement} element - Input or textarea element
 * @param {number} position - Character position (optional, uses current cursor if not provided)
 * @returns {Object} {x, y, lineHeight} coordinates relative to element
 */
export function getCaretCoordinates(element, position) {
  if (!element) return { x: 0, y: 0, lineHeight: 0 };

  const isTextarea = element.tagName === 'TEXTAREA';
  const cursorPosition = position !== undefined ? position : getCursorPosition(element);

  // Create mirror div with same styling
  const mirror = document.createElement('div');
  const computed = window.getComputedStyle(element);

  // Copy styles that affect text layout
  const properties = [
    'direction',
    'boxSizing',
    'width',
    'height',
    'overflowX',
    'overflowY',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderStyle',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',
    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration',
    'letterSpacing',
    'wordSpacing',
    'tabSize',
    'whiteSpace',
    'wordBreak',
    'wordWrap'
  ];

  properties.forEach(prop => {
    mirror.style[prop] = computed[prop];
  });

  // Position mirror off-screen
  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.top = '-9999px';
  mirror.style.left = '-9999px';

  // For textareas, preserve white-space
  if (isTextarea) {
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.wordWrap = 'break-word';
  } else {
    mirror.style.whiteSpace = 'nowrap';
  }

  document.body.appendChild(mirror);

  // Get text before cursor
  const textBeforeCursor = element.value.substring(0, cursorPosition);

  // Set mirror content
  if (isTextarea) {
    mirror.textContent = textBeforeCursor;
  } else {
    mirror.textContent = textBeforeCursor || '.'; // Use dot if empty to get height
  }

  // Create span at cursor position
  const span = document.createElement('span');
  span.textContent = element.value.substring(cursorPosition) || '.';
  mirror.appendChild(span);

  // Get coordinates
  const rect = element.getBoundingClientRect();
  const spanRect = span.getBoundingClientRect();
  const mirrorRect = mirror.getBoundingClientRect();

  // Calculate position relative to input element
  const x = spanRect.left - mirrorRect.left;
  const y = spanRect.top - mirrorRect.top;
  const lineHeight = parseInt(computed.lineHeight, 10) || 20;

  // Clean up
  document.body.removeChild(mirror);

  return {
    x: x + parseInt(computed.borderLeftWidth, 10) + parseInt(computed.paddingLeft, 10),
    y: y + parseInt(computed.borderTopWidth, 10) + parseInt(computed.paddingTop, 10),
    lineHeight
  };
}

/**
 * Get absolute pixel coordinates of cursor (relative to viewport)
 * @param {HTMLElement} element - Input or textarea element
 * @param {number} position - Character position (optional)
 * @returns {Object} {x, y} coordinates relative to viewport
 */
export function getCaretCoordinatesAbsolute(element, position) {
  if (!element) return { x: 0, y: 0 };

  const coords = getCaretCoordinates(element, position);
  const rect = element.getBoundingClientRect();

  return {
    x: rect.left + coords.x + window.scrollX,
    y: rect.top + coords.y + window.scrollY,
    lineHeight: coords.lineHeight
  };
}

/**
 * Get selected text in an input or textarea
 * @param {HTMLElement} element - Input or textarea element
 * @returns {string} Selected text
 */
export function getSelectedText(element) {
  if (!element) return '';

  const start = element.selectionStart;
  const end = element.selectionEnd;

  if (start === end) return '';

  return element.value.substring(start, end);
}

/**
 * Replace selected text
 * @param {HTMLElement} element - Input or textarea element
 * @param {string} replacement - Text to replace selection with
 * @returns {number} New cursor position
 */
export function replaceSelection(element, replacement) {
  if (!element) return 0;

  const startPos = element.selectionStart;
  const endPos = element.selectionEnd;
  const value = element.value;

  // Replace selection
  const newValue = value.substring(0, startPos) + replacement + value.substring(endPos);
  element.value = newValue;

  // Set cursor at end of replacement
  const newPosition = startPos + replacement.length;
  setCursorPosition(element, newPosition);

  // Trigger input event for React
  const event = new Event('input', { bubbles: true });
  element.dispatchEvent(event);

  return newPosition;
}

/**
 * Check if cursor is at a specific position relative to text
 * @param {HTMLElement} element - Input or textarea element
 * @param {string} marker - Text marker to check for (e.g., '{{')
 * @param {number} lookBack - How many characters to look back from cursor
 * @returns {boolean} True if marker found before cursor
 */
export function checkMarkerBeforeCursor(element, marker, lookBack = 10) {
  if (!element || !marker) return false;

  const cursorPos = getCursorPosition(element);
  if (cursorPos < marker.length) return false;

  const start = Math.max(0, cursorPos - lookBack);
  const textBefore = element.value.substring(start, cursorPos);

  return textBefore.endsWith(marker);
}

/**
 * Get word at cursor position
 * @param {HTMLElement} element - Input or textarea element
 * @returns {Object} {word: string, start: number, end: number}
 */
export function getWordAtCursor(element) {
  if (!element) return { word: '', start: 0, end: 0 };

  const cursorPos = getCursorPosition(element);
  const value = element.value;

  // Find word boundaries (non-whitespace characters)
  let start = cursorPos;
  let end = cursorPos;

  // Search backwards for word start
  while (start > 0 && !/\s/.test(value[start - 1])) {
    start--;
  }

  // Search forwards for word end
  while (end < value.length && !/\s/.test(value[end])) {
    end++;
  }

  return {
    word: value.substring(start, end),
    start,
    end
  };
}
