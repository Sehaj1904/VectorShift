
import { useStore } from './store';

export const SubmitButton = () => {
    const { nodes, edges } = useStore();

    const handleSubmit = async () => {
        try {
            const response = await fetch('http://localhost:8000/pipelines/parse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nodes: nodes,
                    edges: edges
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            const message = `
Pipeline Analysis Results:

• Number of Nodes: ${data.num_nodes}
• Number of Edges: ${data.num_edges}
• Is DAG: ${data.is_dag ? '✓ Yes' : '✗ No'}

${data.is_dag 
    ? '✓ Your pipeline is a valid Directed Acyclic Graph!' 
    : '⚠ Warning: Your pipeline contains cycles and is not a valid DAG.'}
            `.trim();

            alert(message);
        } catch (error) {
            console.error('Error submitting pipeline:', error);
            alert('Error submitting pipeline. Please make sure the backend is running on http://localhost:8000');
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 20px',
            background: '#ffffff',
            borderTop: '1px solid #e5e7eb',
            flexShrink: 0
        }}>
            <button
                type="button"
                onClick={handleSubmit}
                style={{
                    padding: '8px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
                }}
            >
                Submit Pipeline
            </button>
        </div>
    );
}
