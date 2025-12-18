// NodeDetailsPanel.js
// Right sidebar panel showing node output fields

import { useStore } from '../store';

export const NodeDetailsPanel = () => {
  const selectedNodeId = useStore((state) => state.selectedNodeId);
  const nodeDetailsPanelOpen = useStore((state) => state.nodeDetailsPanelOpen);
  const closeNodeDetailsPanel = useStore((state) => state.closeNodeDetailsPanel);
  const nodes = useStore((state) => state.nodes);
  const getNodeOutputSchema = useStore((state) => state.getNodeOutputSchema);

  // Get the selected node
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!nodeDetailsPanelOpen || !selectedNode) {
    return null;
  }

  // Get output schema for the selected node
  const outputSchema = getNodeOutputSchema(selectedNodeId) || [];

  // Get node type label
  const getNodeTypeLabel = (type) => {
    switch (type) {
      case 'customInput': return 'Input';
      case 'customOutput': return 'Output';
      case 'text': return 'Text';
      case 'llm': return 'OpenAI';
      case 'knowledgeBase': return 'Knowledge Base Reader';
      default: return type;
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 99998,
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={closeNodeDetailsPanel}
      />

      {/* Side panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '400px',
          height: '100vh',
          backgroundColor: '#ffffff',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              Node Details
            </h2>
          </div>
          <button
            onClick={closeNodeDetailsPanel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Node Type */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '6px 12px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151'
              }}
            >
              {getNodeTypeLabel(selectedNode.type)}
            </div>
          </div>

          {/* Node Name */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#eef2ff',
                border: '1px solid #c7d2fe',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#4338ca',
                fontFamily: 'monospace'
              }}
            >
              {selectedNode.data?.nodeName || selectedNode.id}
            </div>
          </div>

          {/* Helper Text */}
          <div
            style={{
              padding: '12px',
              backgroundColor: '#fef3c7',
              border: '1px solid #fde047',
              borderRadius: '6px',
              marginBottom: '24px'
            }}
          >
            <p style={{ margin: 0, fontSize: '12px', color: '#854d0e', lineHeight: '1.5' }}>
              Type <strong>{'{{'}</strong> in downstream nodes to leverage output fields.
            </p>
          </div>

          {/* Output Fields Section */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Output Fields
              </h3>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                Type
              </span>
            </div>

            {outputSchema.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {outputSchema.map((output, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#111827',
                          marginBottom: '4px',
                          fontFamily: 'monospace'
                        }}
                      >
                        {output.name}
                      </div>
                      {output.description && (
                        <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.4' }}>
                          {output.description}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#6366f1',
                        color: '#ffffff',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        marginLeft: '12px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {output.type || 'Text'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: '13px'
                }}
              >
                No output fields available
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};
