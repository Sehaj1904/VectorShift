import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { VariableAutocomplete } from './VariableAutocomplete';
import { getCursorPosition } from '../utils/cursorUtils';

export const SmartTextInput = ({
  value,
  onChange,
  style,
  multiline = false,
  ...props
}) => {
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [autocompletePosition, setAutocompletePosition] = useState({
    x: 0,
    y: 0,
    lineHeight: 20
  });
  const [showPillMode, setShowPillMode] = useState(false);

  const inputRef = useRef(null);
  const overlayRef = useRef(null);
  const cursorPositionRef = useRef(0);
  const scrollTopRef = useRef(0);

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

  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current;
      textarea.style.height = 'auto';
      const maxHeight = 100;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, [value, multiline]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
    input.scrollTop = scrollTopRef.current;
    if (overlayRef.current) {
      overlayRef.current.scrollTop = scrollTopRef.current;
    }
  }, [value]);

  const handleInputChange = (e) => {
    const input = inputRef.current;
    if (!input) return;
    cursorPositionRef.current = input.selectionStart;
    scrollTopRef.current = input.scrollTop;
    onChange?.(e);
  };

  const handlePaste = (e) => {
    const input = inputRef.current;
    if (!input) return;
    e.preventDefault();
    const pasteText = e.clipboardData.getData('text');
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newValue =
      value.substring(0, start) +
      pasteText +
      value.substring(end);
    cursorPositionRef.current = start + pasteText.length;
    scrollTopRef.current = input.scrollTop;
    onChange?.({ target: { value: newValue } });
  };

  const handleClick = () => {
    if (!inputRef.current) return;
    cursorPositionRef.current = getCursorPosition(inputRef.current);
    scrollTopRef.current = inputRef.current.scrollTop;
  };

  const handleVariableSelect = (variable) => {
    const input = inputRef.current;
    if (!input) return;
    const cursorPos = cursorPositionRef.current;
    const textBefore = input.value.substring(0, cursorPos);
    const lastBraceIndex = textBefore.lastIndexOf('{{');
    if (lastBraceIndex !== -1) {
      const newValue =
        input.value.substring(0, lastBraceIndex) +
        variable +
        input.value.substring(cursorPos);
      cursorPositionRef.current = lastBraceIndex + variable.length;
      scrollTopRef.current = input.scrollTop;
      onChange?.({ target: { value: newValue } });
    }
    setAutocompleteOpen(false);
  };

  const handleRemoveVariable = (varIndex) => {
    const variable = variables[varIndex];
    if (!variable) return;
    const newValue =
      value.substring(0, variable.index) +
      value.substring(variable.index + variable.fullMatch.length);
    cursorPositionRef.current = variable.index;
    scrollTopRef.current = inputRef.current?.scrollTop ?? 0;
    onChange?.({ target: { value: newValue } });
  };

  const renderTextWithPills = () => {
    if (!value) return null;
    const parts = [];
    let lastIndex = 0;

    variables.forEach((variable, i) => {
      if (variable.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} style={{ whiteSpace: 'pre-wrap' }}>
            {value.substring(lastIndex, variable.index)}
          </span>
        );
      }

      parts.push(
        <span
          key={`var-${i}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            borderRadius: '3px',
            padding: '2px 6px',
            fontSize: '10px',
            fontFamily: 'monospace'
          }}
        >
          {variable.variable}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveVariable(i);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 2px',
              fontSize: '9px',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            ✕
          </button>
        </span>
      );

      lastIndex = variable.index + variable.fullMatch.length;
    });

    if (lastIndex < value.length) {
      parts.push(
        <span key={`text-${lastIndex}`} style={{ whiteSpace: 'pre-wrap' }}>
          {value.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  const inputStyle = {
    width: '100%',
    padding: '4px 6px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '11px',
    fontFamily: 'inherit',
    outline: 'none',
    ...(multiline && {
      resize: 'none',
      overflowY: 'auto',
      minHeight: '60px',
      maxHeight: '36px'
    }),
    ...(showPillMode && variables.length > 0 ? { opacity: 0 } : {}),
    ...style
  };

  const InputElement = multiline ? 'textarea' : 'input';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <InputElement
        ref={inputRef}
        {...(!multiline && { type: 'text' })}
        value={value || ''}
        onChange={handleInputChange}
        onPaste={handlePaste}
        onClick={handleClick}
        onScroll={(e) => {
          scrollTopRef.current = e.target.scrollTop;
          if (overlayRef.current) {
            overlayRef.current.scrollTop = e.target.scrollTop;
          }
        }}
        onFocus={() => setShowPillMode(false)}
        onBlur={() => setTimeout(() => setShowPillMode(true), 150)}
        style={inputStyle}
        {...props}
      />

      {showPillMode && variables.length > 0 && (
        <div
          ref={overlayRef}
          style={{
            position: 'absolute',
            inset: 0,
            padding: '4px 6px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: '#fff',
            cursor: 'text',
            whiteSpace: 'pre-wrap',
            overflowY: 'auto'
          }}
          onClick={() => {
            setShowPillMode(false);
            inputRef.current?.focus();
          }}
        >
          {renderTextWithPills()}
        </div>
      )}

      {autocompleteOpen && (
        <VariableAutocomplete
          inputRef={inputRef}
          onSelect={handleVariableSelect}
          onClose={() => setAutocompleteOpen(false)}
          position={autocompletePosition}
        />
      )}
    </div>
  );
};
