// nodeExecutors.js
// Individual node execution logic for each node type

/**
 * Execute an Input node
 * Returns the text value directly
 */
export async function executeInputNode(nodeData) {
  return {
    text: nodeData.text || '',
    type: nodeData.type || 'Text'
  };
}

/**
 * Execute a Text node
 * Processes text (variables already substituted by executor)
 */
export async function executeTextNode(nodeData, processedText) {
  return {
    output: processedText || nodeData.text || ''
  };
}

/**
 * Execute an LLM node (mock implementation)
 * In production, this would call actual LLM API
 */
export async function executeLLMNode(nodeData, processedSystemPrompt, processedPrompt) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const systemPrompt = processedSystemPrompt || nodeData.systemPrompt || '';
  const prompt = processedPrompt || nodeData.prompt || '';

  // Mock LLM response
  const mockResponse = `Mock LLM Response:

System Context: ${systemPrompt.substring(0, 50)}${systemPrompt.length > 50 ? '...' : ''}
User Query: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}

This is a simulated response from ${nodeData.model || 'gpt-4.0-turbo'}. In a production environment, this would be replaced with an actual API call to the LLM service.`;

  // Simulate token counts
  const inputTokens = Math.floor((systemPrompt.length + prompt.length) / 4);
  const outputTokens = Math.floor(mockResponse.length / 4);

  return {
    response: mockResponse,
    tokens_used: inputTokens + outputTokens,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    model: nodeData.model || 'gpt-4.0-turbo'
  };
}

/**
 * Execute a Knowledge Base node (mock implementation)
 * In production, this would query actual vector database
 */
export async function executeKnowledgeBaseNode(nodeData, processedQuery) {
  // Simulate vector search delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const query = processedQuery || nodeData.searchQuery || '';
  const kbName = nodeData.knowledgeBase || 'example_kb';

  // Mock retrieved chunks
  const mockChunks = [
    `Chunk 1 from ${kbName}: This is semantically similar content related to "${query.substring(0, 30)}${query.length > 30 ? '...' : ''}". In production, this would be actual retrieved text from your knowledge base.`,
    `Chunk 2 from ${kbName}: Additional context that matches the query semantics. Vector search would return the most relevant passages.`,
    `Chunk 3 from ${kbName}: More relevant information retrieved based on embedding similarity.`
  ];

  const mockCitations = [
    'Document: example_doc_1.pdf, Page: 5',
    'Document: example_doc_2.pdf, Page: 12',
    'Document: example_doc_3.pdf, Page: 8'
  ];

  return {
    chunks: mockChunks,
    citation_metadata: mockCitations,
    knowledge_base: kbName,
    query: query,
    num_results: mockChunks.length
  };
}

/**
 * Execute an Output node
 * Returns the final output value
 */
export async function executeOutputNode(nodeData, processedOutput) {
  return {
    value: processedOutput || nodeData.output || '',
    type: nodeData.type || 'Text'
  };
}

/**
 * Main executor router - calls appropriate executor based on node type
 */
export async function executeNode(node, context = {}) {
  const nodeType = node.type;
  const nodeData = node.data || {};

  try {
    switch (nodeType) {
      case 'customInput':
        return await executeInputNode(nodeData);

      case 'text':
        // For text node, we need to get the processed text with variables substituted
        const processedText = context._processedFields?.text || nodeData.text;
        return await executeTextNode(nodeData, processedText);

      case 'llm':
        // Get processed prompts with variables substituted
        const processedSystemPrompt = context._processedFields?.systemPrompt || nodeData.systemPrompt;
        const processedPrompt = context._processedFields?.prompt || nodeData.prompt;
        return await executeLLMNode(nodeData, processedSystemPrompt, processedPrompt);

      case 'knowledgeBase':
        // Get processed search query
        const processedQuery = context._processedFields?.searchQuery || nodeData.searchQuery;
        return await executeKnowledgeBaseNode(nodeData, processedQuery);

      case 'customOutput':
        // Get processed output
        const processedOutput = context._processedFields?.output || nodeData.output;
        return await executeOutputNode(nodeData, processedOutput);

      default:
        throw new Error(`Unknown node type: ${nodeType}`);
    }
  } catch (error) {
    console.error(`Error executing node ${node.id}:`, error);
    throw error;
  }
}
