
<script>
  import { onDestroy } from 'svelte';
  import { API_BASE } from '../config.js';
  import SourceRefsCompact from '../lib/components/ui/SourceRefsCompact.svelte';
  import {
    createExamAttempt,
    createExamExport,
    getCurrentAttempt,
    getDocument,
    getExam,
    getExportDownloadUrl,
    getFlashcardSet,
    getIncorrectSession,
    listExams,
    listExportArtifacts,
    listFlashcardSets,
    patchFlashcardCardState,
    requestGeneration,
    restartExamAttempt,
    reviewExamAttempt,
    saveExamAttempt,
    submitExamAttempt
  } from '../lib/api/studyHub.js';

  export let documentId = '';
  export let studyTab = 'summary';

  const VALID_TABS = new Set(['summary', 'flashcards', 'exams', 'exports']);
  const POLL_INTERVAL_MS = 2500;
  const EXPORT_POLL_INTERVAL_MS = 3500;
  const EXAM_AUTOSAVE_DELAY_MS = 1200;

  let docsForSwitcher = [];
  let currentDocumentId = '';
  let documentData = null;
  let loadingDocument = true;
  let documentError = '';
  let pollTimer = null;
  let exportPollTimer = null;
  let activeTab = 'summary';
  let summaryLength = 'medium';
  let summaryRequestInFlight = false;
  let summaryRefreshing = false;
  let generationError = '';
  let summaryActionNotice = '';

  let flashcardLoading = false;
  let flashcardSetLoading = false;
  let flashcardGenerationBusy = false;
  let incorrectSessionLoading = false;
  let flashcardError = '';
  let flashcardActionNotice = '';
  let flashcardSets = [];
  let selectedSetId = '';
  let flashcardSet = null;
  let flashcardCardIndex = 0;
  let flashcardShowAnswer = false;
  let incorrectSessionCards = [];
  let incorrectSessionEnabled = false;
  let patchingCardId = '';

  let examsLoading = false;
  let examDetailLoading = false;
  let examGenerationBusy = false;
  let examsError = '';
  let examRecords = [];
  let selectedExamId = '';
  let examDetail = null;
  let currentAttempt = null;
  let reviewPayload = null;
  let reviewAttemptId = '';
  let examAnswers = {};
  let examQuestionIndex = 0;
  let examFeedbackMode = 'end';
  let examActionBusy = false;
  let examSaveBusy = false;
  let examAutosaveTimer = null;
  let examAutosaveStatus = 'idle';
  let examAutosaveError = '';
  let examAutosaveSavedAt = '';
  let lastSavedAnswerSignature = '';

  let exportsLoading = false;
  let exportsError = '';
  let exportArtifacts = [];
  let exportActionBusy = false;
  let selectedExportExamId = '';
  let exportsNotice = '';
  let exportsLastUpdatedAt = '';

  $: normalizedRequestedTab = VALID_TABS.has((studyTab || '').toLowerCase()) ? studyTab.toLowerCase() : 'summary';
  $: if (activeTab !== normalizedRequestedTab) {
    activeTab = normalizedRequestedTab;
    if (activeTab !== 'exports') {
      clearExportPollTimer();
    }
    void loadTabData(activeTab);
  }

  $: if (documentId && documentId !== currentDocumentId) {
    currentDocumentId = documentId;
    resetStateForDocument();
    void fetchDocumentState();
    void fetchDocumentOptions();
    void loadTabData(activeTab, { force: true });
  }

  $: summaryStatus = normalizeGenerationStatus(documentData?.generationState?.summary?.status);
  $: flashcardGenerationStatus = normalizeGenerationStatus(documentData?.generationState?.flashcards?.status);
  $: examGenerationStatus = normalizeGenerationStatus(documentData?.generationState?.exam?.status);
  $: extractionStatus = normalizeDocumentStatus(documentData?.processingStatus);
  $: summaryCanGenerate = extractionStatus === 'complete' && !summaryRequestInFlight;
  $: summaryHasContent = typeof documentData?.summary === 'string' && documentData.summary.trim().length > 0;
  $: summaryBanner = getSummaryBanner(summaryStatus, summaryHasContent);
  $: structuredSummarySections = splitSummarySections(documentData?.summary ?? '');
  $: legacyFlashcardCount = Array.isArray(documentData?.flashcards) ? documentData.flashcards.length : 0;
  $: legacyExamQuestionCount = Array.isArray(documentData?.examQuestions) ? documentData.examQuestions.length : 0;
  $: hasLegacyFlashcards = legacyFlashcardCount > 0;
  $: hasLegacyExamQuestions = legacyExamQuestionCount > 0;

  $: flashcardCards = Array.isArray(flashcardSet?.cards) ? flashcardSet.cards : [];
  $: hiddenFlashcardCount = flashcardCards.filter((card) => card?.state?.isHidden).length;
  $: deletedFlashcardCount = flashcardCards.filter((card) => card?.state?.isDeletedForUser || card?.isDeleted).length;
  $: visibleFlashcards = flashcardCards.filter((card) =>
    !card?.isDeleted && !card?.state?.isDeletedForUser && !card?.state?.isHidden
  );
  $: incorrectEligibleCount = visibleFlashcards.filter((card) => card?.state?.lastResult === 'incorrect').length;
  $: studyCards = incorrectSessionEnabled ? incorrectSessionCards : visibleFlashcards;
  $: currentStudyCard = studyCards[flashcardCardIndex] ?? null;
  $: if (studyCards.length > 0 && flashcardCardIndex > studyCards.length - 1) {
    flashcardCardIndex = studyCards.length - 1;
    flashcardShowAnswer = false;
  }
  $: shouldUseRegenerateFlashcards = flashcardSets.length > 0 || flashcardGenerationStatus === 'complete';

  $: examQuestions = Array.isArray(examDetail?.questions) ? examDetail.questions : [];
  $: examQuestion = examQuestions[examQuestionIndex] ?? null;
  $: hasInProgressAttempt = currentAttempt?.status === 'in_progress';
  $: isExamFinished = currentAttempt?.status === 'submitted';
  $: answeredExamCount = examQuestions.reduce(
    (count, question) => (normalizeAnswerInput(examAnswers[question.id]).length > 0 ? count + 1 : count),
    0
  );
  $: currentAnswerSignature = getAnswersSignature(examAnswers, examQuestions);
  $: if (hasInProgressAttempt && activeTab === 'exams' && !examActionBusy && !examSaveBusy && currentAnswerSignature !== lastSavedAnswerSignature) {
    scheduleExamAutosave();
  }
  $: reviewQuestions = Array.isArray(reviewPayload?.questions) ? reviewPayload.questions : [];
  $: reviewAnswersByQuestion = normalizeAnswers(reviewPayload?.answers, reviewQuestions);
  $: reviewScorePercent = getScorePercent(reviewPayload?.score, reviewPayload?.totalQuestions);
  $: hasActiveExportJobs = exportArtifacts.some((artifact) => artifact?.status === 'queued' || artifact?.status === 'running');

  onDestroy(() => {
    clearPollTimer();
    clearExportPollTimer();
    clearExamAutosaveTimer();
  });

  function resetStateForDocument() {
    clearPollTimer();
    clearExportPollTimer();
    clearExamAutosaveTimer();
    documentData = null;
    loadingDocument = true;
    documentError = '';
    summaryRefreshing = false;
    generationError = '';
    summaryActionNotice = '';
    flashcardSetLoading = false;
    flashcardGenerationBusy = false;
    incorrectSessionLoading = false;
    flashcardError = '';
    flashcardActionNotice = '';
    flashcardSets = [];
    selectedSetId = '';
    flashcardSet = null;
    flashcardCardIndex = 0;
    flashcardShowAnswer = false;
    incorrectSessionCards = [];
    incorrectSessionEnabled = false;
    patchingCardId = '';
    examDetailLoading = false;
    examGenerationBusy = false;
    examsError = '';
    examRecords = [];
    selectedExamId = '';
    examDetail = null;
    currentAttempt = null;
    reviewPayload = null;
    reviewAttemptId = '';
    examAnswers = {};
    examQuestionIndex = 0;
    examFeedbackMode = 'end';
    examActionBusy = false;
    examSaveBusy = false;
    examAutosaveStatus = 'idle';
    examAutosaveError = '';
    examAutosaveSavedAt = '';
    lastSavedAnswerSignature = '';
    exportsError = '';
    exportArtifacts = [];
    exportActionBusy = false;
    selectedExportExamId = '';
    exportsNotice = '';
    exportsLastUpdatedAt = '';
  }

  function normalizeAnswerInput(value) {
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
    return '';
  }

  function normalizeComparableAnswer(value, questionType) {
    const normalized = normalizeAnswerInput(value).toLowerCase();
    if (questionType === 'true_false') {
      if (normalized === 't') return 'true';
      if (normalized === 'f') return 'false';
    }
    return normalized;
  }

  function getScorePercent(score, total) {
    const parsedScore = Number(score);
    const parsedTotal = Number(total);
    if (!Number.isFinite(parsedScore) || !Number.isFinite(parsedTotal) || parsedTotal <= 0) {
      return 0;
    }
    return Math.round((parsedScore / parsedTotal) * 100);
  }

  function normalizeDocumentStatus(status) {
    const value = typeof status === 'string' ? status.toLowerCase() : '';
    return value === 'queued' || value === 'processing' || value === 'complete' || value === 'failed'
      ? value
      : 'failed';
  }

  function normalizeGenerationStatus(status) {
    const value = typeof status === 'string' ? status.toLowerCase() : '';
    return value === 'queued' || value === 'running' || value === 'complete' || value === 'failed' || value === 'not_requested'
      ? value
      : 'not_requested';
  }

  function shouldPollDocument(document) {
    const extraction = normalizeDocumentStatus(document?.processingStatus);
    if (extraction === 'queued' || extraction === 'processing') {
      return true;
    }

    const statuses = ['summary', 'flashcards', 'exam']
      .map((feature) => normalizeGenerationStatus(document?.generationState?.[feature]?.status));

    return statuses.includes('queued') || statuses.includes('running');
  }

  function schedulePoll() {
    clearPollTimer();
    pollTimer = setTimeout(() => {
      void fetchDocumentState({ background: true });
    }, POLL_INTERVAL_MS);
  }

  function clearPollTimer() {
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
  }

  function scheduleExportPoll() {
    clearExportPollTimer();
    exportPollTimer = setTimeout(() => {
      if (activeTab === 'exports') {
        void loadExportArtifacts({ force: true });
      }
    }, EXPORT_POLL_INTERVAL_MS);
  }

  function clearExportPollTimer() {
    if (exportPollTimer) {
      clearTimeout(exportPollTimer);
      exportPollTimer = null;
    }
  }

  function clearExamAutosaveTimer() {
    if (examAutosaveTimer) {
      clearTimeout(examAutosaveTimer);
      examAutosaveTimer = null;
    }
  }

  function scheduleExamAutosave() {
    clearExamAutosaveTimer();
    examAutosaveStatus = 'scheduled';
    examAutosaveTimer = setTimeout(() => {
      void saveAttempt({ manual: false });
    }, EXAM_AUTOSAVE_DELAY_MS);
  }

  function formatDate(value) {
    if (!value) return 'Unknown';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Unknown';
    return parsed.toLocaleDateString();
  }

  function formatDateTime(value) {
    if (!value) return 'Unknown';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Unknown';
    return parsed.toLocaleString();
  }

  function formatRelativeTime(value) {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    const diffSec = Math.round((Date.now() - parsed.getTime()) / 1000);
    if (Math.abs(diffSec) < 60) return 'just now';
    const diffMin = Math.round(diffSec / 60);
    if (Math.abs(diffMin) < 60) return `${diffMin}m ago`;
    const diffHr = Math.round(diffMin / 60);
    if (Math.abs(diffHr) < 24) return `${diffHr}h ago`;
    const diffDay = Math.round(diffHr / 24);
    return `${diffDay}d ago`;
  }

  function examAutosaveLabel() {
    if (!hasInProgressAttempt) return '';
    if (examAutosaveStatus === 'saving') return 'Autosave: saving...';
    if (examAutosaveStatus === 'scheduled') return 'Autosave: pending changes';
    if (examAutosaveStatus === 'error') return `Autosave failed: ${examAutosaveError || 'Unknown error'}`;
    if (examAutosaveStatus === 'saved') {
      return examAutosaveSavedAt ? `Autosave: saved ${formatRelativeTime(examAutosaveSavedAt)}` : 'Autosave: saved';
    }
    return 'Autosave: idle';
  }

  async function fetchDocumentOptions() {
    try {
      const response = await fetch(`${API_BASE}/api/user/me`, { credentials: 'include' });
      if (!response.ok) {
        return;
      }
      const data = await response.json().catch(() => null);
      docsForSwitcher = Array.isArray(data?.documents) ? data.documents : [];
    } catch {
      docsForSwitcher = [];
    }
  }

  async function fetchDocumentState({ background = false } = {}) {
    if (!background) {
      loadingDocument = true;
      documentError = '';
    }

    clearPollTimer();

    try {
      const requestedDocumentId = currentDocumentId;
      const data = await getDocument(requestedDocumentId);
      if (requestedDocumentId !== currentDocumentId) {
        return;
      }
      documentData = data?.document ?? null;

      if (!documentData) {
        documentError = 'Document not found';
      }

      if (shouldPollDocument(documentData)) {
        schedulePoll();
      }
    } catch (err) {
      if (!background) {
        documentError = err?.message || 'Failed to load document';
      } else if (documentData && shouldPollDocument(documentData)) {
        schedulePoll();
      }
    } finally {
      if (!background) {
        loadingDocument = false;
      }
    }
  }

  async function refreshActiveTab() {
    if (activeTab === 'summary') {
      summaryRefreshing = true;
      await fetchDocumentState();
      summaryRefreshing = false;
      return;
    }

    await loadTabData(activeTab, { force: true });
  }

  function setTab(nextTab) {
    const safeTab = VALID_TABS.has(nextTab) ? nextTab : 'summary';
    window.location.hash = `/study/${currentDocumentId}/${safeTab}`;
  }

  function switchDocument(nextId) {
    if (!nextId || nextId === currentDocumentId) {
      return;
    }
    window.location.hash = `/study/${nextId}/${activeTab}`;
  }

  function goBackToStudyHub() {
    window.location.hash = '/study';
  }

  function openLegacyDocumentView() {
    window.location.hash = `/legacy/documents/${currentDocumentId}/summary`;
  }

  async function regenerateSummary() {
    if (!summaryCanGenerate) {
      return;
    }

    const shouldConfirm = summaryHasContent || summaryStatus === 'complete';
    if (shouldConfirm) {
      const confirmed = window.confirm(
        'Regenerate summary? Your current summary will stay visible until the new generation finishes.'
      );
      if (!confirmed) {
        return;
      }
    }

    summaryRequestInFlight = true;
    generationError = '';
    summaryActionNotice = '';

    try {
      await requestGeneration(currentDocumentId, {
        type: 'summary',
        options: { length: summaryLength },
        regenerate: shouldConfirm
      });
      summaryActionNotice = summaryHasContent
        ? 'Summary regeneration queued. Existing summary remains visible while processing.'
        : 'Summary generation queued.';
      await fetchDocumentState({ background: true });
    } catch (err) {
      generationError = err?.message || 'Failed to start summary generation';
    } finally {
      summaryRequestInFlight = false;
    }
  }

  async function generateFlashcards() {
    if (extractionStatus !== 'complete' || flashcardGenerationBusy) {
      return;
    }

    flashcardGenerationBusy = true;
    flashcardError = '';

    try {
      await requestGeneration(currentDocumentId, {
        type: 'flashcards',
        options: {},
        regenerate: shouldUseRegenerateFlashcards
      });
      flashcardActionNotice = shouldUseRegenerateFlashcards
        ? 'Flashcard regeneration queued. Existing sets remain available while processing.'
        : 'Flashcard generation queued.';
      await fetchDocumentState({ background: true });
      await loadFlashcardSets({ force: true });
    } catch (err) {
      flashcardError = err?.message || 'Failed to queue flashcard generation';
    } finally {
      flashcardGenerationBusy = false;
    }
  }

  async function generateExam() {
    if (extractionStatus !== 'complete' || examGenerationBusy) {
      return;
    }

    examGenerationBusy = true;
    examsError = '';

    try {
      await requestGeneration(currentDocumentId, {
        type: 'exam',
        options: { questionCount: 10 },
        regenerate: examRecords.length > 0 || examGenerationStatus === 'complete'
      });
      await fetchDocumentState({ background: true });
      await loadExamRecords({ force: true });
    } catch (err) {
      examsError = err?.message || 'Failed to queue exam generation';
    } finally {
      examGenerationBusy = false;
    }
  }

  async function loadTabData(tabId, { force = false } = {}) {
    if (!currentDocumentId) {
      return;
    }

    if (tabId === 'flashcards') {
      await loadFlashcardSets({ force });
      return;
    }

    if (tabId === 'exams') {
      await loadExamRecords({ force });
      return;
    }

    if (tabId === 'exports') {
      await Promise.all([
        loadExportArtifacts({ force: true }),
        examRecords.length === 0 || force ? loadExamRecords({ force }) : Promise.resolve()
      ]);
    }
  }
  function ensureFlashcardIndexInBounds() {
    if (studyCards.length === 0) {
      flashcardCardIndex = 0;
      return;
    }
    flashcardCardIndex = Math.max(0, Math.min(flashcardCardIndex, studyCards.length - 1));
  }

  function updateCardStateLocally(cardId, patch) {
    if (!flashcardSet?.cards) {
      return;
    }

    flashcardSet = {
      ...flashcardSet,
      cards: flashcardSet.cards.map((card) => (
        card.id !== cardId
          ? card
          : {
            ...card,
            state: {
              ...(card.state ?? {}),
              ...patch,
              updatedAt: new Date().toISOString()
            }
          }
      ))
    };
  }

  async function refreshCurrentSetSilently() {
    if (!selectedSetId) {
      return;
    }
    try {
      const data = await getFlashcardSet(selectedSetId);
      if (data?.flashcardSet && selectedSetId) {
        flashcardSet = data.flashcardSet;
        ensureFlashcardIndexInBounds();
      }
    } catch {}
  }

  async function loadFlashcardSets({ force = false } = {}) {
    if (flashcardLoading && !force) {
      return;
    }

    flashcardLoading = true;
    flashcardError = '';

    try {
      const requestedDocumentId = currentDocumentId;
      const data = await listFlashcardSets(requestedDocumentId, { page: 1, limit: 50 });
      if (requestedDocumentId !== currentDocumentId) {
        return;
      }

      flashcardSets = Array.isArray(data?.flashcardSets) ? data.flashcardSets : [];
      const selectedExists = flashcardSets.some((set) => set.id === selectedSetId);
      selectedSetId = selectedExists ? selectedSetId : flashcardSets[0]?.id || '';

      if (selectedSetId && flashcardSets.length > 0) {
        await openFlashcardSet(selectedSetId);
      } else {
        flashcardSet = null;
      }
    } catch (err) {
      flashcardError = err?.message || 'Failed to load flashcard sets';
    } finally {
      flashcardLoading = false;
    }
  }

  async function openFlashcardSet(setId) {
    if (!setId) {
      flashcardSet = null;
      selectedSetId = '';
      return;
    }

    const requestedSetId = setId;
    const requestedDocumentId = currentDocumentId;

    selectedSetId = setId;
    flashcardSetLoading = true;
    flashcardError = '';
    flashcardCardIndex = 0;
    flashcardShowAnswer = false;
    incorrectSessionEnabled = false;
    incorrectSessionCards = [];

    try {
      const data = await getFlashcardSet(requestedSetId);
      if (requestedSetId !== selectedSetId || requestedDocumentId !== currentDocumentId) {
        return;
      }
      flashcardSet = data?.flashcardSet ?? null;
      ensureFlashcardIndexInBounds();
    } catch (err) {
      flashcardError = err?.message || 'Failed to open flashcard set';
      flashcardSet = null;
    } finally {
      flashcardSetLoading = false;
    }
  }

  async function startIncorrectSession() {
    if (!selectedSetId || incorrectSessionLoading) {
      return;
    }

    incorrectSessionLoading = true;
    flashcardError = '';
    flashcardActionNotice = '';
    flashcardCardIndex = 0;
    flashcardShowAnswer = false;

    try {
      const requestedSetId = selectedSetId;
      const data = await getIncorrectSession(requestedSetId);
      if (requestedSetId !== selectedSetId) {
        return;
      }
      incorrectSessionCards = Array.isArray(data?.cards) ? data.cards : [];
      incorrectSessionEnabled = true;
      flashcardActionNotice = incorrectSessionCards.length === 0
        ? 'No incorrect cards available for this set.'
        : 'Incorrect-card session started.';
    } catch (err) {
      flashcardError = err?.message || 'Failed to load incorrect-card session';
      incorrectSessionEnabled = false;
      incorrectSessionCards = [];
    } finally {
      incorrectSessionLoading = false;
    }
  }

  function stopIncorrectSession() {
    incorrectSessionEnabled = false;
    incorrectSessionCards = [];
    flashcardCardIndex = 0;
    flashcardShowAnswer = false;
    flashcardActionNotice = '';
  }

  async function patchCurrentCard(card, patch, successMessage) {
    if (!card?.id || !selectedSetId || patchingCardId) {
      return false;
    }

    patchingCardId = card.id;
    flashcardError = '';

    try {
      await patchFlashcardCardState(selectedSetId, card.id, patch);
      updateCardStateLocally(card.id, patch);
      flashcardActionNotice = successMessage;
      return true;
    } catch (err) {
      flashcardError = err?.message || 'Failed to update card state';
      return false;
    } finally {
      patchingCardId = '';
    }
  }

  async function hideCardForSet(card) {
    if (!card?.id) return;
    if (!window.confirm('Hide this card in the selected set?')) return;

    const updated = await patchCurrentCard(card, { isHidden: true }, 'Card hidden for this set.');
    if (!updated) return;

    incorrectSessionCards = incorrectSessionCards.filter((item) => item.id !== card.id);
    ensureFlashcardIndexInBounds();
    flashcardShowAnswer = false;
    void refreshCurrentSetSilently();
  }

  async function deleteCardForSet(card) {
    if (!card?.id) return;
    if (!window.confirm('Delete this card for your account in the selected set?')) return;

    const updated = await patchCurrentCard(card, { isDeletedForUser: true }, 'Card deleted for your account.');
    if (!updated) return;

    incorrectSessionCards = incorrectSessionCards.filter((item) => item.id !== card.id);
    ensureFlashcardIndexInBounds();
    flashcardShowAnswer = false;
    void refreshCurrentSetSilently();
  }

  async function markCardResult(card, result) {
    if (!card?.id) {
      return;
    }

    const updated = await patchCurrentCard(
      card,
      { lastResult: result, mastered: result === 'correct' },
      result === 'correct' ? 'Marked as correct.' : 'Marked as incorrect.'
    );
    if (!updated) {
      return;
    }

    if (incorrectSessionEnabled) {
      incorrectSessionCards = incorrectSessionCards.filter((item) => item.id !== card.id);
      ensureFlashcardIndexInBounds();
    } else if (flashcardCardIndex < studyCards.length - 1) {
      flashcardCardIndex += 1;
    }

    flashcardShowAnswer = false;
    void refreshCurrentSetSilently();
  }

  async function loadExamRecords({ force = false } = {}) {
    if (examsLoading && !force) {
      return;
    }

    examsLoading = true;
    examsError = '';

    try {
      const requestedDocumentId = currentDocumentId;
      const data = await listExams(requestedDocumentId, { page: 1, limit: 50 });
      if (requestedDocumentId !== currentDocumentId) {
        return;
      }

      examRecords = Array.isArray(data?.exams) ? data.exams : [];
      const selectedExists = examRecords.some((exam) => exam.id === selectedExamId);
      selectedExamId = selectedExists ? selectedExamId : (examRecords[0]?.id || '');
      if (!selectedExportExamId || !examRecords.some((exam) => exam.id === selectedExportExamId)) {
        selectedExportExamId = selectedExamId || examRecords[0]?.id || '';
      }

      if (selectedExamId && examRecords.length > 0) {
        await openExam(selectedExamId, { force: force || !selectedExists });
      } else {
        examDetail = null;
        currentAttempt = null;
        reviewPayload = null;
        reviewAttemptId = '';
        examAnswers = {};
        examQuestionIndex = 0;
      }
    } catch (err) {
      examsError = err?.message || 'Failed to load exams';
    } finally {
      examsLoading = false;
    }
  }

  async function openExam(examId, { force = false } = {}) {
    if (!examId) {
      return;
    }

    if (!force && selectedExamId === examId && examDetail && !examDetailLoading) {
      return;
    }

    selectedExamId = examId;
    examsError = '';
    examQuestionIndex = 0;
    examDetailLoading = true;

    try {
      const [examData, currentAttemptData] = await Promise.all([
        getExam(examId),
        getCurrentAttempt(examId)
      ]);
      examDetail = examData?.exam ?? null;
      const fallbackSubmitted = currentAttempt?.status === 'submitted' && currentAttempt?.examRecordId === examId
        ? currentAttempt
        : null;
      currentAttempt = currentAttemptData?.attempt ?? fallbackSubmitted ?? null;
      examAnswers = normalizeAnswers(currentAttempt?.answers, examDetail?.questions ?? []);
      lastSavedAnswerSignature = getAnswersSignature(examAnswers, examDetail?.questions ?? []);
      if (currentAttempt?.status === 'in_progress') {
        examAutosaveStatus = 'saved';
        examAutosaveError = '';
        examAutosaveSavedAt = currentAttempt?.lastSavedAt ?? '';
      } else {
        examAutosaveStatus = 'idle';
        examAutosaveError = '';
        examAutosaveSavedAt = '';
      }
      if (!currentAttempt || reviewAttemptId !== currentAttempt.id) {
        reviewPayload = null;
        reviewAttemptId = '';
      }
    } catch (err) {
      examsError = err?.message || 'Failed to open exam';
    } finally {
      examDetailLoading = false;
    }
  }

  function normalizeAnswers(rawAnswers, questions) {
    const result = {};
    for (const question of questions) {
      result[question.id] = '';
    }

    if (Array.isArray(rawAnswers)) {
      for (const entry of rawAnswers) {
        const key = typeof entry?.questionId === 'string' ? entry.questionId : null;
        const value = normalizeAnswerInput(entry?.answer ?? entry?.value);
        const position = Number(entry?.position);
        if (!value) {
          continue;
        }
        if (key && Object.prototype.hasOwnProperty.call(result, key)) {
          result[key] = value;
          continue;
        }
        if (Number.isFinite(position)) {
          const question = questions.find((item) => item.position === position);
          if (question) {
            result[question.id] = value;
          }
        }
      }
      return result;
    }

    if (rawAnswers && typeof rawAnswers === 'object') {
      for (const [key, value] of Object.entries(rawAnswers)) {
        const normalized = normalizeAnswerInput(value);
        if (!normalized) {
          continue;
        }
        if (Object.prototype.hasOwnProperty.call(result, key)) {
          result[key] = normalized;
          continue;
        }
        const position = Number(key);
        if (Number.isFinite(position)) {
          const question = questions.find((item) => item.position === position);
          if (question) {
            result[question.id] = normalized;
          }
        }
      }
    }

    return result;
  }

  function answersToPayload(answersMap = examAnswers, questions = examQuestions) {
    return questions.map((question) => ({
      questionId: question.id,
      position: question.position,
      answer: normalizeAnswerInput(answersMap[question.id])
    }));
  }

  function getAnswersSignature(answersMap = examAnswers, questions = examQuestions) {
    return JSON.stringify(
      questions.map((question) => [question.id, normalizeAnswerInput(answersMap[question.id])])
    );
  }

  function setExamAnswer(questionId, value) {
    examAnswers = {
      ...examAnswers,
      [questionId]: value
    };
  }

  async function startNewAttempt() {
    if (!selectedExamId || examActionBusy || hasInProgressAttempt) {
      return;
    }

    examActionBusy = true;
    examsError = '';

    try {
      const data = await createExamAttempt(selectedExamId, { feedbackMode: examFeedbackMode });
      currentAttempt = data?.attempt ?? null;
      reviewPayload = null;
      reviewAttemptId = '';
      examAnswers = normalizeAnswers(currentAttempt?.answers, examQuestions);
      examQuestionIndex = 0;
      lastSavedAnswerSignature = getAnswersSignature(examAnswers, examQuestions);
      examAutosaveStatus = 'saved';
      examAutosaveError = '';
      examAutosaveSavedAt = currentAttempt?.lastSavedAt ?? new Date().toISOString();
    } catch (err) {
      examsError = err?.message || 'Failed to create attempt';
    } finally {
      examActionBusy = false;
    }
  }

  async function saveAttempt({ manual = true } = {}) {
    if (!hasInProgressAttempt || examActionBusy || examSaveBusy) {
      return false;
    }

    const signature = getAnswersSignature(examAnswers, examQuestions);
    if (signature === lastSavedAnswerSignature) {
      examAutosaveStatus = 'saved';
      return true;
    }

    examSaveBusy = true;
    examAutosaveStatus = 'saving';
    examAutosaveError = '';
    clearExamAutosaveTimer();
    if (manual) {
      examsError = '';
    }

    try {
      const data = await saveExamAttempt(currentAttempt.id, answersToPayload());
      currentAttempt = data?.attempt ?? currentAttempt;
      examAnswers = normalizeAnswers(currentAttempt?.answers, examQuestions);
      lastSavedAnswerSignature = getAnswersSignature(examAnswers, examQuestions);
      examAutosaveSavedAt = currentAttempt?.lastSavedAt ?? new Date().toISOString();
      examAutosaveStatus = 'saved';
      return true;
    } catch (err) {
      const message = err?.message || 'Failed to save attempt';
      examAutosaveStatus = 'error';
      examAutosaveError = message;
      if (manual) {
        examsError = message;
      }
      return false;
    } finally {
      examSaveBusy = false;
    }
  }
  async function submitAttempt() {
    if (!hasInProgressAttempt || examActionBusy || examSaveBusy) {
      return;
    }

    if (!window.confirm('Submit this attempt? Correct answers will remain hidden until review loads.')) {
      return;
    }

    clearExamAutosaveTimer();
    examActionBusy = true;
    examsError = '';

    try {
      const data = await submitExamAttempt(currentAttempt.id, answersToPayload());
      currentAttempt = data?.attempt ?? currentAttempt;
      examAutosaveStatus = 'idle';
      examAutosaveSavedAt = '';
      const reviewData = await reviewExamAttempt(currentAttempt.id);
      reviewPayload = reviewData?.review ?? null;
      reviewAttemptId = currentAttempt.id;
    } catch (err) {
      examsError = err?.message || 'Failed to submit attempt';
    } finally {
      examActionBusy = false;
    }
  }

  async function loadReview() {
    if (!currentAttempt?.id || examActionBusy) {
      return;
    }

    examActionBusy = true;
    examsError = '';

    try {
      const data = await reviewExamAttempt(currentAttempt.id);
      reviewPayload = data?.review ?? null;
      reviewAttemptId = currentAttempt.id;
    } catch (err) {
      examsError = err?.message || 'Failed to load review';
    } finally {
      examActionBusy = false;
    }
  }

  async function restartAttempt() {
    if (!currentAttempt?.id || examActionBusy) {
      return;
    }

    if (!window.confirm('Restart this attempt? A new in-progress attempt will be created.')) {
      return;
    }

    examActionBusy = true;
    examsError = '';

    try {
      const data = await restartExamAttempt(currentAttempt.id);
      currentAttempt = data?.attempt ?? null;
      reviewPayload = null;
      reviewAttemptId = '';
      examAnswers = normalizeAnswers(currentAttempt?.answers, examQuestions);
      examQuestionIndex = 0;
      lastSavedAnswerSignature = getAnswersSignature(examAnswers, examQuestions);
      examAutosaveStatus = 'saved';
      examAutosaveSavedAt = currentAttempt?.lastSavedAt ?? new Date().toISOString();
    } catch (err) {
      examsError = err?.message || 'Failed to restart attempt';
    } finally {
      examActionBusy = false;
    }
  }

  function isReviewQuestionCorrect(question) {
    const userAnswer = normalizeComparableAnswer(reviewAnswersByQuestion[question.id], question.questionType);
    const correctAnswer = normalizeComparableAnswer(question.correctAnswer, question.questionType);
    return userAnswer && userAnswer === correctAnswer;
  }

  function reviewUserAnswer(questionId) {
    const answer = normalizeAnswerInput(reviewAnswersByQuestion[questionId]);
    return answer || 'Not answered';
  }

  async function loadExportArtifacts({ force = false } = {}) {
    if (exportsLoading && !force) {
      return;
    }

    exportsLoading = true;
    exportsError = '';

    try {
      const requestedDocumentId = currentDocumentId;
      const data = await listExportArtifacts({ page: 1, limit: 100 });
      if (requestedDocumentId !== currentDocumentId) {
        return;
      }

      const artifacts = Array.isArray(data?.artifacts) ? data.artifacts : [];
      exportArtifacts = artifacts.filter((artifact) => artifact.documentId === currentDocumentId);
      exportsLastUpdatedAt = new Date().toISOString();
      if (activeTab === 'exports' && hasActiveExportJobs) {
        scheduleExportPoll();
      } else {
        clearExportPollTimer();
      }
    } catch (err) {
      exportsError = err?.message || 'Failed to load exports';
      if (activeTab === 'exports' && hasActiveExportJobs) {
        scheduleExportPoll();
      }
    } finally {
      exportsLoading = false;
    }
  }

  async function requestExamExport() {
    if (!selectedExportExamId || exportActionBusy) {
      return;
    }

    exportActionBusy = true;
    exportsError = '';
    exportsNotice = '';

    try {
      await createExamExport({
        examId: selectedExportExamId,
        format: 'pdf'
      });
      exportsNotice = 'Export queued. Status will auto-refresh while jobs are queued or running.';
      await loadExportArtifacts({ force: true });
    } catch (err) {
      exportsError = err?.message || 'Failed to queue export';
    } finally {
      exportActionBusy = false;
    }
  }

  function getSummaryBanner(status, hasContent) {
    if ((status === 'queued' || status === 'running') && hasContent) {
      return 'Summary regeneration is running. Current summary remains visible.';
    }
    if (status === 'failed' && hasContent) {
      return 'Latest summary generation failed. Showing last available summary.';
    }
    if (status === 'failed' && !hasContent) {
      return 'Summary generation failed. Retry when ready.';
    }
    return '';
  }

  function splitSummarySections(rawSummary) {
    if (typeof rawSummary !== 'string' || !rawSummary.trim()) {
      return [];
    }

    const sections = [];
    const lines = rawSummary.replace(/\r/g, '').split('\n');
    let current = { title: '', blocks: [] };
    let paragraphBuffer = [];
    let listBuffer = [];

    function flushParagraph() {
      if (paragraphBuffer.length === 0) return;
      current.blocks.push({ type: 'paragraph', text: paragraphBuffer.join(' ') });
      paragraphBuffer = [];
    }

    function flushList() {
      if (listBuffer.length === 0) return;
      current.blocks.push({ type: 'list', items: [...listBuffer] });
      listBuffer = [];
    }

    function flushSection() {
      flushParagraph();
      flushList();
      if (current.title || current.blocks.length > 0) {
        sections.push(current);
      }
    }

    for (const line of lines) {
      const trimmed = line.trim();
      const heading = trimmed.replace(/^#+\s*/, '');
      const isHeading = /^#+\s+/.test(trimmed) || /^[A-Za-z][A-Za-z0-9\s]{2,60}:$/.test(trimmed);

      if (isHeading) {
        flushSection();
        current = { title: heading.replace(/:$/, ''), blocks: [] };
        continue;
      }

      if (!trimmed) {
        flushParagraph();
        flushList();
        continue;
      }

      if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
        flushParagraph();
        listBuffer.push(trimmed.replace(/^([-*]|\d+\.)\s+/, ''));
        continue;
      }

      flushList();
      paragraphBuffer.push(trimmed);
    }

    flushSection();
    return sections;
  }

  function exportStatusTone(status) {
    if (status === 'complete') return 'ready';
    if (status === 'failed') return 'failed';
    if (status === 'queued' || status === 'running') return 'processing';
    return 'info';
  }

  function exportStatusHint(status) {
    if (status === 'queued') return 'Queued for processing.';
    if (status === 'running') return 'Export generation is running.';
    if (status === 'complete') return 'Ready to download.';
    if (status === 'failed') return 'Failed. Create a new export request to retry.';
    return 'Status pending.';
  }
