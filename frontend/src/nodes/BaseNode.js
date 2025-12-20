import { Handle, Position } from 'reactflow';
import { useStore } from '../store';

export const BaseNode = ({
  id,
  data,
  title,
  subtitle,
  icon,
  children,
  handles = { sources: [], targets: [] },
  outputSchema = [],
  style = {}
}) => {
  const setSelectedNode = useStore((state) => state.setSelectedNode);
  const openNodeDetailsPanel = useStore((state) => state.openNodeDetailsPanel);
  const nodes = useStore((state) => state.nodes);
  const setNodes = useStore((state) => state.setNodes);

  const handleDelete = () => {
    // Remove this node from the nodes array
    const updatedNodes = nodes.filter(node => node.id !== id);
    setNodes(updatedNodes);
  };

  return (
    <div
      className="base-node"
      style={{
        width: 360,
        background: '#fff',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '13px',
        ...style
      }}
    >
      {/* Target Handles (Left side - inputs) */}
      {handles.targets?.map((h, index) => (
        <div key={h.id}>
          <Handle
            id={h.id}
            type="target"
            position={Position.Left}
            style={{
              width: 10,
              height: 10,
              background: '#fff',
              border: '2px solid #6b7280',
              borderRadius: '50%',
              left: -5,
              top: h.style?.top || '50%',
              ...h.style
            }}
          />
          {h.label && (
            <div
              style={{
                position: 'absolute',
                left: -10,
                top: h.style?.top || '50%',
                transform: 'translateX(-100%) translateY(-50%)',
                fontSize: '10px',
                fontWeight: '500',
                color: '#3b82f6',
                background: '#dbeafe',
                padding: '2px 6px',
                borderRadius: '3px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                fontFamily: 'monospace'
              }}
            >
              {h.label}
            </div>
          )}
        </div>
      ))}

      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {icon && <div style={{ display: 'flex', alignItems: 'center' }}>{icon}</div>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
              {subtitle}
            </div>
          )}
        </div>

        {/* Node Details Button */}
        <button
          onClick={() => {
            setSelectedNode(id);
            openNodeDetailsPanel();
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            color: '#6b7280'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
          title="Node Details"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        </button>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            color: '#6b7280'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b7280';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Delete node"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div style={{
          fontSize: '11px',
          color: '#6b7280',
          fontWeight: '500',
          backgroundColor: '#f3f4f6',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          {data?.nodeName || id}
        </div>
      </div>

      {/* Body - Input fields */}
      <div style={{ padding: '12px 14px' }}>
        {children}
      </div>

      {/* Source Handles (Right side - outputs) */}
      {handles.sources?.map((h, index) => (
        <Handle
          key={h.id}
          id={h.id}
          type="source"
          position={Position.Right}
          style={{
            right: -5,
            width: 10,
            height: 10,
            background: '#fff',
            border: '2px solid #6b7280',
            borderRadius: '50%',
            ...h.style
          }}
        />
      ))}
    </div>
  );
};
