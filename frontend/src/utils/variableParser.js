export function parseVariables(text) {
  if (!text || typeof text !== 'string') return [];

  const variablePattern = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)(?:\.([a-zA-Z_$][a-zA-Z0-9_$]*))?\s*\}\}/g;

  const variables = [];
  let match;

  while ((match = variablePattern.exec(text)) !== null) {
    const full = match[0];
    const nodeName = match[1];
    const field = match[2] || null;

    variables.push({
      full,
      nodeName,
      field,
      start: match.index,
      end: match.index + full.length
    });
  }

  return variables;
}

export function substituteVariables(text, context) {
  if (!text || typeof text !== 'string') return text;
  if (!context || typeof context !== 'object') return text;

  const variables = parseVariables(text);
  if (variables.length === 0) return text;

  let result = text;
  for (let i = variables.length - 1; i >= 0; i--) {
    const { full, nodeName, field, start, end } = variables[i];

    let value = null;
    if (field) {
      value = context[nodeName]?.[field];
    } else {
      const nodeData = context[nodeName];
      if (nodeData && typeof nodeData === 'object') {
        value = nodeData.text || nodeData.output || nodeData.response || nodeData.value;
        if (value === undefined) {
          const keys = Object.keys(nodeData);
          if (keys.length > 0) {
            value = nodeData[keys[0]];
          }
        }
      } else {
        value = nodeData;
      }
    }

    const replacement = value !== null && value !== undefined ? String(value) : full;
    result = result.substring(0, start) + replacement + result.substring(end);
  }

  return result;
}

export function validateVariableReference(varRef, nodes) {
  if (!varRef || typeof varRef !== 'string') {
    return { valid: false, message: 'Invalid variable reference', node: null };
  }

  const parts = varRef.split('.');
  if (parts.length === 0 || parts.length > 2) {
    return { valid: false, message: 'Invalid format. Use: nodeName or nodeName.field', node: null };
  }

  const nodeName = parts[0];
  const field = parts[1] || null;

  const node = nodes.find(n => n.data?.nodeName === nodeName || n.id === nodeName);
  if (!node) {
    return { valid: false, message: `Node "${nodeName}" not found`, node: null };
  }

  if (field && node.data?.outputSchema) {
    const hasField = node.data.outputSchema.some(output => output.name === field);
    if (!hasField) {
      return {
        valid: false,
        message: `Field "${field}" not found in node "${nodeName}"`,
        node
      };
    }
  }

  return { valid: true, message: 'Valid reference', node };
}

export function getOutputFields(nodeId, nodes) {
  if (!nodeId || !nodes) return [];

  const node = nodes.find(n => n.id === nodeId || n.data?.nodeName === nodeId);
  if (!node) return [];

  if (node.data?.outputSchema && Array.isArray(node.data.outputSchema)) {
    return node.data.outputSchema;
  }

  return getDefaultOutputFields(node.type, node.data);
}

function getDefaultOutputFields(nodeType, nodeData) {
  switch (nodeType) {
    case 'customInput':
      return [{ name: 'text', type: nodeData?.type || 'Text', description: 'The input value' }];

    case 'llm':
      return [
        { name: 'response', type: 'Text', description: 'The output of the LLM' },
        { name: 'tokens_used', type: 'Integer', description: 'Total tokens used' },
        { name: 'input_tokens', type: 'Integer', description: 'Input tokens used' },
        { name: 'output_tokens', type: 'Integer', description: 'Output tokens used' }
      ];

    case 'text':
      return [{ name: 'output', type: 'Text', description: 'Processed text output' }];

    case 'knowledgeBase':
      return [
        { name: 'chunks', type: 'List<Text>', description: 'Retrieved chunks' },
        { name: 'citation_metadata', type: 'List<Text>', description: 'Citation metadata' }
      ];

    case 'customOutput':
      return [];

    default:
      return [{ name: 'output', type: 'Text', description: 'Node output' }];
  }
}

export function getReferencedNodes(text) {
  const variables = parseVariables(text);
  const nodeNames = new Set();

  variables.forEach(v => {
    if (v.nodeName) {
      nodeNames.add(v.nodeName);
    }
  });

  return Array.from(nodeNames);
}
