import create from 'zustand';

export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  executingNodeId: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  updateNodeField: (id, field, value) =>
    set({
      nodes: get().nodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n
      )
    }),

  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setExecutingNode: (id) => set({ executingNodeId: id })
}));
