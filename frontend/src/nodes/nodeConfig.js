// nodeConfig.js
// Centralized node configuration and icon system

// SVG Icons for each node type
export const NodeIcons = {
  input: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  output: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  text: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  llm: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6m5.657-13.657l-4.243 4.243m-2.828 2.828l-4.243 4.243m13.072 0l-4.243-4.243m-2.828-2.828L1.343 5.343"/>
    </svg>
  ),
  knowledgeBase: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
};

// Centralized node styling configuration
export const NodeStyles = {
  // Default node dimensions
  defaultWidth: 240,
  minHeight: 70,

  // Colors
  colors: {
    background: '#ffffff',
    headerBg: '#f9fafb',
    border: '#d1d5db',
    text: '#111827',
    textSecondary: '#6b7280',
    nodeNameBg: '#f3f4f6',
    nodeNameBorder: '#e5e7eb',
    nodeNameText: '#6b7280',
  },

  // Border and shadow
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',

  // Header styling
  header: {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    padding: '5px 8px',
  },

  // Body styling
  body: {
    padding: '6px 8px 8px',
    fontSize: '11px',
  },

  // Input field styling
  input: {
    padding: '4px 6px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    fontSize: '11px',
    width: '100%',
  },

  select: {
    padding: '4px 6px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    fontSize: '11px',
    width: '100%',
  },

  textarea: {
    minHeight: '50px',
    resize: 'none',
  },

  label: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#6b7280',
  },
};

// Node field configurations
export const NodeFieldTypes = {
  TEXT_INPUT: 'textInput',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  SMART_TEXTAREA: 'smartTextarea',
  SMART_INPUT: 'smartInput',
};

