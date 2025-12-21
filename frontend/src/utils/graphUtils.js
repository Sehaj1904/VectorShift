export function topologicalSort(nodes, edges) {
  if (!nodes || nodes.length === 0) {
    return { sorted: [], hasCycle: false, error: null };
  }

  const adjacencyList = {};
  const inDegree = {};

  nodes.forEach(node => {
    adjacencyList[node.id] = [];
    inDegree[node.id] = 0;
  });

  edges.forEach(edge => {
    const { source, target } = edge;
    if (adjacencyList[source] && inDegree.hasOwnProperty(target)) {
      adjacencyList[source].push(target);
      inDegree[target]++;
    }
  });

  const queue = [];
  Object.keys(inDegree).forEach(nodeId => {
    if (inDegree[nodeId] === 0) {
      queue.push(nodeId);
    }
  });

  const sorted = [];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    sorted.push(nodeId);

    adjacencyList[nodeId].forEach(neighbor => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }

  if (sorted.length !== nodes.length) {
    return {
      sorted: [],
      hasCycle: true,
      error: 'Pipeline contains circular dependencies. Please remove cycles to execute.'
    };
  }

  const sortedNodes = sorted.map(id => nodes.find(n => n.id === id)).filter(Boolean);

  return { sorted: sortedNodes, hasCycle: false, error: null };
}

export function findUpstreamNodes(nodeId, edges) {
  if (!nodeId || !edges) return [];

  const upstream = new Set();

  edges.forEach(edge => {
    if (edge.target === nodeId) {
      upstream.add(edge.source);
    }
  });

  return Array.from(upstream);
}

export function findDownstreamNodes(nodeId, edges) {
  if (!nodeId || !edges) return [];

  const downstream = new Set();

  edges.forEach(edge => {
    if (edge.source === nodeId) {
      downstream.add(edge.target);
    }
  });

  return Array.from(downstream);
}

export function detectCycles(nodes, edges) {
  const result = topologicalSort(nodes, edges);
  return result.hasCycle;
}

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

export function validatePipeline(nodes, edges) {
  const errors = [];
  const warnings = [];

  if (!nodes || nodes.length === 0) {
    errors.push('Pipeline is empty. Add at least one node.');
    return { valid: false, errors, warnings };
  }

  if (detectCycles(nodes, edges)) {
    errors.push('Pipeline contains circular dependencies.');
  }

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

  nodes.forEach(node => {
    const nodeType = node.type;
    const nodeData = node.data || {};
    const nodeName = nodeData.nodeName || node.id;

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

export function groupNodesByLevel(nodes, edges) {
  if (!nodes || nodes.length === 0) return [];

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

  return levels.map(level =>
    level.map(id => nodes.find(n => n.id === id)).filter(Boolean)
  );
}
