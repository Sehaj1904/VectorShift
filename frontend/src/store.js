import create from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';

export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  executingNodeId: null,
  nodeIdCounter: {},
  nodeDetailsPanelOpen: false,
  isInteractivityLocked: false,
  executionState: {
    isExecuting: false,
    currentIndex: 0,
    executionOrder: [],
    results: {},
    errors: {}
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  getNodeID: (type) => {
    const counter = get().nodeIdCounter;
    const count = (counter[type] || 0) + 1;
    set({
      nodeIdCounter: {
        ...counter,
        [type]: count
      }
    });
    return `${type}-${count}`;
  },

  addNode: (node) => {
    set({
      nodes: [...get().nodes, node]
    });
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes)
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges)
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges)
    });
  },

  updateNodeField: (id, field, value) =>
    set({
      nodes: get().nodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n
      )
    }),

  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setExecutingNode: (id) => set({ executingNodeId: id }),

  openNodeDetailsPanel: () => set({ nodeDetailsPanelOpen: true }),
  closeNodeDetailsPanel: () => set({ nodeDetailsPanelOpen: false }),

  getNodeOutputSchema: (nodeId) => {
    const node = get().nodes.find(n => n.id === nodeId);
    if (!node) return [];

    // Import the config to get output schema
    const { getNodeConfig } = require('./nodes/nodeConfig');
    const config = getNodeConfig(node.type);

    if (!config || !config.getOutputSchema) return [];
    return config.getOutputSchema(node.data);
  },

  startExecution: (executionOrder) =>
    set({
      executionState: {
        isExecuting: true,
        currentIndex: 0,
        executionOrder,
        results: {},
        errors: {}
      }
    }),

  updateExecutionResult: (nodeId, result) =>
    set({
      executionState: {
        ...get().executionState,
        results: {
          ...get().executionState.results,
          [nodeId]: result
        }
      }
    }),

  updateExecutionError: (nodeId, error) =>
    set({
      executionState: {
        ...get().executionState,
        errors: {
          ...get().executionState.errors,
          [nodeId]: error
        }
      }
    }),

  advanceExecutionIndex: () =>
    set({
      executionState: {
        ...get().executionState,
        currentIndex: get().executionState.currentIndex + 1
      }
    }),

  completeExecution: () =>
    set({
      executionState: {
        ...get().executionState,
        isExecuting: false
      }
    }),

  toggleInteractivity: () =>
    set({
      isInteractivityLocked: !get().isInteractivityLocked
    }),

  setInteractivityLocked: (locked) =>
    set({
      isInteractivityLocked: locked
    })
}));
