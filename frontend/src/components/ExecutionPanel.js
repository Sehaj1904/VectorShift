// ExecutionPanel.js
// Component for displaying pipeline execution results in the Node Details Panel

import { useStore } from '../store';

export const ExecutionPanel = ({ nodeId }) => {
  const executionState = useStore((state) => state.executionState);
  const { isExecuting, results, errors, executionOrder, currentNodeIndex } = executionState;

  const nodeResult = results[nodeId];
  const nodeError = errors[nodeId];
  const nodeIndex = executionOrder.indexOf(nodeId);
  const hasExecuted = nodeIndex !== -1 && nodeIndex < currentNodeIndex;
  const isCurrentlyExecuting = nodeIndex === currentNodeIndex && isExecuting;

  // If pipeline hasn't been run yet
  if (!isExecuting && executionOrder.length === 0) {
    return (
      <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
          Click "Run Pipeline" in the toolbar to execute this pipeline and see results here.
        </p>
      </div>
    );
  }

  // If node is currently executing
  if (isCurrentlyExecuting) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #3b82f6',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e40af' }}>
              Executing...
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#1e40af', margin: 0 }}>
            Processing node {nodeIndex + 1} of {executionOrder.length}
          </p>
        </div>

        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // If node encountered an error
  if (nodeError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>
              Execution Failed
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#991b1b', margin: 0, fontFamily: 'monospace' }}>
            {nodeError}
          </p>
        </div>
      </div>
    );
  }

  // If node has executed successfully
  if (hasExecuted && nodeResult) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '18px' }}>✓</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#15803d' }}>
              Executed Successfully
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#15803d', margin: 0 }}>
            Node {nodeIndex + 1} of {executionOrder.length}
          </p>
        </div>

        {/* Display results */}
        <div>
          <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
            Results:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(nodeResult).map(([key, value]) => (
              <ResultField key={key} fieldName={key} value={value} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Node hasn't executed yet (waiting in queue)
  if (nodeIndex !== -1 && nodeIndex >= currentNodeIndex) {
    return (
      <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '18px' }}>⏳</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#92400e' }}>
            Waiting to Execute
          </span>
        </div>
        <p style={{ fontSize: '11px', color: '#92400e', margin: 0 }}>
          Node {nodeIndex + 1} of {executionOrder.length} - Waiting for upstream nodes
        </p>
      </div>
    );
  }

  // Default: no execution info
  return (
    <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
        No execution data available for this node.
      </p>
    </div>
  );
};

// Component to display individual result fields
const ResultField = ({ fieldName, value }) => {
  const isLongText = typeof value === 'string' && value.length > 200;
  const isArray = Array.isArray(value);
  const isObject = typeof value === 'object' && value !== null && !isArray;

  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#ffffff',
      borderRadius: '6px',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {fieldName}
        </span>
        <span style={{
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '4px',
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
          fontFamily: 'monospace'
        }}>
          {getValueType(value)}
        </span>
      </div>

      {/* Render value based on type */}
      {isArray ? (
        <div style={{ fontSize: '11px', color: '#111827', fontFamily: 'monospace' }}>
          <div style={{ marginBottom: '4px', color: '#6b7280' }}>
            Array ({value.length} items):
          </div>
          {value.map((item, index) => (
            <div key={index} style={{
              padding: '6px 8px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              marginBottom: index < value.length - 1 ? '4px' : 0,
              maxHeight: '100px',
              overflowY: 'auto'
            }}>
              {typeof item === 'string' ? item : JSON.stringify(item, null, 2)}
            </div>
          ))}
        </div>
      ) : isObject ? (
        <pre style={{
          fontSize: '11px',
          color: '#111827',
          fontFamily: 'monospace',
          margin: 0,
          padding: '8px',
          backgroundColor: '#f9fafb',
          borderRadius: '4px',
          maxHeight: '200px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap'
        }}>
          {JSON.stringify(value, null, 2)}
        </pre>
      ) : (
        <div style={{
          fontSize: '11px',
          color: '#111827',
          fontFamily: 'monospace',
          maxHeight: isLongText ? '150px' : 'none',
          overflowY: isLongText ? 'auto' : 'visible',
          padding: '8px',
          backgroundColor: '#f9fafb',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap'
        }}>
          {String(value)}
        </div>
      )}
    </div>
  );
};

// Helper to determine value type
function getValueType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'string';
}
