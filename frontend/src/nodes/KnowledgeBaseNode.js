import { useState, useEffect, useMemo } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';
import { SmartTextInput } from '../components/SmartTextInput';
import { getNodeConfig, NodeStyles } from './nodeConfig';

export const KnowledgeBaseNode = ({ id, data, type }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const config = getNodeConfig(type);

  const [fieldValues, setFieldValues] = useState({});

  useEffect(() => {
    if (!config) return;

    const initialValues = {};
    config.fields.forEach(field => {
      initialValues[field.name] = data?.[field.name] ?? field.defaultValue ?? '';
    });
    setFieldValues(initialValues);
  }, [id, config, data]);

  useEffect(() => {
    if (!config) return;

    Object.keys(fieldValues).forEach(fieldName => {
      if (data?.[fieldName] !== fieldValues[fieldName]) {
        updateNodeField(id, fieldName, fieldValues[fieldName]);
      }
    });
  }, [id, fieldValues, updateNodeField, data, config]);

  const outputSchema = useMemo(() => {
    if (!config) return [];
    return config.getOutputSchema ? config.getOutputSchema(fieldValues) : [];
  }, [config, fieldValues]);

  const handleFieldChange = (fieldName, value) => {
    setFieldValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleEditKnowledgeBase = (e) => {
    e.preventDefault();
    alert('Edit Knowledge Base functionality');
  };

  const handleCreateKnowledgeBase = (e) => {
    e.preventDefault();
    alert('Create New Knowledge Base functionality');
  };

  if (!config) {
    return <div>Unknown node type: {type}</div>;
  }

  const HelpIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );

  const labelStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: NodeStyles.label.fontSize,
    marginTop: '6px',
  };

  const labelTextStyle = {
    fontWeight: NodeStyles.label.fontWeight,
    color: NodeStyles.label.color,
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    justifyContent: 'space-between'
  };

  return (
    <BaseNode
      id={id}
      data={{ ...data, ...fieldValues }}
      title={config.title}
      icon={config.icon}
      handles={config.handles}
      outputSchema={outputSchema}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Search Query field */}
        <label style={labelStyle}>
          <span style={labelTextStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Search Query
              <span style={{ color: '#dc2626' }}>*</span>
              <HelpIcon />
            </div>
            <span style={{
              backgroundColor: '#ddd6fe',
              color: '#7c3aed',
              borderRadius: '3px',
              padding: '1px 6px',
              fontSize: '9px',
              fontWeight: 500
            }}>
              Text
            </span>
          </span>
          <SmartTextInput
            id={`${id}-searchQuery`}
            name={`${id}-searchQuery`}
            value={fieldValues.searchQuery ?? ''}
            onChange={(e) => handleFieldChange('searchQuery', e.target.value)}
            placeholder="Search query..."
          />
        </label>

        {/* Knowledge Base dropdown */}
        <label style={labelStyle}>
          <span style={labelTextStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Knowledge Base
              <span style={{ color: '#dc2626' }}>*</span>
              <HelpIcon />
            </div>
            <span style={{
              backgroundColor: '#c7d2fe',
              color: '#6366f1',
              borderRadius: '3px',
              padding: '1px 6px',
              fontSize: '9px',
              fontWeight: 500
            }}>
              Any
            </span>
          </span>
          <select
            id={`${id}-knowledgeBase`}
            name={`${id}-knowledgeBase`}
            value={fieldValues.knowledgeBase ?? 'example_kb'}
            onChange={(e) => handleFieldChange('knowledgeBase', e.target.value)}
            style={NodeStyles.select}
          >
            <option value="example_kb">Example Knowledge Base</option>
          </select>
        </label>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
          <button
            onClick={handleEditKnowledgeBase}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: 500,
              color: '#374151',
              background: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Knowledge Base
          </button>

          <button
            onClick={handleCreateKnowledgeBase}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: 500,
              color: '#374151',
              background: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create New Knowledge Base
          </button>
        </div>
      </div>
    </BaseNode>
  );
};
