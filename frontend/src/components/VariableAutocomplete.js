
import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';

export const VariableAutocomplete = ({
  inputRef,
  cursorPosition,
  onSelect,
  onClose,
  position
}) => {
  const getAvailableVariables = useStore((state) => state.getAvailableVariables);
  const [step, setStep] = useState('nodes'); 
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [filterText, setFilterText] = useState('');
  const dropdownRef = useRef(null);

  const availableNodes = getAvailableVariables();

  const filteredNodes = filterText
    ? availableNodes.filter(node =>
        node.nodeName.toLowerCase().includes(filterText.toLowerCase())
      )
    : availableNodes;

  const currentList = step === 'nodes' ? filteredNodes : (selectedNode?.outputFields || []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => Math.min(prev + 1, currentList.length - 1));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => Math.max(prev - 1, 0));
          break;

        case 'Enter':
          e.preventDefault();
          if (currentList.length > 0 && highlightedIndex < currentList.length) {
            handleSelect(currentList[highlightedIndex]);
          }
          break;

        case 'Escape':
          e.preventDefault();
          onClose();
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [highlightedIndex, currentList, step]);

  useEffect(() => {
    if (!inputRef.current) return;

    const handleInput = (e) => {
      if (step === 'nodes') {
        const cursorPos = inputRef.current.selectionStart;
        const value = inputRef.current.value;

        const beforeCursor = value.substring(0, cursorPos);
        const match = beforeCursor.match(/\{\{([^}]*)$/);
        if (match) {
          setFilterText(match[1]);
        }
      }
    };

    inputRef.current.addEventListener('input', handleInput);
    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener('input', handleInput);
      }
    };
  }, [inputRef, step]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredNodes.length, step]);

  useEffect(() => {
    if (dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (item) => {
    if (step === 'nodes') {
      setSelectedNode(item);
      setStep('fields');
      setHighlightedIndex(0);
    } else {
      const variable = `{{${selectedNode.nodeName}.${item.name}}}`;
      onSelect(variable);
      onClose();
    }
  };

  const handleBack = () => {
    if (step === 'fields') {
      setStep('nodes');
      setSelectedNode(null);
      setHighlightedIndex(0);
    }
  };

  if (currentList.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y + position.lineHeight + 4,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8ff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '8px',
        maxHeight: '300px',
        overflowY: 'auto',
        zIndex: 10000,
        minWidth: '280px'
      }}
    >
      <div style={{
        fontSize: '11px',
        fontWeight: 600,
        color: '#374151',
        marginBottom: '8px',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {step === 'fields' && (
          <button
            onClick={handleBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              fontSize: '14px',
              color: '#667eea'
            }}
          >
            ←
          </button>
        )}
        <span>
          {step === 'nodes' ? 'Select a node:' : `Select output from ${selectedNode.nodeName}:`}
        </span>
      </div>

      <div>
        {currentList.map((item, index) => {
          const isHighlighted = index === highlightedIndex;

          if (step === 'nodes') {
            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: isHighlighted ? '#f3f4f6' : 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2px'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#111827' }}>
                  {item.nodeName}
                </span>
                <span style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5'
                }}>
                  {getNodeTypeLabel(item.type)}
                </span>
              </div>
            );
          } else {
            return (
              <div
                key={item.name}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: isHighlighted ? '#f3f4f6' : 'transparent',
                  marginBottom: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#111827' }}>
                    {item.name}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    fontWeight: 500
                  }}>
                    {item.type}
                  </span>
                </div>
                {item.description && (
                  <div style={{ fontSize: '10px', color: '#6b7280', lineHeight: '1.4' }}>
                    {item.description}
                  </div>
                )}
              </div>
            );
          }
        })}
      </div>

      <div style={{
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid #e5e7eb',
        fontSize: '10px',
        color: '#6b7280',
        padding: '4px 8px'
      }}>
        ↑↓ Navigate • Enter to select • Esc to close
      </div>
    </div>
  );
};

function getNodeTypeLabel(type) {
  const labels = {
    'customInput': 'Input',
    'llm': 'LLM',
    'text': 'Text',
    'knowledgeBase': 'KB',
    'customOutput': 'Output'
  };
  return labels[type] || type;
}
