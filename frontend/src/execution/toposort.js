export function topologicalSort(nodes, edges) {
    const graph = {};
    const indegree = {};
  
    nodes.forEach(n => {
      graph[n.id] = [];
      indegree[n.id] = 0;
    });
  
    edges.forEach(e => {
      graph[e.source].push(e.target);
      indegree[e.target]++;
    });
  
    const queue = Object.keys(indegree).filter(k => indegree[k] === 0);
    const order = [];
  
    while (queue.length) {
      const n = queue.shift();
      order.push(n);
      graph[n].forEach(nei => {
        indegree[nei]--;
        if (indegree[nei] === 0) queue.push(nei);
      });
    }
  
    return order.length === nodes.length ? order : null;
  }
  