// toolbar.js

import { DraggableNode } from './draggableNode';
import { useStore } from './store';
import { executePipeline } from './execution/PipelineExecutor';
import { useState } from 'react';

export const PipelineToolbar = () => {
    const nodes = useStore((state) => state.nodes);
    const edges = useStore((state) => state.edges);
    const startExecution = useStore((state) => state.startExecution);
    const updateExecutionResult = useStore((state) => state.updateExecutionResult);
    const updateExecutionError = useStore((state) => state.updateExecutionError);
    const advanceExecutionIndex = useStore((state) => state.advanceExecutionIndex);
    const completeExecution = useStore((state) => state.completeExecution);
    const executionState = useStore((state) => state.executionState);

    const [isRunning, setIsRunning] = useState(false);

    const handleRunPipeline = async () => {
        if (nodes.length === 0) {
            alert('Please add nodes to the pipeline before running.');
            return;
        }

        setIsRunning(true);

        try {
            await executePipeline(nodes, edges, {
                onNodeStart: (nodeId, index) => {
                    console.log(`Starting node ${nodeId} (${index + 1})`);
                    if (index === 0) {
                        // Initialize execution state
                        const executionOrder = nodes.map(n => n.id);
                        startExecution(executionOrder);
                    }
                },
                onNodeComplete: (nodeId, result) => {
                    console.log(`Completed node ${nodeId}:`, result);
                    updateExecutionResult(nodeId, result);
                    advanceExecutionIndex();
                },
                onNodeError: (nodeId, error) => {
                    console.error(`Error in node ${nodeId}:`, error);
                    updateExecutionError(nodeId, error);
                },
                onComplete: () => {
                    console.log('Pipeline execution complete');
                    completeExecution();
                    setIsRunning(false);
                }
            });
        } catch (error) {
            console.error('Pipeline execution failed:', error);
            alert(`Pipeline execution failed: ${error.message}`);
            completeExecution();
            setIsRunning(false);
        }
    };

    return (
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
                {/* Left side - Logo and Navigation */}
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

                {/* Right side - Actions */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
                    {/* Run Pipeline Button */}
                    <button
                        onClick={handleRunPipeline}
                        disabled={isRunning || executionState.isExecuting}
                        style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#ffffff',
                            background: isRunning || executionState.isExecuting
                                ? '#9ca3af'
                                : '#6366f1',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: isRunning || executionState.isExecuting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            opacity: isRunning || executionState.isExecuting ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!isRunning && !executionState.isExecuting) {
                                e.target.style.background = '#4f46e5';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isRunning && !executionState.isExecuting) {
                                e.target.style.background = '#6366f1';
                            }
                        }}
                    >
                        {isRunning || executionState.isExecuting ? (
                            <>
                                <div style={{
                                    width: '14px',
                                    height: '14px',
                                    border: '2px solid #ffffff',
                                    borderTopColor: 'transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                <span>Running...</span>
                            </>
                        ) : (
                            <>
                                <span>▶</span>
                                <span>Run Pipeline</span>
                            </>
                        )}
                    </button>
                </div>
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
};
