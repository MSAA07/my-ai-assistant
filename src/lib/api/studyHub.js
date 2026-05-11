import { API_BASE } from '../../config.js';

async function requestJson(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    cache: 'no-store',
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || 'Request failed');
  }

  return data;
}

function parseDownloadFileName(contentDisposition, fallback = 'study-export.pdf') {
  if (typeof contentDisposition !== 'string' || !contentDisposition.trim()) {
    return fallback;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]).trim();
  }

  const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  if (fileNameMatch?.[1]) {
    return fileNameMatch[1].trim();
  }

  return fallback;
}

export function getDocument(documentId) {
  return requestJson(`/api/document/${documentId}`);
}

export function getJob(jobId) {
  return requestJson(`/api/jobs/${jobId}`);
}

export async function exportStudyMaterialPdf(documentId, feature) {
  const response = await fetch(`${API_BASE}/api/document/${documentId}/export-pdf?feature=${encodeURIComponent(feature)}`, {
    method: 'GET',
    credentials: 'include'
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || 'Failed to export PDF');
  }

  const blob = await response.blob();
  return {
    blob,
    fileName: parseDownloadFileName(response.headers.get('content-disposition'), `${feature}.pdf`)
  };
}

export function requestGeneration(documentId, payload) {
  return requestJson(`/api/document/${documentId}/generations`, {
    method: 'POST',
    body: payload
  });
}

export function saveFlashcardProgress(payload) {
  return requestJson('/api/flashcard/progress', {
    method: 'POST',
    body: payload
  });
}

export function saveLegacyExamAttempt(payload) {
  return requestJson('/api/exam/attempt', {
    method: 'POST',
    body: payload
  });
}

export function listFlashcardSets(documentId, { page = 1, limit = 20 } = {}) {
  return requestJson(`/api/document/${documentId}/flashcard-sets?page=${page}&limit=${limit}`);
}

export function getFlashcardSet(setId) {
  return requestJson(`/api/flashcard-sets/${setId}`);
}

export function patchFlashcardCardState(setId, cardId, patch) {
  return requestJson(`/api/flashcard-sets/${setId}/cards/${cardId}/state`, {
    method: 'PATCH',
    body: patch
  });
}

export function getIncorrectSession(setId) {
  return requestJson(`/api/flashcard-sets/${setId}/incorrect-session`);
}

export function listExams(documentId, { page = 1, limit = 20 } = {}) {
  return requestJson(`/api/document/${documentId}/exams?page=${page}&limit=${limit}`);
}

export function getExam(examId) {
  return requestJson(`/api/exams/${examId}`);
}

export function getCurrentAttempt(examId) {
  return requestJson(`/api/exams/${examId}/attempts/current`);
}

export function createExamAttempt(examId, payload = {}) {
  return requestJson(`/api/exams/${examId}/attempts`, {
    method: 'POST',
    body: payload
  });
}

export function saveExamAttempt(attemptId, answers) {
  return requestJson(`/api/exam-attempts/${attemptId}/save`, {
    method: 'POST',
    body: { answers }
  });
}

export function submitExamAttempt(attemptId, answers) {
  return requestJson(`/api/exam-attempts/${attemptId}/submit`, {
    method: 'POST',
    body: { answers }
  });
}

export function restartExamAttempt(attemptId) {
  return requestJson(`/api/exam-attempts/${attemptId}/restart`, {
    method: 'POST',
    body: {}
  });
}

export function reviewExamAttempt(attemptId) {
  return requestJson(`/api/exam-attempts/${attemptId}/review`);
}

export function listExportArtifacts({ page = 1, limit = 50 } = {}) {
  return requestJson(`/api/exports?page=${page}&limit=${limit}`);
}

export function createExamExport(payload) {
  return requestJson('/api/exports/exams', {
    method: 'POST',
    body: payload
  });
}

export function getExportDownloadUrl(artifactId) {
  return `${API_BASE}/api/exports/${artifactId}/download`;
}

export function getTelegramStatus() {
  return requestJson('/api/telegram/status');
}

export function createTelegramLinkToken() {
  return requestJson('/api/telegram/link-token', {
    method: 'POST',
    body: {}
  });
}

export function disconnectTelegram() {
  return requestJson('/api/telegram/link', {
    method: 'DELETE'
  });
}

export function sendDocumentFlashcardsToTelegram(documentId) {
  return requestJson(`/api/document/${documentId}/telegram/flashcards/send`, {
    method: 'POST',
    body: {}
  });
}

export function sendDocumentExamToTelegram(documentId) {
  return requestJson(`/api/document/${documentId}/telegram/exam/send`, {
    method: 'POST',
    body: {}
  });
}
