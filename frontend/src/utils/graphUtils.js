// graphUtils.js
// Graph algorithms for pipeline execution and validation

/**
 * Perform topological sort on nodes using Kahn's algorithm
 * Returns nodes in execution order (upstream → downstream)
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects
 * @returns {Object} {sorted: Array, hasCycle: boolean, error: string|null}
 */
export function topologicalSort(nodes, edges) {
  if (!nodes || nodes.length === 0) {
    return { sorted: [], hasCycle: false, error: null };
  }

  // Build adjacency list and in-degree map
  const adjacencyList = {};
  const inDegree = {};

  // Initialize all nodes
  nodes.forEach(node => {
    adjacencyList[node.id] = [];
    inDegree[node.id] = 0;
  });

  // Build graph from edges
  edges.forEach(edge => {
    const { source, target } = edge;
    if (adjacencyList[source] && inDegree.hasOwnProperty(target)) {
      adjacencyList[source].push(target);
      inDegree[target]++;
    }
  });

  // Find all nodes with no incoming edges (starting nodes)
  const queue = [];
  Object.keys(inDegree).forEach(nodeId => {
    if (inDegree[nodeId] === 0) {
      queue.push(nodeId);
    }
  });

  const sorted = [];

  // Process nodes in topological order
  while (queue.length > 0) {
    const nodeId = queue.shift();
    sorted.push(nodeId);

    // Reduce in-degree for all neighbors
    adjacencyList[nodeId].forEach(neighbor => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }

  // Check for cycle
  if (sorted.length !== nodes.length) {
    return {
      sorted: [],
      hasCycle: true,
      error: 'Pipeline contains circular dependencies. Please remove cycles to execute.'
    };
  }

  // Return node objects in sorted order
  const sortedNodes = sorted.map(id => nodes.find(n => n.id === id)).filter(Boolean);

  return { sorted: sortedNodes, hasCycle: false, error: null };
}

/**
 * Find all upstream nodes (dependencies) for a given node
 * @param {string} nodeId - Target node ID
 * @param {Array} edges - Array of edge objects
 * @returns {Array} Array of upstream node IDs
 */
export function findUpstreamNodes(nodeId, edges) {
  if (!nodeId || !edges) return [];

  const upstream = new Set();

  // Find all edges where this node is the target
  edges.forEach(edge => {
    if (edge.target === nodeId) {
      upstream.add(edge.source);
    }
  });

  return Array.from(upstream);
}

/**
 * Find all downstream nodes (dependents) for a given node
 * @param {string} nodeId - Source node ID
 * @param {Array} edges - Array of edge objects
 * @returns {Array} Array of downstream node IDs
 */
export function findDownstreamNodes(nodeId, edges) {
  if (!nodeId || !edges) return [];

  const downstream = new Set();

  // Find all edges where this node is the source
  edges.forEach(edge => {
    if (edge.source === nodeId) {
      downstream.add(edge.target);
    }
  });

  return Array.from(downstream);
}

/**
 * Detect if the graph contains cycles
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects
 * @returns {boolean} True if cycle detected, false otherwise
 */
export function detectCycles(nodes, edges) {
  const result = topologicalSort(nodes, edges);
  return result.hasCycle;
}

/**
 * Get all paths from source node to target node
 * @param {string} sourceId - Starting node ID
 * @param {string} targetId - Ending node ID
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects
 * @returns {Array} Array of paths, where each path is an array of node IDs
 */
export function findPaths(sourceId, targetId, nodes, edges) {
  if (!sourceId || !targetId || !nodes || !edges) return [];

  const paths = [];
  const visited = new Set();

  function dfs(currentId, path) {
    if (currentId === targetId) {
      paths.push([...path]);
      return;
    }

    if (visited.has(currentId)) return;
    visited.add(currentId);

    const downstream = findDownstreamNodes(currentId, edges);
    downstream.forEach(nextId => {
      dfs(nextId, [...path, nextId]);
    });

    visited.delete(currentId);
  }

  dfs(sourceId, [sourceId]);
  return paths;
}

/**
 * Validate pipeline structure
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects
 * @returns {Object} {valid: boolean, errors: Array, warnings: Array}
 */
export function validatePipeline(nodes, edges) {
  const errors = [];
  const warnings = [];

  // Check for empty pipeline
  if (!nodes || nodes.length === 0) {
    errors.push('Pipeline is empty. Add at least one node.');
    return { valid: false, errors, warnings };
  }

  // Check for cycles
  if (detectCycles(nodes, edges)) {
    errors.push('Pipeline contains circular dependencies.');
  }

  // Check for disconnected nodes (if there are edges)
  if (edges && edges.length > 0) {
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const disconnectedNodes = nodes.filter(node => !connectedNodes.has(node.id));
    if (disconnectedNodes.length > 0 && nodes.length > 1) {
      const nodeNames = disconnectedNodes.map(n => n.data?.nodeName || n.id).join(', ');
      warnings.push(`Disconnected nodes: ${nodeNames}`);
    }
  }

  // Check for required fields in nodes
  nodes.forEach(node => {
    const nodeType = node.type;
    const nodeData = node.data || {};
    const nodeName = nodeData.nodeName || node.id;

    // Check node-specific required fields
    switch (nodeType) {
      case 'llm':
        if (!nodeData.systemPrompt) {
          warnings.push(`LLM node "${nodeName}" missing system prompt`);
        }
        if (!nodeData.prompt) {
          warnings.push(`LLM node "${nodeName}" missing prompt`);
        }
        break;

      case 'customInput':
        if (!nodeData.text && nodeData.text !== '') {
          warnings.push(`Input node "${nodeName}" missing text value`);
        }
        break;

      case 'customOutput':
        if (!nodeData.output) {
          warnings.push(`Output node "${nodeName}" missing output configuration`);
        }
        break;

      case 'knowledgeBase':
        if (!nodeData.searchQuery) {
          warnings.push(`Knowledge Base node "${nodeName}" missing search query`);
        }
        break;
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Group nodes by execution level (for parallel execution potential)
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects
 * @returns {Array} Array of node groups, where each group can execute in parallel
 */
export function groupNodesByLevel(nodes, edges) {
  if (!nodes || nodes.length === 0) return [];

  // Build adjacency list and in-degree
  const adjacencyList = {};
  const inDegree = {};

  nodes.forEach(node => {
    adjacencyList[node.id] = [];
    inDegree[node.id] = 0;
  });

  edges.forEach(edge => {
    adjacencyList[edge.source].push(edge.target);
    inDegree[edge.target]++;
  });

  const levels = [];
  let currentLevel = [];

  // Find starting nodes (no dependencies)
  Object.keys(inDegree).forEach(nodeId => {
    if (inDegree[nodeId] === 0) {
      currentLevel.push(nodeId);
    }
  });

  while (currentLevel.length > 0) {
    levels.push([...currentLevel]);
    const nextLevel = [];

    currentLevel.forEach(nodeId => {
      adjacencyList[nodeId].forEach(neighbor => {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          nextLevel.push(neighbor);
        }
      });
    });

    currentLevel = nextLevel;
  }

  // Convert node IDs to node objects
  return levels.map(level =>
    level.map(id => nodes.find(n => n.id === id)).filter(Boolean)
  );
}
