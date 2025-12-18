export const OutputsPanel = ({ nodeName, outputs }) => {
  return (
    <div style={{
      width: 320,
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e5e7eb',
      padding: 12,
      boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
    }}>
      <h4>Outputs</h4>
      <p style={{ fontSize: 12, color: '#6b7280' }}>
        Use in downstream nodes:
        <br />
        <code>{`{{${nodeName}.field}}`}</code>
      </p>

      {outputs.map(o => (
        <div
          key={o.name}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '6px 8px',
            borderRadius: 6,
            cursor: 'pointer'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span>{o.name}</span>
          <span style={{
            fontSize: 11,
            background: '#eef2ff',
            padding: '2px 6px',
            borderRadius: 6
          }}>
            {o.type}
          </span>
        </div>
      ))}
    </div>
  );
};
