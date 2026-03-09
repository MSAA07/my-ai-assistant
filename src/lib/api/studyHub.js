import { API_BASE } from '../../config.js';

async function requestJson(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
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

export function getDocument(documentId) {
  return requestJson(`/api/document/${documentId}`);
}

export function requestGeneration(documentId, payload) {
  return requestJson(`/api/document/${documentId}/generations`, {
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
