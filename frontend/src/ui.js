

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, MiniMap, Panel } from 'reactflow';
import { useStore } from './store';
import { ConfigurableNode } from './nodes/ConfigurableNode';
import { KnowledgeBaseNode } from './nodes/KnowledgeBaseNode';
import { getNodeDefaultData } from './nodes/nodeConfig';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const createNodeComponent = (type) => (props) => <ConfigurableNode {...props} type={type} />;

const nodeTypes = {
  customInput: createNodeComponent('customInput'),
  llm: createNodeComponent('llm'),
  customOutput: createNodeComponent('customOutput'),
  text: createNodeComponent('text'),
  knowledgeBase: (props) => <KnowledgeBaseNode {...props} type="knowledgeBase" />,
};

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const nodes = useStore((state) => state.nodes);
    const edges = useStore((state) => state.edges);
    const getNodeID = useStore((state) => state.getNodeID);
    const addNode = useStore((state) => state.addNode);
    const onNodesChange = useStore((state) => state.onNodesChange);
    const onEdgesChange = useStore((state) => state.onEdgesChange);
    const onConnect = useStore((state) => state.onConnect);
    const isInteractivityLocked = useStore((state) => state.isInteractivityLocked);

    useEffect(() => {
      if (reactFlowInstance && nodes.length > 0) {
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2, duration: 200 });
        }, 50);
      }
    }, [nodes, reactFlowInstance]);

    const getInitNodeData = (nodeID, type) => {
      return getNodeDefaultData(nodeID, type);
    }

    const onDrop = useCallback(
      (event) => {
        event.preventDefault();

        const flowBounds = reactFlowWrapper.current;
        if (!flowBounds || !reactFlowInstance) {
          return;
        }

        const reactFlowBounds = flowBounds.getBoundingClientRect();
        const raw = event?.dataTransfer?.getData('application/reactflow');
        if (!raw) return;

        const appData = JSON.parse(raw);
        const type = appData?.nodeType;
        if (!type) return;

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const nodeID = getNodeID(type);
        const newNode = {
          id: nodeID,
          type,
          position,
          data: getInitNodeData(nodeID, type),
        };

        addNode(newNode);
      },
      [reactFlowInstance, getNodeID, addNode]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onNodeClick = useCallback((_event, _node) => {
    }, []);

    return (
        <div
          ref={reactFlowWrapper}
          onDrop={onDrop}
          onDragOver={onDragOver}
          style={{
            width: '100%',
            height: '100%',
            background: '#f8f9fa'
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            proOptions={proOptions}
            snapGrid={[gridSize, gridSize]}
            snapToGrid={true}
            nodesDraggable={!isInteractivityLocked}
            nodesConnectable={!isInteractivityLocked}
            elementsSelectable={!isInteractivityLocked}
            connectionLineType="smoothstep"
            connectionLineStyle={{
              strokeWidth: 3,
              stroke: '#6366f1',
              strokeDasharray: '5,5',
              opacity: 1
            }}
            connectionMode="loose"
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: {
                strokeWidth: 2,
                stroke: '#6366f1'
              },
              animated: false,
            }}
            minZoom={0.1}
            maxZoom={4}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          >
            <Background color="#d1d5db" gap={gridSize} size={1} style={{ backgroundColor: '#f8f9fa' }} />
            <Controls
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            />
            <MiniMap
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
              nodeColor="#6366f1"
              maskColor="rgba(0, 0, 0, 0.05)"
            />

            <Panel position="top-right">
              <div
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  color: '#374151',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  fontWeight: 500
                }}
              >
                <span>Nodes: {nodes.length}</span>
                <span style={{ width: '1px', height: '12px', backgroundColor: '#e5e7eb' }} />
                <span>Edges: {edges.length}</span>
              </div>
            </Panel>
          </ReactFlow>
        </div>
    );
}
