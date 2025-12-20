// SmartTextarea.js
// Enhanced textarea with {{ variable autocomplete support

import { useState, useRef, useEffect } from 'react';
import { VariableAutocomplete } from './VariableAutocomplete';
import { getCursorPosition, getCaretCoordinatesAbsolute } from '../utils/cursorUtils';

export const SmartTextarea = ({ value, onChange, style, ...props }) => {
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [autocompletePosition, setAutocompletePosition] = useState({ x: 0, y: 0, lineHeight: 20 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);

  // Detect {{ keystroke and cursor position changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = (e) => {
      const cursorPos = getCursorPosition(textarea);
      setCursorPosition(cursorPos);

      // Check if {{ was just typed - DISABLED
      // const textBefore = textarea.value.substring(0, cursorPos);
      // if (textBefore.endsWith('{{')) {
      //   // Get cursor coordinates for dropdown positioning
      //   const coords = getCaretCoordinatesAbsolute(textarea, cursorPos);
      //   setAutocompletePosition(coords);
      //   setAutocompleteOpen(true);
      // }
    };

    const handleClick = () => {
      const cursorPos = getCursorPosition(textarea);
      setCursorPosition(cursorPos);
    };

    const handleKeyUp = (e) => {
      // Update cursor position on arrow keys, home, end, etc.
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
        const cursorPos = getCursorPosition(textarea);
        setCursorPosition(cursorPos);
      }
    };

    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('click', handleClick);
    textarea.addEventListener('keyup', handleKeyUp);

    return () => {
      textarea.removeEventListener('input', handleInput);
      textarea.removeEventListener('click', handleClick);
      textarea.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle variable selection from autocomplete
  const handleVariableSelect = (variable) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Find and remove the {{ that triggered autocomplete
    const textBefore = textarea.value.substring(0, cursorPosition);
    const lastBraceIndex = textBefore.lastIndexOf('{{');

    if (lastBraceIndex !== -1) {
      // Remove the {{ and insert the complete variable
      const newValue =
        textarea.value.substring(0, lastBraceIndex) +
        variable +
        textarea.value.substring(cursorPosition);

      // Update value through onChange
      if (onChange) {
        onChange({ target: { value: newValue } });
      }

      // Set cursor after inserted variable
      setTimeout(() => {
        const newPosition = lastBraceIndex + variable.length;
        textarea.focus();
        textarea.setSelectionRange(newPosition, newPosition);
        setCursorPosition(newPosition);
      }, 0);
    }

    setAutocompleteOpen(false);
  };

  // Handle autocomplete close
  const handleAutocompleteClose = () => {
    setAutocompleteOpen(false);
    // Return focus to textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          minHeight: '80px',
          padding: '8px',
          border: '1px solid #e2e8ff',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'monospace',
          resize: 'vertical',
          outline: 'none',
          transition: 'border-color 0.2s',
          ...style
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#667eea';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e2e8ff';
        }}
        {...props}
      />

      {autocompleteOpen && (
        <VariableAutocomplete
          inputRef={textareaRef}
          cursorPosition={cursorPosition}
          onSelect={handleVariableSelect}
          onClose={handleAutocompleteClose}
          position={autocompletePosition}
        />
      )}
    </div>
  );
};
