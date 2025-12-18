import { resolveVariables } from './resolveVariables';

export async function executePipeline(nodes, edges, hooks) {
  const context = {};

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    hooks.onNodeStart?.(node.id, i);

    let result = {};

    if (node.type === 'text') {
      result.output = resolveVariables(node.data.text, context);
    }

    if (node.type === 'llm') {
      result = {
        response: `Mock response from ${node.id}`,
        tokens_used: 120,
        input_tokens: 50,
        output_tokens: 70
      };
    }

    context[node.data.nodeName || node.id] = result;
    hooks.onNodeComplete?.(node.id, result);
  }

  hooks.onComplete?.();
}
