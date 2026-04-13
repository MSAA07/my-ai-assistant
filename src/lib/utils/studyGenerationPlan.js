const STORAGE_KEY_PREFIX = 'study-generation-plan:';

function getStorage() {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return null;
  }

  return window.sessionStorage;
}

function getPlanStorageKey(documentId) {
  return `${STORAGE_KEY_PREFIX}${documentId}`;
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function readStudyGenerationPlan(documentId) {
  const storage = getStorage();
  const normalizedDocumentId = normalizeString(documentId);
  if (!storage || !normalizedDocumentId) return null;

  try {
    const raw = storage.getItem(getPlanStorageKey(normalizedDocumentId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function writeStudyGenerationPlan(documentId, plan) {
  const storage = getStorage();
  const normalizedDocumentId = normalizeString(documentId);
  if (!storage || !normalizedDocumentId || !plan || typeof plan !== 'object') return;

  storage.setItem(getPlanStorageKey(normalizedDocumentId), JSON.stringify({
    documentId: normalizedDocumentId,
    features: plan.features ?? {},
    createdAt: plan.createdAt ?? new Date().toISOString(),
  }));
}

export function clearStudyGenerationPlan(documentId) {
  const storage = getStorage();
  const normalizedDocumentId = normalizeString(documentId);
  if (!storage || !normalizedDocumentId) return;

  storage.removeItem(getPlanStorageKey(normalizedDocumentId));
}
