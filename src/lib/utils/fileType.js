const MIME_TYPE_LABELS = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX'
};

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function getDocumentFileTypeLabel(document, { fallback = '' } = {}) {
  const fileName = normalizeString(document?.originalName || document?.title);
  if (fileName.includes('.')) {
    const extension = normalizeString(fileName.split('.').pop());
    if (extension) {
      return extension.slice(0, 5).toUpperCase();
    }
  }

  const explicitType = normalizeString(document?.fileType || document?.mimeType).toLowerCase();
  if (!explicitType) {
    return fallback;
  }

  const mappedType = MIME_TYPE_LABELS[explicitType];
  if (mappedType) {
    return mappedType;
  }

  const normalizedType = explicitType.includes('/')
    ? explicitType.split('/').pop()
    : explicitType;

  const cleanedType = normalizedType.replace(/^vnd\./, '');
  return cleanedType ? cleanedType.slice(0, 5).toUpperCase() : fallback;
}
