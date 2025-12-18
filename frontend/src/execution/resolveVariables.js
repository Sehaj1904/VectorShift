export function resolveVariables(text, context) {
  return text.replace(/\{\{\s*([\w-]+)\.([\w_]+)\s*\}\}/g,
    (_, node, field) => context[node]?.[field] ?? ''
  );
}