</script>

<div class="study-workspace">
  {#if loadingDocument && !documentData}
    <section class="panel state-panel">
      <h2>Loading study workspace...</h2>
      <p>Fetching document status and tab data.</p>
    </section>
  {:else if documentError}
    <section class="panel state-panel state-panel-error">
      <h2>Failed to load document workspace</h2>
      <p>{documentError}</p>
      <div class="row row-start">
        <button type="button" class="secondary-btn" on:click={() => fetchDocumentState()}>Retry</button>
        <button type="button" class="secondary-btn" on:click={goBackToStudyHub}>Back to Study Hub</button>
      </div>
    </section>
  {:else if documentData}
    <header class="workspace-header">
      <div>
        <button type="button" class="link-btn" on:click={goBackToStudyHub}>Back to Study Hub</button>
        <p class="eyebrow">Study Hub</p>
        <h1>{documentData.originalName}</h1>
        <p class="meta">Status: {documentData.processingStatus || 'unknown'} | Language: {documentData.language || 'unknown'} | Uploaded: {formatDate(documentData.uploadDate)}</p>
      </div>
      <div class="header-actions">
        <label class="switcher">
          <span>Switch document</span>
          <select on:change={(event) => switchDocument(event.currentTarget.value)} value={currentDocumentId}>
            {#if docsForSwitcher.length > 0}
              {#each docsForSwitcher as doc}
                <option value={doc.id}>{doc.originalName}</option>
              {/each}
            {:else}
              <option value={currentDocumentId}>{documentData.originalName}</option>
            {/if}
          </select>
        </label>
        <button type="button" class="secondary-btn" on:click={() => fetchDocumentState()} disabled={loadingDocument}>
          {loadingDocument ? 'Refreshing...' : 'Refresh document'}
        </button>
        <button type="button" class="secondary-btn" on:click={openLegacyDocumentView}>Open legacy view</button>
      </div>
    </header>

    {#if extractionStatus !== 'complete'}
      <section class="panel state-panel" class:state-panel-error={extractionStatus === 'failed'}>
        {#if extractionStatus === 'queued' || extractionStatus === 'processing'}
          <h2>Document is still processing</h2>
          <p>Study tools become fully available when extraction is complete.</p>
        {:else}
          <h2>Document processing failed</h2>
          <p>This document may be partially migrated. Retry loading or use the legacy document view.</p>
        {/if}
        <div class="row row-start">
          <button type="button" class="secondary-btn" on:click={() => fetchDocumentState()} disabled={loadingDocument}>
            {loadingDocument ? 'Refreshing...' : 'Refresh status'}
          </button>
          <button type="button" class="secondary-btn" on:click={openLegacyDocumentView}>Open legacy view</button>
        </div>
      </section>
    {/if}

    <nav class="tabs">
      <button type="button" class:active={activeTab === 'summary'} on:click={() => setTab('summary')}>Summary</button>
      <button type="button" class:active={activeTab === 'flashcards'} on:click={() => setTab('flashcards')}>Flashcards</button>
      <button type="button" class:active={activeTab === 'exams'} on:click={() => setTab('exams')}>Exams</button>
      <button type="button" class:active={activeTab === 'exports'} on:click={() => setTab('exports')}>Exports</button>
    </nav>

    {#if activeTab === 'summary'}
      <section class="panel">
        <div class="row">
          <h2>Summary</h2>
          <div class="summary-actions">
            <select bind:value={summaryLength}>
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
            <button type="button" on:click={regenerateSummary} disabled={!summaryCanGenerate}>
              {summaryRequestInFlight ? 'Queuing...' : summaryHasContent ? 'Regenerate summary' : 'Generate summary'}
            </button>
            <button type="button" class="secondary-btn" on:click={refreshActiveTab} disabled={summaryRefreshing}>
              {summaryRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {#if summaryBanner}
          <p class="inline-banner">{summaryBanner}</p>
        {/if}
        {#if summaryActionNotice}
          <p class="inline-note">{summaryActionNotice}</p>
        {/if}
        {#if generationError}
          <p class="inline-error">{generationError}</p>
        {/if}

        {#if extractionStatus !== 'complete'}
          <section class="state-panel">
            <h3>Summary is not ready yet</h3>
            <p>Wait for extraction to complete before generating or regenerating summary.</p>
          </section>
        {:else if (summaryStatus === 'queued' || summaryStatus === 'running') && !summaryHasContent}
          <section class="state-panel">
            <h3>Generating summary</h3>
            <p>Summary generation is in progress. Refresh to check updates.</p>
          </section>
        {:else if summaryHasContent}
          <div class="summary-output">
            {#if structuredSummarySections.length > 0}
              {#each structuredSummarySections as section}
                <article class="summary-section">
                  {#if section.title}
                    <h3>{section.title}</h3>
                  {/if}
                  {#each section.blocks as block}
                    {#if block.type === 'paragraph'}
                      <p>{block.text}</p>
                    {:else if block.type === 'list'}
                      <ul>
                        {#each block.items as item}
                          <li>{item}</li>
                        {/each}
                      </ul>
                    {/if}
                  {/each}
                </article>
              {/each}
            {:else}
              <p>{documentData.summary}</p>
            {/if}
          </div>
        {:else}
          <section class="state-panel">
            <h3>No summary yet</h3>
            <p>Generate a summary to get a structured overview for this document.</p>
            <div class="row row-start">
              <button type="button" on:click={regenerateSummary} disabled={!summaryCanGenerate}>
                Generate summary
              </button>
            </div>
          </section>
        {/if}
      </section>
    {/if}

    {#if activeTab === 'flashcards'}
      <section class="panel">
        <div class="row">
          <h2>Flashcards</h2>
          <div class="row row-start">
            <button type="button" on:click={generateFlashcards} disabled={extractionStatus !== 'complete' || flashcardGenerationBusy}>
              {flashcardGenerationBusy ? 'Queuing...' : shouldUseRegenerateFlashcards ? 'Regenerate flashcards' : 'Generate flashcards'}
            </button>
            <button type="button" class="secondary-btn" on:click={refreshActiveTab} disabled={flashcardLoading}>
              {flashcardLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {#if flashcardActionNotice}
          <p class="inline-note">{flashcardActionNotice}</p>
        {/if}
        {#if flashcardError}
          <p class="inline-error">{flashcardError}</p>
        {/if}

        {#if flashcardLoading && flashcardSets.length === 0}
          <section class="state-panel">
            <h3>Loading flashcard sets</h3>
            <p>Fetching canonical flashcard sets for this document.</p>
          </section>
        {:else if flashcardSets.length === 0}
          <section class="state-panel">
            <h3>No flashcard sets yet</h3>
            <p>Generate flashcards to start studying with click/tap cards.</p>
            <div class="row row-start">
              <button type="button" on:click={generateFlashcards} disabled={extractionStatus !== 'complete' || flashcardGenerationBusy}>
                Generate flashcards
              </button>
              <button type="button" class="secondary-btn" on:click={refreshActiveTab} disabled={flashcardLoading}>
                Retry
              </button>
            </div>
            {#if flashcardGenerationStatus === 'queued' || flashcardGenerationStatus === 'running'}
              <p class="inline-banner">Flashcard generation is running. Refresh to check status.</p>
            {/if}
            {#if flashcardGenerationStatus === 'failed'}
              <p class="inline-error">Latest flashcard generation failed. Retry generation.</p>
            {/if}
            {#if hasLegacyFlashcards}
              <p class="meta">Legacy flashcards exist for this document ({legacyFlashcardCount}).</p>
              <button type="button" class="secondary-btn" on:click={openLegacyDocumentView}>Open legacy view</button>
            {/if}
          </section>
        {:else}
          <div class="row">
            <label>
              Set
              <select bind:value={selectedSetId} on:change={(event) => openFlashcardSet(event.currentTarget.value)}>
                {#each flashcardSets as set}
                  <option value={set.id}>{set.title || 'Untitled set'} ({set.cardCount})</option>
                {/each}
              </select>
            </label>
            <button type="button" class="secondary-btn" on:click={() => openFlashcardSet(selectedSetId)} disabled={!selectedSetId || flashcardSetLoading}>
              {flashcardSetLoading ? 'Loading set...' : 'Reload selected set'}
            </button>
            <button type="button" class="secondary-btn" on:click={startIncorrectSession} disabled={!selectedSetId || incorrectSessionLoading || incorrectEligibleCount === 0}>
              {incorrectSessionLoading ? 'Loading session...' : `Study incorrect cards (${incorrectEligibleCount})`}
            </button>
            {#if incorrectSessionEnabled}
              <button type="button" class="secondary-btn" on:click={stopIncorrectSession}>Back to full set</button>
            {/if}
          </div>
          {#if flashcardSet}
            <p class="meta">
              Total cards: {flashcardSet.cardCount} | Visible cards: {visibleFlashcards.length} | Hidden: {hiddenFlashcardCount} | Deleted: {deletedFlashcardCount}
              {#if incorrectSessionEnabled}
                | Incorrect session: {incorrectSessionCards.length}
              {/if}
            </p>
          {/if}

          {#if incorrectSessionEnabled && studyCards.length === 0}
            <section class="state-panel">
              <h3>No incorrect cards left</h3>
              <p>You have cleared this incorrect-card session for the selected set.</p>
              <button type="button" class="secondary-btn" on:click={stopIncorrectSession}>Back to full set</button>
            </section>
          {:else if currentStudyCard}
            <article class="flashcard">
              <h3>{currentStudyCard.question}</h3>
              {#if flashcardShowAnswer}
                <p class="answer">{currentStudyCard.answer}</p>
                {#if currentStudyCard.explanation}
                  <p>{currentStudyCard.explanation}</p>
                {/if}
                <SourceRefsCompact refs={currentStudyCard.sourceRefs} label="Source references" />
              {/if}
              <div class="row">
                <button type="button" on:click={() => (flashcardShowAnswer = !flashcardShowAnswer)}>
                  {flashcardShowAnswer ? 'Hide answer' : 'Show answer'}
                </button>
                <button type="button" on:click={() => markCardResult(currentStudyCard, 'correct')} disabled={patchingCardId === currentStudyCard.id}>
                  Mark correct
                </button>
                <button type="button" on:click={() => markCardResult(currentStudyCard, 'incorrect')} disabled={patchingCardId === currentStudyCard.id}>
                  Mark incorrect
                </button>
              </div>
              <div class="row row-start">
                <button type="button" class="secondary-btn" on:click={() => hideCardForSet(currentStudyCard)} disabled={patchingCardId === currentStudyCard.id}>
                  Hide in this set
                </button>
                <button type="button" class="secondary-btn" on:click={() => deleteCardForSet(currentStudyCard)} disabled={patchingCardId === currentStudyCard.id}>
                  Delete for me
                </button>
              </div>
              <div class="row">
                <button type="button" on:click={() => { flashcardCardIndex = Math.max(flashcardCardIndex - 1, 0); flashcardShowAnswer = false; }} disabled={flashcardCardIndex === 0}>
                  Previous
                </button>
                <span>{flashcardCardIndex + 1} / {studyCards.length}</span>
                <button type="button" on:click={() => { flashcardCardIndex = Math.min(flashcardCardIndex + 1, studyCards.length - 1); flashcardShowAnswer = false; }} disabled={flashcardCardIndex >= studyCards.length - 1}>
                  Next
                </button>
              </div>
              {#if patchingCardId === currentStudyCard.id}
                <p class="inline-note">Saving card state...</p>
              {/if}
            </article>
          {:else}
            <p>No visible cards for this selection.</p>
          {/if}
        {/if}
      </section>
    {/if}

    {#if activeTab === 'exams'}
      <section class="panel">
        <div class="row">
          <h2>Exams</h2>
          <div class="row row-start">
            <button type="button" on:click={generateExam} disabled={extractionStatus !== 'complete' || examGenerationBusy}>
              {examGenerationBusy ? 'Queuing...' : examRecords.length > 0 || examGenerationStatus === 'complete' ? 'Regenerate exam' : 'Generate exam'}
            </button>
            <button type="button" class="secondary-btn" on:click={refreshActiveTab} disabled={examsLoading}>
              {examsLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {#if examsError}
          <p class="inline-error">{examsError}</p>
        {/if}

        {#if examsLoading && examRecords.length === 0}
          <section class="state-panel">
            <h3>Loading exams</h3>
            <p>Fetching canonical exam records for this document.</p>
          </section>
        {:else if examRecords.length === 0}
          <section class="state-panel">
            <h3>No exams yet</h3>
            <p>Generate an exam to start attempt/resume/review workflows.</p>
            <div class="row row-start">
              <button type="button" on:click={generateExam} disabled={extractionStatus !== 'complete' || examGenerationBusy}>
                Generate exam
              </button>
              <button type="button" class="secondary-btn" on:click={refreshActiveTab} disabled={examsLoading}>
                Retry
              </button>
            </div>
            {#if examGenerationStatus === 'queued' || examGenerationStatus === 'running'}
              <p class="inline-banner">Exam generation is running. Refresh to check status.</p>
            {/if}
            {#if examGenerationStatus === 'failed'}
              <p class="inline-error">Latest exam generation failed. Retry generation.</p>
            {/if}
            {#if hasLegacyExamQuestions}
              <p class="meta">Legacy exam questions exist for this document ({legacyExamQuestionCount}).</p>
              <button type="button" class="secondary-btn" on:click={openLegacyDocumentView}>Open legacy view</button>
            {/if}
          </section>
        {:else}
          <div class="row">
            <label>
              Exam record
              <select bind:value={selectedExamId} on:change={(event) => openExam(event.currentTarget.value)}>
                {#each examRecords as exam}
                  <option value={exam.id}>{exam.title || 'Untitled exam'} ({exam.questionCount} questions)</option>
                {/each}
              </select>
            </label>
            <label>
              Feedback mode
              <select bind:value={examFeedbackMode}>
                <option value="end">Show answers at end</option>
                <option value="instant">Instant feedback (stored for future behavior)</option>
              </select>
            </label>
            <button type="button" on:click={startNewAttempt} disabled={!selectedExamId || examActionBusy || hasInProgressAttempt}>
              {examActionBusy ? 'Working...' : 'Create attempt'}
            </button>
            {#if hasInProgressAttempt}
              <button type="button" class="secondary-btn" on:click={() => saveAttempt({ manual: true })} disabled={examActionBusy || examSaveBusy}>
                {examSaveBusy ? 'Saving...' : 'Save now'}
              </button>
              <button type="button" on:click={submitAttempt} disabled={examActionBusy || examSaveBusy}>Submit attempt</button>
            {/if}
            {#if currentAttempt}
              <button type="button" class="secondary-btn" on:click={restartAttempt} disabled={examActionBusy}>Restart</button>
            {/if}
          </div>

          {#if hasInProgressAttempt}
            <p class="inline-banner">In-progress attempt found. You can resume, save, submit, or restart.</p>
            <p class="meta">{examAutosaveLabel()}</p>
          {/if}

          {#if examDetailLoading}
            <section class="state-panel">
              <h3>Loading exam detail</h3>
              <p>Preparing questions and attempt state.</p>
            </section>
          {:else if examDetail && examQuestions.length > 0}
            <p class="meta">Questions: {examQuestions.length} | Answered: {answeredExamCount} / {examQuestions.length}</p>
            <article class="exam-box">
              <h3>Question {examQuestionIndex + 1} of {examQuestions.length}</h3>
              <p>{examQuestion.question}</p>

              {#if Array.isArray(examQuestion.options) && examQuestion.options.length > 0}
                <div class="options">
                  {#each examQuestion.options as option}
                    <button
                      type="button"
                      class:selected={examAnswers[examQuestion.id] === option}
                      on:click={() => setExamAnswer(examQuestion.id, option)}
                    >
                      {option}
                    </button>
                  {/each}
                </div>
              {:else}
                <input
                  type="text"
                  value={examAnswers[examQuestion.id] ?? ''}
                  on:input={(event) => setExamAnswer(examQuestion.id, event.currentTarget.value)}
                  placeholder="Type your answer"
                />
              {/if}

              <div class="row">
                <button type="button" on:click={() => (examQuestionIndex = Math.max(examQuestionIndex - 1, 0))} disabled={examQuestionIndex === 0}>
                  Previous
                </button>
                <button type="button" on:click={() => (examQuestionIndex = Math.min(examQuestionIndex + 1, examQuestions.length - 1))} disabled={examQuestionIndex >= examQuestions.length - 1}>
                  Next
                </button>
              </div>
            </article>
          {:else}
            <section class="state-panel">
              <h3>No in-progress attempt</h3>
              <p>Create a new attempt to start this exam.</p>
            </section>
          {/if}

          {#if isExamFinished}
            <article class="exam-box">
              <h3>Attempt submitted</h3>
              <p>Score: {currentAttempt.score} / {currentAttempt.totalQuestions} ({getScorePercent(currentAttempt.score, currentAttempt.totalQuestions)}%)</p>
              <button type="button" class="secondary-btn" on:click={loadReview} disabled={examActionBusy}>
                Load review
              </button>
            </article>
          {/if}

          {#if reviewPayload}
            <article class="exam-box review-layout">
              <h3>Review</h3>
              <p class="meta">{reviewPayload.score} / {reviewPayload.totalQuestions} ({reviewScorePercent}%)</p>
              {#each reviewQuestions as question}
                <div class="review-item">
                  <p><strong>Q{question.position + 1}:</strong> {question.question}</p>
                  <p>Your answer: {reviewUserAnswer(question.id)}</p>
                  <p class={isReviewQuestionCorrect(question) ? 'status-correct' : 'status-incorrect'}>
                    {isReviewQuestionCorrect(question) ? 'Correct' : 'Incorrect'}
                  </p>
                  <p>Correct answer: {question.correctAnswer}</p>
                  {#if question.explanation}
                    <p>{question.explanation}</p>
                  {/if}
                  <SourceRefsCompact refs={question.sourceRefs} label="Source references" />
                </div>
              {/each}
            </article>
          {/if}
        {/if}
      </section>
    {/if}

    {#if activeTab === 'exports'}
      <section class="panel">
        <div class="row">
          <h2>Exports</h2>
          <button type="button" class="secondary-btn" on:click={refreshActiveTab} disabled={exportsLoading}>
            {exportsLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <p class="inline-banner">Export status is available now. Full PDF export pipeline hardening is still in progress, so queued/running states may take longer.</p>
        {#if exportsNotice}
          <p class="inline-note">{exportsNotice}</p>
        {/if}
        {#if exportsError}
          <p class="inline-error">{exportsError}</p>
        {/if}

        <div class="row">
          <label>
            Exam record
            <select bind:value={selectedExportExamId} disabled={examRecords.length === 0}>
              <option value="">Select exam</option>
              {#each examRecords as exam}
                <option value={exam.id}>{exam.title || 'Untitled exam'}</option>
              {/each}
            </select>
          </label>
          <button type="button" on:click={requestExamExport} disabled={!selectedExportExamId || exportActionBusy}>
            {exportActionBusy ? 'Queuing export...' : 'Request export'}
          </button>
        </div>
        <p class="meta">
          Last updated: {exportsLastUpdatedAt ? formatDateTime(exportsLastUpdatedAt) : 'not yet'}
          {#if hasActiveExportJobs}
            | Auto-refresh: every {Math.round(EXPORT_POLL_INTERVAL_MS / 1000)}s while queued/running jobs exist
          {/if}
        </p>

        {#if exportsLoading && exportArtifacts.length === 0}
          <section class="state-panel">
            <h3>Loading exports</h3>
            <p>Fetching export artifacts for this document.</p>
          </section>
        {:else if exportArtifacts.length === 0}
          <section class="state-panel">
            <h3>No exports yet</h3>
            <p>Request an export once you have an exam selected.</p>
            <div class="row row-start">
              <button type="button" on:click={requestExamExport} disabled={!selectedExportExamId || exportActionBusy}>
                Request export
              </button>
              <button type="button" class="secondary-btn" on:click={refreshActiveTab} disabled={exportsLoading}>Retry</button>
            </div>
          </section>
        {:else}
          <div class="export-list">
            {#each exportArtifacts as artifact}
              <article class="export-item">
                <p><strong>{artifact.fileName || artifact.id}</strong></p>
                <p>Status: <span class={`status-${exportStatusTone(artifact.status)}`}>{artifact.status}</span></p>
                <p>Created: {artifact.createdAt ? new Date(artifact.createdAt).toLocaleString() : 'Unknown'}</p>
                <p class="meta">{exportStatusHint(artifact.status)}</p>
                {#if artifact.errorMessage}
                  <p class="inline-error">{artifact.errorMessage}</p>
                {/if}
                {#if artifact.status === 'complete'}
                  <a href={getExportDownloadUrl(artifact.id)}>Download</a>
                {:else}
                  <button type="button" class="secondary-btn" disabled>Download unavailable</button>
                {/if}
                <button type="button" class="secondary-btn" on:click={() => loadExportArtifacts({ force: true })} disabled={exportsLoading}>
                  Refresh status
                </button>
              </article>
            {/each}
          </div>
        {/if}
      </section>
    {/if}
  {/if}
</div>

<style>
  .study-workspace { display: grid; gap: var(--space-4); }
  .workspace-header { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--space-3); flex-wrap: wrap; }
  .eyebrow { margin: 0; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; color: var(--color-text-muted); }
  h1 { margin: 0.25rem 0; color: var(--color-text-primary); font-size: 1.6rem; }
  h2, h3 { margin: 0; color: var(--color-text-primary); }
  .meta { margin: 0; color: var(--color-text-secondary); }
  .header-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }
  .switcher { display: grid; gap: 0.35rem; color: var(--color-text-secondary); font-size: 0.85rem; }
  select, input, button { min-height: 40px; border-radius: var(--radius-1); border: 1px solid var(--color-border); background: var(--color-surface-2); color: var(--color-text-primary); padding: 0.5rem 0.75rem; font: inherit; }
  button { cursor: pointer; font-weight: 600; }
  .secondary-btn { background: var(--color-surface-1); }
  .tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .tabs button.active { border-color: var(--color-accent-primary); background: var(--color-accent-surface); }
  .panel { border: 1px solid var(--color-border); border-radius: var(--radius-2); padding: var(--space-4); background: var(--color-surface-1); display: grid; gap: var(--space-3); }
  .panel.error, .inline-error { color: var(--color-danger); }
  .inline-banner { margin: 0; padding: 0.75rem; border-radius: var(--radius-1); border: 1px solid var(--color-border); background: color-mix(in srgb, var(--color-info) 14%, transparent); color: var(--color-text-primary); }
  .summary-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }
  .summary-output { display: grid; gap: var(--space-3); }
  .summary-section p { white-space: pre-wrap; line-height: 1.6; }
  .row { display: flex; gap: var(--space-2); flex-wrap: wrap; align-items: center; justify-content: space-between; }
  .flashcard, .exam-box, .export-item { border: 1px solid var(--color-border); border-radius: var(--radius-1); background: var(--color-surface-2); padding: var(--space-3); display: grid; gap: var(--space-2); }
  .answer { font-weight: 700; color: var(--color-text-primary); }
  .options { display: grid; gap: 0.5rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .options button.selected { border-color: var(--color-accent-primary); background: var(--color-accent-surface); }
  .review-item { border-top: 1px solid var(--color-border); padding-top: var(--space-2); }
  .review-item p { margin: 0; color: var(--color-text-secondary); }
  .status-ready { color: var(--color-success); }
  .status-failed { color: var(--color-danger); }
  .status-processing { color: var(--color-info); }
  .export-list { display: grid; gap: var(--space-2); }
  @media (max-width: 640px) {
    .row { align-items: stretch; justify-content: flex-start; }
    .options { grid-template-columns: 1fr; }
  }
</style>
