import { useCallback } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';
import { NodeConfigurations, NodeStyles, NodeFieldTypes } from './nodeConfig';
import { SmartTextInput } from '../components/SmartTextInput';

export const ConfigurableNode = ({ id, data, type }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);

  const handleFieldChange = useCallback((fieldName, value) => {
    updateNodeField(id, fieldName, value);
  }, [id, updateNodeField]);

  const config = NodeConfigurations[type];
  if (!config) {
    console.error(`No configuration found for node type: ${type}`);
    return null;
  }

  const renderField = (field) => {
    const value = data[field.name] || field.defaultValue || '';

    if (field.name === 'nodeName') {
      return null;
    }

    const fieldWrapperStyle = {
      marginBottom: '8px',
    };

    const labelStyle = {
      ...NodeStyles.label,
      marginBottom: '3px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      justifyContent: 'space-between',
    };

    const HelpIcon = () => (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    );

    const typeBadge = field.typeBadge;

    return (
      <div key={field.name} style={fieldWrapperStyle}>
        <label style={labelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{field.label}</span>
            {field.required && <span style={{ color: '#ef4444' }}>*</span>}
            {field.helpText && <HelpIcon />}
          </div>
          {typeBadge && (
            <span style={{
              backgroundColor: '#ddd6fe',
              color: '#7c3aed',
              borderRadius: '3px',
              padding: '1px 6px',
              fontSize: '9px',
              fontWeight: 500
            }}>
              {typeBadge}
            </span>
          )}
        </label>

        {field.type === NodeFieldTypes.TEXT_INPUT && (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            style={NodeStyles.input}
          />
        )}

        {field.type === NodeFieldTypes.SMART_INPUT && (
          <SmartTextInput
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            style={NodeStyles.input}
          />
        )}

        {field.type === NodeFieldTypes.TEXTAREA && (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            style={{
              ...NodeStyles.input,
              minHeight: '60px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        )}

        {field.type === NodeFieldTypes.SMART_TEXTAREA && (
          <SmartTextInput
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            multiline={true}
            style={{
              ...NodeStyles.input,
              minHeight: '60px',
              fontFamily: 'inherit',
            }}
          />
        )}

        {field.type === NodeFieldTypes.SELECT && (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            style={NodeStyles.input}
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {field.type === NodeFieldTypes.CHECKBOX && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer',
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const outputSchema = config.getOutputSchema ? config.getOutputSchema(data) : [];
  
  const handles = config.getDynamicHandles ? config.getDynamicHandles(data) : config.handles;

  return (
    <BaseNode
      id={id}
      data={data}
      icon={config.icon}
      title={config.title}
      subtitle={config.subtitle}
      handles={handles}
      outputSchema={outputSchema}
    >
      {config.fields.map(renderField)}
    </BaseNode>
  );
};
