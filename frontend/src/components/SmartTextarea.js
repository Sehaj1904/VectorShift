import { useRef, useEffect, useState } from 'react';
import { VariableAutocomplete } from './VariableAutocomplete';
import { getCaretCoordinatesAbsolute } from '../utils/cursorUtils';

export const SmartTextarea = ({ value, onChange, style, ...props }) => {
  const textareaRef = useRef(null);
  const cursorRef = useRef(0);

  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [autocompletePosition, setAutocompletePosition] = useState({
    x: 0,
    y: 0,
    lineHeight: 20
  });

  const handleChange = (e) => {
    cursorRef.current = e.target.selectionStart;
    onChange?.(e);

    const textBefore = e.target.value.slice(0, cursorRef.current);
    if (textBefore.endsWith('{{')) {
      const coords = getCaretCoordinatesAbsolute(
        textareaRef.current,
        cursorRef.current
      );
      setAutocompletePosition(coords);
      setAutocompleteOpen(true);
    }
  };

  const handleClick = () => {
    if (!textareaRef.current) return;
    cursorRef.current = textareaRef.current.selectionStart;
  };

  const handleKeyUp = (e) => {
    if (
      ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(
        e.key
      )
    ) {
      cursorRef.current = textareaRef.current.selectionStart;
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    requestAnimationFrame(() => {
      textarea.setSelectionRange(cursorRef.current, cursorRef.current);
    });
  }, [value]);

  const handleVariableSelect = (variable) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = cursorRef.current;
    const textBefore = textarea.value.slice(0, cursorPos);
    const braceIndex = textBefore.lastIndexOf('{{');

    if (braceIndex === -1) return;

    const newValue =
      textarea.value.slice(0, braceIndex) +
      variable +
      textarea.value.slice(cursorPos);

    const newCursor = braceIndex + variable.length;
    cursorRef.current = newCursor;

    onChange?.({ target: { value: newValue } });

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursor, newCursor);
    });

    setAutocompleteOpen(false);
  };

  const handleAutocompleteClose = () => {
    setAutocompleteOpen(false);
    textareaRef.current?.focus();
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onClick={handleClick}
        onKeyUp={handleKeyUp}
        style={{
          width: '100%',
          minHeight: '80px',
          maxHeight: '220px',
          padding: '8px',
          paddingRight: '14px',
          border: '1px solid #e2e8ff',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'monospace',
          resize: 'vertical',
          outline: 'none',
          overflowY: 'scroll',
          scrollbarGutter: 'stable',
          WebkitOverflowScrolling: 'touch',
          boxSizing: 'border-box',
          backgroundColor: '#fff',
          ...style
        }}
        {...props}
      />

      {autocompleteOpen && (
        <VariableAutocomplete
          inputRef={textareaRef}
          cursorPosition={cursorRef.current}
          onSelect={handleVariableSelect}
          onClose={handleAutocompleteClose}
          position={autocompletePosition}
        />
      )}
    </div>
  );
};
