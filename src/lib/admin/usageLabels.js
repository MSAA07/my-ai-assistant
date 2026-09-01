function configuredLabel(row, { nameKey = '', idKey = '', labelKey = '' } = {}) {
  if (labelKey && row?.[labelKey] !== null && row?.[labelKey] !== undefined) {
    return String(row[labelKey]);
  }

  if (nameKey) {
    const value = row?.[nameKey];
    if (value && typeof value === 'object') {
      const nested = value.originalName || value.name || value.email || value.label || value.id;
      if (nested) return String(nested);
    } else if (value !== null && value !== undefined && value !== '') {
      return String(value);
    }
  }

  if (idKey && row?.[idKey] !== null && row?.[idKey] !== undefined) {
    return String(row[idKey]);
  }
  return '';
}

export function resolveUsageLabel(row, config = {}) {
  const explicit = configuredLabel(row, config);
  if (explicit) return explicit;

  if (config.type === 'documents') return row.document?.originalName || row.documentId || '-';
  if (config.type === 'features') return row.featureKey || '-';
  if (config.type === 'models') return row.model || '-';
  return row.user?.name || row.user?.email || row.userId || '-';
}
