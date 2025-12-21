
import { useState } from 'react';
import { useStore } from '../store';
import { executePipeline } from '../execution/PipelineExecutor';

export const RunPipelineModal = ({ isOpen, onClose }) => {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const startExecution = useStore((state) => state.startExecution);
  const updateExecutionResult = useStore((state) => state.updateExecutionResult);
  const updateExecutionError = useStore((state) => state.updateExecutionError);
  const advanceExecutionIndex = useStore((state) => state.advanceExecutionIndex);
  const completeExecution = useStore((state) => state.completeExecution);

  const [inputs, setInputs] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const inputNodes = nodes.filter(node => node.type === 'customInput');

  const handleInputChange = (nodeId, value) => {
    setInputs(prev => ({ ...prev, [nodeId]: value }));
  };

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setResults(null);
    const executionResults = {};

    try {
      await executePipeline(nodes, edges, {
        onNodeStart: (nodeId, index) => {
          if (index === 0) {
            const executionOrder = nodes.map(n => n.id);
            startExecution(executionOrder);
          }
        },
        onNodeComplete: (nodeId, result) => {
          executionResults[nodeId] = result;
          updateExecutionResult(nodeId, result);
          advanceExecutionIndex();
        },
        onNodeError: (nodeId, err) => {
          updateExecutionError(nodeId, err);
          setError(`Error in node ${nodeId}: ${err}`);
        },
        onComplete: () => {
          completeExecution();
          setResults(executionResults);
          setIsRunning(false);
        }
      });
    } catch (err) {
      setError(err.message);
      completeExecution();
      setIsRunning(false);
    }
  };

  const handleClose = () => {
    setInputs({});
    setResults(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '600px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            Run Pipeline
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#6b7280',
              fontSize: '20px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1
        }}>
          {inputNodes.length > 0 && !results && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px'
              }}>
                Inputs
              </h3>
              {inputNodes.map(node => (
                <div key={node.id} style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '6px'
                  }}>
                    {node.data.nodeName || node.id}
                  </label>
                  <textarea
                    value={inputs[node.id] || ''}
                    onChange={(e) => handleInputChange(node.id, e.target.value)}
                    placeholder="e.g., What is vectorshift?"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '13px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      minHeight: '80px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {results && (
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px'
              }}>
                Outputs
              </h3>
              {nodes.filter(node => node.type === 'customOutput').map(node => {
                const result = results[node.id];
                return (
                  <div key={node.id} style={{
                    marginBottom: '16px',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {node.data.nodeName || node.id}
                    </div>
                    {result && Object.entries(result).map(([key, value]) => (
                      <div key={key} style={{ marginBottom: '8px' }}>
                        <div style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          marginBottom: '4px'
                        }}>
                          {key}:
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#111827',
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          backgroundColor: '#ffffff',
                          padding: '8px',
                          borderRadius: '4px'
                        }}>
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}

              <div style={{ marginTop: '24px' }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '12px'
                }}>
                  All Node Results
                </h3>
                {nodes.map(node => {
                  const result = results[node.id];
                  if (!result) return null;
                  return (
                    <div key={node.id} style={{
                      marginBottom: '12px',
                      padding: '12px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '6px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#15803d',
                        marginBottom: '6px'
                      }}>
                        {node.data.nodeName || node.id} ({node.type})
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#166534',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {JSON.stringify(result, null, 2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#dc2626',
                marginBottom: '4px'
              }}>
                Error
              </div>
              <div style={{
                fontSize: '12px',
                color: '#991b1b',
                fontFamily: 'monospace'
              }}>
                {error}
              </div>
            </div>
          )}

          {inputNodes.length === 0 && !results && (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '13px'
            }}>
              No input nodes found. Add an Input node to provide test data.
            </div>
          )}
        </div>

        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          {results ? (
            <button
              onClick={() => {
                setResults(null);
                setInputs({});
              }}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#6366f1',
                backgroundColor: '#ffffff',
                border: '1px solid #6366f1',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Run Again
            </button>
          ) : (
            <>
              <button
                onClick={handleClose}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRun}
                disabled={isRunning}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  backgroundColor: isRunning ? '#9ca3af' : '#6366f1',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isRunning ? (
                  <>
                    <div style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid #ffffff',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Running...
                  </>
                ) : (
                  'Run'
                )}
              </button>
            </>
          )}
        </div>

        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};
