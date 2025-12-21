
import { DraggableNode } from './draggableNode';
import { useStore } from './store';
import { useState } from 'react';
import { RunPipelineModal } from './components/RunPipelineModal';

export const PipelineToolbar = () => {
    const nodes = useStore((state) => state.nodes);
    const [showRunModal, setShowRunModal] = useState(false);

    const handleRunPipeline = () => {
        if (nodes.length === 0) {
            alert('Please add nodes to the pipeline before running.');
            return;
        }
        setShowRunModal(true);
    };

    return (
        <>
            <div style={{
                padding: '12px 20px',
                background: '#ffffff',
                borderBottom: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                flexShrink: 0
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    maxWidth: '100%'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            flexShrink: 0
                        }}>
                            VectorShift
                        </div>

                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flex: 1, overflow: 'auto', flexWrap: 'wrap' }}>
                            <DraggableNode type='customInput' label='Input' />
                            <DraggableNode type='customOutput' label='Output' />
                            <DraggableNode type='text' label='Text' />
                            <DraggableNode type='llm' label='LLM' />
                            <DraggableNode type='knowledgeBase' label='Knowledge Base' />
                        </div>
                    </div>
                        
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
                        <button
                            onClick={handleRunPipeline}
                            style={{
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#ffffff',
                                background: '#6366f1',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#4f46e5';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#6366f1';
                            }}
                        >
                            <span>▶</span>
                            <span>Run Pipeline</span>
                        </button>
                    </div>
                </div>
            </div>

            <RunPipelineModal
                isOpen={showRunModal}
                onClose={() => setShowRunModal(false)}
            />
        </>
    );
};