// Node configuration registry
export const NodeConfigurations = {
  customInput: {
    title: 'Input',
    subtitle: 'Pass data of different types into your workflow.',
    icon: NodeIcons.input,
    handles: {
      sources: [{ id: 'text', style: { top: '50%' } }],
      targets: [],
    },
    fields: [
      {
        name: 'nodeName',
        label: 'Node name',
        type: NodeFieldTypes.TEXT_INPUT,
        required: false,
      },
      {
        name: 'type',
        label: 'Type',
        type: NodeFieldTypes.SELECT,
        options: [
          { value: 'Text', label: 'Text' },
          { value: 'File', label: 'File' },
        ],
        defaultValue: 'Text',
        helpText: true,
      },
      {
        name: 'text',
        label: 'Text',
        type: NodeFieldTypes.SMART_TEXTAREA,
        required: true,
        placeholder: 'User message...',
      },
    ],
    getOutputSchema: (data) => [
      {
        name: 'text',
        type: data?.type || 'Text',
        description: 'The input value passed into the workflow'
      },
    ],
  },

  customOutput: {
    title: 'Output',
    subtitle: 'Output data of different types from your workflow.',
    icon: NodeIcons.output,
    handles: {
      sources: [],
      targets: [{ id: 'value', style: { top: '50%' } }],
    },
    fields: [
      {
        name: 'nodeName',
        label: 'Node name',
        type: NodeFieldTypes.TEXT_INPUT,
        required: false,
      },
      {
        name: 'type',
        label: 'Type',
        type: NodeFieldTypes.SELECT,
        options: [
          { value: 'Text', label: 'Text' },
          { value: 'Image', label: 'Image' },
        ],
        defaultValue: 'Text',
      },
      {
        name: 'output',
        label: 'Output',
        type: NodeFieldTypes.SMART_TEXTAREA,
        required: true,
        placeholder: 'Output value...',
      },
    ],
    getOutputSchema: () => [],
  },

  text: {
    title: 'Text',
    subtitle: 'Store and output static text.',
    icon: NodeIcons.text,
    handles: {
      sources: [{ id: 'output', style: { top: '50%' } }],
      targets: [],
    },
    fields: [
      {
        name: 'nodeName',
        label: 'Node name',
        type: NodeFieldTypes.TEXT_INPUT,
        required: false,
      },
      {
        name: 'text',
        label: 'Text',
        type: NodeFieldTypes.SMART_TEXTAREA,
        required: true,
        placeholder: 'Enter text...',
      },
    ],
    getOutputSchema: () => [
      {
        name: 'output',
        type: 'Text',
        description: 'The text content'
      },
    ],
  },

  llm: {
    title: 'LLM',
    subtitle: 'Call a language model with a prompt.',
    icon: NodeIcons.llm,
    handles: {
      sources: [
        { id: 'response', style: { top: '30%' } },
        { id: 'tokens_used', style: { top: '50%' } },
        { id: 'input_tokens', style: { top: '70%' } },
        { id: 'output_tokens', style: { top: '90%' } },
      ],
      targets: [{ id: 'prompt', style: { top: '50%' } }],
    },
    fields: [
      {
        name: 'nodeName',
        label: 'Node name',
        type: NodeFieldTypes.TEXT_INPUT,
        required: false,
      },
      {
        name: 'systemPrompt',
        label: 'System (Instructions)',
        type: NodeFieldTypes.SMART_TEXTAREA,
        required: false,
        placeholder: 'System instructions...',
      },
      {
        name: 'prompt',
        label: 'Prompt',
        type: NodeFieldTypes.SMART_TEXTAREA,
        required: true,
        placeholder: 'Enter your prompt...',
      },
    ],
    getOutputSchema: () => [
      { name: 'response', type: 'Text', description: 'The output of the LLM' },
      { name: 'tokens_used', type: 'Integer', description: 'Total number of tokens used in the LLM call' },
      { name: 'input_tokens', type: 'Integer', description: 'Total number of input tokens used in the LLM call' },
      { name: 'output_tokens', type: 'Integer', description: 'Total number of output tokens used in the LLM call' },
    ],
  },

  knowledgeBase: {
    title: 'Knowledge Base Reader',
    subtitle: 'Semantically query a knowledge base for relevant chunks.',
    icon: NodeIcons.knowledgeBase,
    handles: {
      sources: [
        { id: 'chunks', style: { top: '40%' } },
        { id: 'citation_metadata', style: { top: '70%' } },
      ],
      targets: [{ id: 'query', style: { top: '50%' } }],
    },
    fields: [
      {
        name: 'nodeName',
        label: 'Node name',
        type: NodeFieldTypes.TEXT_INPUT,
        required: false,
      },
      {
        name: 'searchQuery',
        label: 'Search Query',
        type: NodeFieldTypes.SMART_INPUT,
        required: true,
        placeholder: 'Search query...',
        helpText: true,
      },
      {
        name: 'knowledgeBase',
        label: 'Knowledge Base',
        type: NodeFieldTypes.SELECT,
        options: [
          { value: 'example_kb', label: 'Example Knowledge Base' },
        ],
        defaultValue: 'example_kb',
        helpText: true,
      },
    ],
    getOutputSchema: () => [
      {
        name: 'chunks',
        type: 'Array(3)',
        description: 'Semantically similar chunks retrieved from the knowledge base'
      },
      {
        name: 'citation_metadata',
        type: 'List[Text]',
        description: 'Citation metadata for knowledge base outputs, used for showing sources in LLM responses'
      },
    ],
  },
};

// Helper function to get node configuration
export const getNodeConfig = (nodeType) => {
  return NodeConfigurations[nodeType] || null;
};

// Helper function to get node default data
export const getNodeDefaultData = (nodeId, nodeType) => {
  const config = getNodeConfig(nodeType);
  if (!config) return { id: nodeId, nodeType };

  const defaultData = {
    id: nodeId,
    nodeType,
    nodeName: nodeId.replace(`${nodeType}-`, '').replace('custom', ''),
  };

  // Set default values for fields
  config.fields.forEach(field => {
    if (field.defaultValue !== undefined) {
      defaultData[field.name] = field.defaultValue;
    } else if (field.type === NodeFieldTypes.TEXT_INPUT || field.type === NodeFieldTypes.TEXTAREA || field.type === NodeFieldTypes.SMART_TEXTAREA || field.type === NodeFieldTypes.SMART_INPUT) {
      defaultData[field.name] = '';
    }
  });

  return defaultData;
};
