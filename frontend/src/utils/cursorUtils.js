export function getCursorPosition(element) {
  if (!element) return 0;

  if (element.selectionStart !== undefined) {
    return element.selectionStart;
  }

  return 0;
}

export function setCursorPosition(element, position) {
  if (!element) return;

  if (element.setSelectionRange) {
    element.focus();
    element.setSelectionRange(position, position);
  } else if (element.createTextRange) {
    const range = element.createTextRange();
    range.collapse(true);
    range.moveEnd('character', position);
    range.moveStart('character', position);
    range.select();
  }
}

export function insertAtCursor(element, text) {
  if (!element || !text) return getCursorPosition(element);

  const startPos = element.selectionStart;
  const endPos = element.selectionEnd;
  const value = element.value;

  const newValue = value.substring(0, startPos) + text + value.substring(endPos);
  element.value = newValue;

  const newPosition = startPos + text.length;
  setCursorPosition(element, newPosition);

  const event = new Event('input', { bubbles: true });
  element.dispatchEvent(event);

  return newPosition;
}

export function getCaretCoordinates(element, position) {
  if (!element) return { x: 0, y: 0, lineHeight: 0 };

  const isTextarea = element.tagName === 'TEXTAREA';
  const cursorPosition = position !== undefined ? position : getCursorPosition(element);

  const mirror = document.createElement('div');
  const computed = window.getComputedStyle(element);

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

  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.top = '-9999px';
  mirror.style.left = '-9999px';

  if (isTextarea) {
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.wordWrap = 'break-word';
  } else {
    mirror.style.whiteSpace = 'nowrap';
  }

  document.body.appendChild(mirror);

  const textBeforeCursor = element.value.substring(0, cursorPosition);

  if (isTextarea) {
    mirror.textContent = textBeforeCursor;
  } else {
    mirror.textContent = textBeforeCursor || '.';
  }

  const span = document.createElement('span');
  span.textContent = element.value.substring(cursorPosition) || '.';
  mirror.appendChild(span);

  const spanRect = span.getBoundingClientRect();
  const mirrorRect = mirror.getBoundingClientRect();

  const x = spanRect.left - mirrorRect.left;
  const y = spanRect.top - mirrorRect.top;
  const lineHeight = parseInt(computed.lineHeight, 10) || 20;

  document.body.removeChild(mirror);

  return {
    x: x + parseInt(computed.borderLeftWidth, 10) + parseInt(computed.paddingLeft, 10),
    y: y + parseInt(computed.borderTopWidth, 10) + parseInt(computed.paddingTop, 10),
    lineHeight
  };
}

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

export function getSelectedText(element) {
  if (!element) return '';

  const start = element.selectionStart;
  const end = element.selectionEnd;

  if (start === end) return '';

  return element.value.substring(start, end);
}

export function replaceSelection(element, replacement) {
  if (!element) return 0;

  const startPos = element.selectionStart;
  const endPos = element.selectionEnd;
  const value = element.value;

  const newValue = value.substring(0, startPos) + replacement + value.substring(endPos);
  element.value = newValue;

  const newPosition = startPos + replacement.length;
  setCursorPosition(element, newPosition);

  const event = new Event('input', { bubbles: true });
  element.dispatchEvent(event);

  return newPosition;
}

export function checkMarkerBeforeCursor(element, marker, lookBack = 10) {
  if (!element || !marker) return false;

  const cursorPos = getCursorPosition(element);
  if (cursorPos < marker.length) return false;

  const start = Math.max(0, cursorPos - lookBack);
  const textBefore = element.value.substring(start, cursorPos);

  return textBefore.endsWith(marker);
}

export function getWordAtCursor(element) {
  if (!element) return { word: '', start: 0, end: 0 };

  const cursorPos = getCursorPosition(element);
  const value = element.value;

  let start = cursorPos;
  let end = cursorPos;

  while (start > 0 && !/\s/.test(value[start - 1])) {
    start--;
  }

  while (end < value.length && !/\s/.test(value[end])) {
    end++;
  }

  return {
    word: value.substring(start, end),
    start,
    end
  };
}
