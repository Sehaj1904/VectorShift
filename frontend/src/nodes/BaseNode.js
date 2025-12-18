import { Handle, Position } from 'reactflow';

export const BaseNode = ({
  id,
  data,
  title,
  subtitle,
  icon,
  children,
  handles = { sources: [], targets: [] },
  style = {}
}) => {
  return (
    <div
      className="base-node"
      style={{
        width: 280,
        background: '#fff',
        borderRadius: 14,
        border: '1px solid #e5e7eb',
        boxShadow: '0 6px 14px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
    >
      {handles.targets?.map(h => (
        <Handle
          key={h.id}
          id={h.id}
          type="target"
          position={Position.Left}
          style={h.style}
        />
      ))}

      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <strong>{title}</strong>
        <span style={{ fontSize: 11, color: '#6b7280' }}>
          {data?.nodeName || id}
        </span>
      </div>

      <div style={{ padding: 12 }}>
        {subtitle && (
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
            {subtitle}
          </div>
        )}
        {children}
      </div>

      {handles.sources?.map(h => (
        <Handle
          key={h.id}
          id={h.id}
          type="source"
          position={Position.Right}
          style={h.style}
        />
      ))}
    </div>
  );
};
