// SmartTextInput.js
// Enhanced input with {{ variable autocomplete support and variable pills

import { useState, useRef, useEffect } from 'react';
import { VariableAutocomplete } from './VariableAutocomplete';
import { getCursorPosition, getCaretCoordinatesAbsolute } from '../utils/cursorUtils';

export const SmartTextInput = ({ value, onChange, style, ...props }) => {
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [autocompletePosition, setAutocompletePosition] = useState({ x: 0, y: 0, lineHeight: 20 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showPillMode, setShowPillMode] = useState(false);
  const inputRef = useRef(null);

  // Parse value to extract variable references
  const parseVariables = (text) => {
    if (!text) return [];
    const regex = /{{([^}]+)}}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        fullMatch: match[0],
        variable: match[1],
        index: match.index
      });
    }
    return matches;
  };

  const variables = parseVariables(value);

  // Detect {{ keystroke and cursor position changes
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleInput = (e) => {
      const cursorPos = getCursorPosition(input);
      setCursorPosition(cursorPos);

      // Check if {{ was just typed
      const textBefore = input.value.substring(0, cursorPos);
      if (textBefore.endsWith('{{')) {
        // Get cursor coordinates for dropdown positioning
        const coords = getCaretCoordinatesAbsolute(input, cursorPos);
        setAutocompletePosition(coords);
        setAutocompleteOpen(true);
      }
    };

    const handleClick = () => {
      const cursorPos = getCursorPosition(input);
      setCursorPosition(cursorPos);
    };

    const handleKeyUp = (e) => {
      // Update cursor position on arrow keys, home, end, etc.
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        const cursorPos = getCursorPosition(input);
        setCursorPosition(cursorPos);
      }
    };

    input.addEventListener('input', handleInput);
    input.addEventListener('click', handleClick);
    input.addEventListener('keyup', handleKeyUp);

    return () => {
      input.removeEventListener('input', handleInput);
      input.removeEventListener('click', handleClick);
      input.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle variable selection from autocomplete
  const handleVariableSelect = (variable) => {
    const input = inputRef.current;
    if (!input) return;

    // Find and remove the {{ that triggered autocomplete
    const textBefore = input.value.substring(0, cursorPosition);
    const lastBraceIndex = textBefore.lastIndexOf('{{');

    if (lastBraceIndex !== -1) {
      // Remove the {{ and insert the complete variable
      const newValue =
        input.value.substring(0, lastBraceIndex) +
        variable +
        input.value.substring(cursorPosition);

      // Update value through onChange
      if (onChange) {
        onChange({ target: { value: newValue } });
      }

      // Set cursor after inserted variable
      setTimeout(() => {
        const newPosition = lastBraceIndex + variable.length;
        input.focus();
        input.setSelectionRange(newPosition, newPosition);
        setCursorPosition(newPosition);
      }, 0);
    }

    setAutocompleteOpen(false);
  };

  // Handle autocomplete close
  const handleAutocompleteClose = () => {
    setAutocompleteOpen(false);
    // Return focus to input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle variable pill removal
  const handleRemoveVariable = (varIndex) => {
    const variable = variables[varIndex];
    if (!variable) return;

    // Remove the {{variable}} from the value
    const newValue = value.substring(0, variable.index) + value.substring(variable.index + variable.fullMatch.length);

    if (onChange) {
      onChange({ target: { value: newValue } });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Input field */}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={onChange}
          onFocus={() => setShowPillMode(false)}
          onBlur={() => setTimeout(() => setShowPillMode(true), 150)}
          style={{
            width: '100%',
            padding: '4px 6px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '11px',
            outline: 'none',
            transition: 'border-color 0.2s',
            ...(showPillMode && variables.length > 0 ? { opacity: 0 } : {}),
            ...style
          }}
          {...props}
        />

        {/* Pill overlay when not focused */}
        {showPillMode && variables.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              padding: '4px 6px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#ffffff',
              pointerEvents: 'auto',
              cursor: 'text'
            }}
            onClick={() => {
              setShowPillMode(false);
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }}
          >
            {variables.map((variable, index) => (
              <div
                key={index}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontWeight: 500,
                  fontFamily: 'monospace'
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 7h10v3l4 4-4 4v3H7v-3l-4-4 4-4V7z"/>
                </svg>
                {variable.variable}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveVariable(index);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    color: '#1e40af',
                    opacity: 0.6,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {autocompleteOpen && (
        <VariableAutocomplete
          inputRef={inputRef}
          cursorPosition={cursorPosition}
          onSelect={handleVariableSelect}
          onClose={handleAutocompleteClose}
          position={autocompletePosition}
        />
      )}
    </div>
  );
};
