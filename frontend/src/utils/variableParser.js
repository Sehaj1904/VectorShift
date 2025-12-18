// variableParser.js
// Utilities for parsing and manipulating variable references in text

/**
 * Parse variable references from text
 * Extracts all {{variableName}} or {{nodeName.fieldName}} patterns
 * @param {string} text - Text containing variable references
 * @returns {Array} Array of variable objects: [{full: '{{var}}', nodeName: 'node', field: 'field', start: 0, end: 7}]
 */
export function parseVariables(text) {
  if (!text || typeof text !== 'string') return [];

  // Pattern matches {{variableName}} or {{nodeName.fieldName}}
  // Supports: letters, numbers, underscores, dollar signs
  // Format: {{identifier}} or {{identifier.identifier}}
  const variablePattern = /\{\{\\s*([a-zA-Z_$][a-zA-Z0-9_$]*)(?:\.([a-zA-Z_$][a-zA-Z0-9_$]*))?\s*\}\}/g;

  const variables = [];
  let match;

  while ((match = variablePattern.exec(text)) !== null) {
    const full = match[0]; // Full match: {{nodeName.field}}
    const nodeName = match[1]; // First capture group: nodeName
    const field = match[2] || null; // Second capture group: field (optional)

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

/**
 * Substitute variable references with actual values from context
 * @param {string} text - Text containing {{var}} references
 * @param {Object} context - Object with variable values: { nodeName: { field: value } }
 * @returns {string} Text with variables replaced by values
 */
export function substituteVariables(text, context) {
  if (!text || typeof text !== 'string') return text;
  if (!context || typeof context !== 'object') return text;

  const variables = parseVariables(text);
  if (variables.length === 0) return text;

  // Replace in reverse order to maintain correct positions
  let result = text;
  for (let i = variables.length - 1; i >= 0; i--) {
    const { full, nodeName, field, start, end } = variables[i];

    // Get value from context
    let value = null;
    if (field) {
      // Format: {{nodeName.field}}
      value = context[nodeName]?.[field];
    } else {
      // Format: {{nodeName}} - use entire node data or first field
      const nodeData = context[nodeName];
      if (nodeData && typeof nodeData === 'object') {
        // If node data is an object, try common field names
        value = nodeData.text || nodeData.output || nodeData.response || nodeData.value;
        // If no common field, use first available field
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

    // Convert value to string, handle undefined/null
    const replacement = value !== null && value !== undefined ? String(value) : full;

    // Replace in text
    result = result.substring(0, start) + replacement + result.substring(end);
  }

  return result;
}

/**
 * Validate if a variable reference exists in the available nodes
 * @param {string} varRef - Variable reference like "nodeName.field"
 * @param {Array} nodes - Array of node objects from store
 * @returns {Object} {valid: boolean, message: string, node: object|null}
 */
export function validateVariableReference(varRef, nodes) {
  if (!varRef || typeof varRef !== 'string') {
    return { valid: false, message: 'Invalid variable reference', node: null };
  }

  // Parse the reference
  const parts = varRef.split('.');
  if (parts.length === 0 || parts.length > 2) {
    return { valid: false, message: 'Invalid format. Use: nodeName or nodeName.field', node: null };
  }

  const nodeName = parts[0];
  const field = parts[1] || null;

  // Find the node
  const node = nodes.find(n => n.data?.nodeName === nodeName || n.id === nodeName);
  if (!node) {
    return { valid: false, message: `Node "${nodeName}" not found`, node: null };
  }

  // If field specified, validate it exists in node's output schema
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

/**
 * Get output fields for a specific node
 * @param {string} nodeId - Node ID or node name
 * @param {Array} nodes - Array of node objects from store
 * @returns {Array} Array of output field objects: [{name, type, description}]
 */
export function getOutputFields(nodeId, nodes) {
  if (!nodeId || !nodes) return [];

  // Find node by ID or by nodeName in data
  const node = nodes.find(n =>
    n.id === nodeId || n.data?.nodeName === nodeId
  );

  if (!node) return [];

  // Return output schema if available
  // For nodes using the BaseNode with outputSchema prop
  if (node.data?.outputSchema && Array.isArray(node.data.outputSchema)) {
    return node.data.outputSchema;
  }

  // Fallback: infer from node type
  return getDefaultOutputFields(node.type, node.data);
}

/**
 * Get default output fields based on node type
 * @param {string} nodeType - Type of node (e.g., 'llm', 'customInput', 'text')
 * @param {Object} nodeData - Node data object
 * @returns {Array} Array of output field objects
 */
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
      return []; // Output nodes don't have outputs

    default:
      return [{ name: 'output', type: 'Text', description: 'Node output' }];
  }
}

/**
 * Extract unique node names from variable references in text
 * @param {string} text - Text containing variable references
 * @returns {Array} Array of unique node names referenced
 */
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
