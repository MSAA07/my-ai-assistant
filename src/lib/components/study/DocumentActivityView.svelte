<script>
  import { onDestroy } from 'svelte';
  import { Check, ChevronLeft, ChevronRight, Download, Play, RotateCcw, X } from '@lucide/svelte';
  import { t } from '../../i18n/t.js';
  import Badge from '../ui/Badge.svelte';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import ProgressBar from '../ui/ProgressBar.svelte';
  import StatusBadge from '../ui/StatusBadge.svelte';
  import GuidedRegenerateModal from '../ui/GuidedRegenerateModal.svelte';
  import DocumentDetailSkeleton from '../ui/DocumentDetailSkeleton.svelte';
  import StudyActivityShell from './StudyActivityShell.svelte';
  import { getDocumentFileTypeLabel } from '../../utils/fileType.js';
  import { readPageCache, writePageCache } from '../../../stores/pageCache.js';
  import {
    exportStudyMaterialPdf,
    getDocument,
    requestGeneration,
    saveLegacyExamAttempt,
    saveFlashcardProgress,
  } from '../../api/studyHub.js';

  const POLL_INTERVAL_MS = 2500;
  const DOCUMENT_CACHE_KEY = (id) => `page:document-view:${id}`;
  const FEATURES = ['summary', 'flashcards', 'exam'];
  const BASE_OPTIONS = {
    summary: { length: 'medium' },
    flashcards: { includeExplanations: false },
    exam: { questionCount: 10 },
  };

  export let documentId = '';
  export let studyTab = 'summary';

  let currentDocumentId = '';
  let docData = null;
  let loading = true;
  let pageError = '';
  let pollTimer = null;
  let pendingGeneration = mapByFeature(false);
  let generationErrors = mapByFeature('');
  let exportBusy = mapByFeature(false);
  let exportErrors = mapByFeature('');

  let regenerateModalOpen = false;
  let regenerateFeatureKey = 'summary';
  let regenerateSubmitting = false;

  let flashcardIndex = 0;
  let revealAnswer = false;
  let flashcardResults = [];
  let flashcardPhase = 'question';
  let flashcardProgressError = '';
  let flashcardProgressBusy = false;

  let examPhase = 'question';
  let currentQuestionIndex = 0;
  let examAnswers = [];
  let examScore = 0;
  let examSubmitting = false;
  let examSubmitError = '';
  let examStarted = false;
  let lastMode = '';

  $: mode = normalizeMode(studyTab);
  $: activeFeatureKey = mode === 'flashcards' ? 'flashcards' : mode === 'exam' ? 'exam' : 'summary';
  $: extractionStatus = normalizeDocumentStatus(docData?.processingStatus);
  $: showProcessingBanner = Boolean(docData) && (isExtractionActive(extractionStatus) || hasActiveGeneration(docData, pendingGeneration));
  $: title = text(docData?.originalName) || text(docData?.title) || t('document.hub.untitled');
  $: fileTypeBadge = getFileType(docData);

  $: summaryFeature = featureState('summary', { document: docData, extractionStatus, pendingGeneration, generationErrors });
  $: flashcardsFeature = featureState('flashcards', { document: docData, extractionStatus, pendingGeneration, generationErrors });
  $: examFeature = featureState('exam', { document: docData, extractionStatus, pendingGeneration, generationErrors });
  $: activeFeature = activeFeatureKey === 'summary' ? summaryFeature : activeFeatureKey === 'flashcards' ? flashcardsFeature : examFeature;
  $: activeExportError = text(exportErrors?.[activeFeatureKey]);

  $: modeLabel = mode === 'summary'
    ? t('document.activity.section.summary')
    : mode === 'flashcards'
      ? t('document.activity.section.flashcards')
      : t('document.activity.section.exam');
  $: modeSubtitle = mode === 'summary'
    ? t('document.activity.subtitle.summary')
    : mode === 'flashcards'
      ? t('document.activity.subtitle.flashcards')
      : t('document.activity.subtitle.exam');

  $: summaryBlocks = parseSummaryBlocks(docData?.summary);

  $: flashcards = Array.isArray(docData?.flashcards) ? docData.flashcards : [];
  $: currentFlashcard = flashcards[flashcardIndex] ?? null;
  $: flashcardsCorrect = flashcardResults.filter((result) => result === 'correct').length;
  $: flashcardsIncorrect = flashcardResults.filter((result) => result === 'incorrect').length;
  $: flashcardsUnanswered = flashcardResults.filter((result) => result !== 'correct' && result !== 'incorrect').length;
  $: flashcardsCompleted = flashcardPhase === 'result';
  $: flashcardProgressLabel = t('document.activity.flashcards.progressLabel', {
    current: flashcards.length ? flashcardIndex + 1 : 0,
    total: flashcards.length,
    correct: flashcardsCorrect,
    incorrect: flashcardsIncorrect,
  });

  $: examQuestions = Array.isArray(docData?.examQuestions) ? docData.examQuestions : [];
  $: currentExamQuestion = examQuestions[currentQuestionIndex] ?? null;
  $: examAnsweredCount = examAnswers.filter((answer) => text(answer)).length;
  $: examProgressLabel = t('document.exam.progress', {
    current: examQuestions.length ? currentQuestionIndex + 1 : 0,
    total: examQuestions.length,
  });

  $: showExamLaunch = mode === 'exam' && examFeature.hasContent && examPhase === 'question' && !examStarted;
  $: showActiveFlashcardsSession = mode === 'flashcards' && flashcardsFeature.hasContent;
  $: showActiveStudyShell = showActiveFlashcardsSession;
  $: showChromeProgress = showActiveStudyShell;
  $: chromeProgressValue = mode === 'flashcards'
    ? (flashcards.length ? flashcardIndex + 1 : 0)
    : examPhase === 'result'
      ? examQuestions.length
      : (examQuestions.length ? currentQuestionIndex + 1 : 0);
  $: chromeProgressMax = mode === 'flashcards' ? (flashcards.length || 1) : (examQuestions.length || 1);
  $: chromeProgressLabel = mode === 'flashcards'
    ? flashcardProgressLabel
    : examPhase === 'result'
      ? t('document.activity.exam.scoreLabel', { score: examScore, total: examQuestions.length })
      : examProgressLabel;
  $: examChromeCurrentLabel = t('document.activity.exam.currentLabel', {
    current: examQuestions.length ? currentQuestionIndex + 1 : 0,
    total: examQuestions.length,
  });
  $: examChromeMetaLabel = examPhase === 'result'
    ? t('document.activity.exam.scoreLabel', { score: examScore, total: examQuestions.length })
    : examPhase === 'submitting'
      ? t('status.processing')
      : t('document.activity.exam.answeredInline', { answered: examAnsweredCount });
  $: examScorePercent = examQuestions.length ? Math.round((examScore / examQuestions.length) * 100) : 0;

  $: chromeStatus = extractionStatus === 'failed'
    ? 'failed'
    : activeFeature.busy || examPhase === 'submitting'
      ? 'processing'
      : activeFeature.hasContent
        ? 'ready'
        : 'info';
  $: chromeStatusLabel = extractionStatus === 'failed'
    ? t('status.failed')
    : activeFeature.busy || examPhase === 'submitting'
      ? t('status.processing')
      : activeFeature.hasContent
        ? t('status.ready')
        : t('document.hub.states.notGenerated');
  $: chromeStatusHeadline = getChromeStatusHeadline();
  $: chromeStatusCopy = getChromeStatusCopy();

  $: regenerationReasonOptions = [
    { value: 'missing_parts', label: t('document.activity.regenerate.reasons.missingParts') },
    { value: 'not_comprehensive_enough', label: t('document.activity.regenerate.reasons.notComprehensiveEnough') },
    { value: 'too_short', label: t('document.activity.regenerate.reasons.tooShort') },
    { value: 'too_generic', label: t('document.activity.regenerate.reasons.tooGeneric') },
  ];

  $: if (mode !== lastMode) {
    handleModeChange(mode);
    lastMode = mode;
  }

  $: if (documentId && documentId !== currentDocumentId) {
    currentDocumentId = documentId;
    resetState();
    const cached = readPageCache(DOCUMENT_CACHE_KEY(documentId));
    if (cached?.loaded && cached?.docData) {
      docData = cached.docData;
      pendingGeneration = cached.pendingGeneration ?? mapByFeature(false);
      generationErrors = cached.generationErrors ?? mapByFeature('');
      exportErrors = cached.exportErrors ?? mapByFeature('');
      loading = false;
    }
    void fetchDocumentState({ background: Boolean(cached?.loaded && cached?.docData) });
  }

  onDestroy(() => {
    clearPollTimer();
  });

  function mapByFeature(value) {
    return { summary: value, flashcards: value, exam: value };
  }

  function text(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function parseSummaryBlocks(value) {
    const source = text(value);
    if (!source) return [];

    return source
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        const lines = block
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);

        if (lines.length === 1 && /^##\s+/.test(lines[0])) {
          return { type: 'heading', text: lines[0].replace(/^##\s+/, '').trim() };
        }

        if (lines.length > 0 && lines.every((line) => /^-\s+/.test(line))) {
          return {
            type: 'list',
            items: lines.map((line) => line.replace(/^-\s+/, '').trim()).filter(Boolean),
          };
        }

        return {
          type: 'paragraph',
          text: block.replace(/\s*\n+\s*/g, ' ').trim(),
        };
      });
  }

  function parseInlineSegments(value) {
    const source = typeof value === 'string' ? value : '';
    if (!source) return [];

    const segments = [];
    const pattern = /\*\*(.*?)\*\*/g;
    let cursor = 0;
    let match;

    while ((match = pattern.exec(source)) !== null) {
      if (match.index > cursor) {
        segments.push({ text: source.slice(cursor, match.index), strong: false });
      }

      if (match[1]) {
        segments.push({ text: match[1], strong: true });
      }

      cursor = match.index + match[0].length;
    }

    if (cursor < source.length) {
      segments.push({ text: source.slice(cursor), strong: false });
    }

    return segments.filter((segment) => segment.text);
  }

  function normalizeMode(value) {
    const normalized = text(value).toLowerCase();
    if (normalized === 'flashcards') return 'flashcards';
    if (normalized === 'exam' || normalized === 'exams') return 'exam';
    return 'summary';
  }

  function normalizeDocumentStatus(value) {
    const normalized = text(value).toLowerCase();
    if (normalized === 'queued' || normalized === 'processing' || normalized === 'complete' || normalized === 'failed') {
      return normalized;
    }
    return 'failed';
  }

  function normalizeGenerationStatus(value) {
    const normalized = text(value).toLowerCase();
    if (normalized === 'not_requested' || normalized === 'queued' || normalized === 'running' || normalized === 'complete' || normalized === 'failed') {
      return normalized;
    }
    return 'not_requested';
  }

  function isExtractionActive(status) {
    return status === 'queued' || status === 'processing';
  }

  function isGenerationActive(status) {
    return status === 'queued' || status === 'running';
  }

  function hasFeatureContent(featureKey, document) {
    if (featureKey === 'summary') return Boolean(text(document?.summary));
    if (featureKey === 'flashcards') return Array.isArray(document?.flashcards) && document.flashcards.length > 0;
    return Array.isArray(document?.examQuestions) && document.examQuestions.length > 0;
  }

  function hasActiveGeneration(document, pendingByFeature = pendingGeneration) {
    return FEATURES.some((featureKey) => {
      const status = normalizeGenerationStatus(document?.generationState?.[featureKey]?.status);
      return isGenerationActive(status) || Boolean(pendingByFeature?.[featureKey]);
    });
  }

  function featureState(featureKey, context = {}) {
    const {
      document = docData,
      extractionStatus: currentExtractionStatus = extractionStatus,
      pendingGeneration: pendingByFeature = pendingGeneration,
      generationErrors: featureErrors = generationErrors,
    } = context;
    const generation = document?.generationState?.[featureKey] ?? {};
    const status = normalizeGenerationStatus(generation?.status);
    const hasContent = hasFeatureContent(featureKey, document);
    const busy = Boolean(pendingByFeature?.[featureKey]) || isGenerationActive(status);
    const errorMessage = text(featureErrors?.[featureKey]) || text(generation?.errorMessage);
    return {
      key: featureKey,
      status,
      busy,
      hasContent,
      canGenerate: currentExtractionStatus === 'complete' && !busy,
      canRegenerate: currentExtractionStatus === 'complete' && hasContent && !busy,
      shouldRegenerate: hasContent || status === 'complete',
      errorMessage,
    };
  }

  function getChromeStatusHeadline() {
    if (mode === 'flashcards') {
      if (!flashcardsFeature.hasContent) {
        return t('document.hub.features.flashcards');
      }
      return flashcardProgressLabel;
    }

    if (mode === 'exam') {
      if (examPhase === 'result') {
        return t('document.activity.exam.scoreLabel', { score: examScore, total: examQuestions.length });
      }
      if (!examFeature.hasContent) {
        return t('document.hub.features.exam');
      }
      return showExamLaunch
        ? t('document.activity.exam.introTitle')
        : examProgressLabel;
    }

    return t('document.activity.summary.title');
  }

  function getChromeStatusCopy() {
    if (mode === 'flashcards') {
      if (!flashcardsFeature.hasContent) {
        return flashcardsFeature.errorMessage || modeSubtitle;
      }
      if (flashcardProgressError) {
        return flashcardProgressError;
      }
      return revealAnswer ? t('document.activity.flashcards.answerLabel') : t('document.activity.flashcards.questionLabel');
    }

    if (mode === 'exam') {
      if (!examFeature.hasContent) {
        return examFeature.errorMessage || modeSubtitle;
      }
      if (examPhase === 'submitting') {
        return t('document.activity.exam.submittingBody');
      }
      if (examPhase === 'result') {
        return t('document.activity.exam.reviewTitle');
      }
      if (showExamLaunch) {
        return t('document.activity.exam.introDescription', { count: examQuestions.length });
      }
      return t('document.activity.exam.answeredCount', { answered: examAnsweredCount, total: examQuestions.length });
    }

    if (!summaryFeature.hasContent) {
      return summaryFeature.errorMessage || modeSubtitle;
    }

    return summaryFeature.busy ? t('document.activity.summary.regenerating') : modeSubtitle;
  }

  function setFeaturePending(featureKey, value) {
    pendingGeneration = { ...pendingGeneration, [featureKey]: value };
  }

  function setFeatureError(featureKey, value = '') {
    generationErrors = { ...generationErrors, [featureKey]: value };
  }

  function setExportBusy(featureKey, value) {
    exportBusy = { ...exportBusy, [featureKey]: value };
  }

  function setExportError(featureKey, value = '') {
    exportErrors = { ...exportErrors, [featureKey]: value };
  }

  function clearPollTimer() {
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
  }

  function schedulePoll() {
    clearPollTimer();
    pollTimer = setTimeout(() => void fetchDocumentState({ background: true }), POLL_INTERVAL_MS);
  }

  function handleModeChange(nextMode) {
    if (nextMode === 'flashcards') {
      flashcardPhase = 'question';
      revealAnswer = false;
      flashcardProgressError = '';
      return;
    }

    if (nextMode === 'exam') {
      examStarted = false;
    }
  }

  function resetState() {
    clearPollTimer();
    docData = null;
    loading = true;
    pageError = '';
    pendingGeneration = mapByFeature(false);
    generationErrors = mapByFeature('');
    exportBusy = mapByFeature(false);
    exportErrors = mapByFeature('');
    regenerateModalOpen = false;
    regenerateFeatureKey = 'summary';
    regenerateSubmitting = false;
    resetFlashcardsState();
    resetExamState();
  }

  function resetFlashcardsState(cardCount = 0) {
    flashcardPhase = 'question';
    flashcardIndex = 0;
    revealAnswer = false;
    flashcardResults = new Array(Math.max(0, cardCount)).fill(null);
    flashcardProgressError = '';
    flashcardProgressBusy = false;
  }

  function updatePendingFromDocument(document) {
    const nextPending = { ...pendingGeneration };
    const nextErrors = { ...generationErrors };
    for (const featureKey of FEATURES) {
      const status = normalizeGenerationStatus(document?.generationState?.[featureKey]?.status);
      const hasContent = hasFeatureContent(featureKey, document);
      if (nextPending[featureKey] && (status !== 'not_requested' || hasContent)) {
        nextPending[featureKey] = false;
        nextErrors[featureKey] = '';
      }
    }
    pendingGeneration = nextPending;
    generationErrors = nextErrors;
  }

  function setDocument(nextDocument) {
    const oldFlashcards = Array.isArray(docData?.flashcards) ? docData.flashcards : [];
    const oldExamQuestions = Array.isArray(docData?.examQuestions) ? docData.examQuestions : [];
    const nextFlashcards = Array.isArray(nextDocument?.flashcards) ? nextDocument.flashcards : [];
    const nextExamQuestions = Array.isArray(nextDocument?.examQuestions) ? nextDocument.examQuestions : [];
    const flashcardsChanged = JSON.stringify(oldFlashcards) !== JSON.stringify(nextFlashcards);
    const examChanged = JSON.stringify(oldExamQuestions) !== JSON.stringify(nextExamQuestions);

    docData = nextDocument;
    updatePendingFromDocument(nextDocument);

    if (flashcardsChanged) {
      resetFlashcardsState(nextFlashcards.length);
    }

    if (!flashcardsChanged && flashcardResults.length !== nextFlashcards.length) {
      resetFlashcardsState(nextFlashcards.length);
    }

    if (flashcardIndex > nextFlashcards.length - 1) {
      flashcardIndex = Math.max(nextFlashcards.length - 1, 0);
      revealAnswer = false;
    }

    if (examChanged) {
      resetExamState(nextExamQuestions.length);
    }
  }

  function shouldPollDocument(document) {
    if (isExtractionActive(normalizeDocumentStatus(document?.processingStatus))) {
      return true;
    }
    return hasActiveGeneration(document);
  }

  async function fetchDocumentState({ background = false } = {}) {
    if (!currentDocumentId) return;

    if (!background) {
      loading = true;
      pageError = '';
    }

    clearPollTimer();

    try {
      const requestedId = currentDocumentId;
      const response = await getDocument(requestedId);
      if (requestedId !== currentDocumentId) return;

      const nextDocument = response?.document ?? null;
      setDocument(nextDocument);
      if (nextDocument) {
        writePageCache(DOCUMENT_CACHE_KEY(requestedId), {
          loaded: true,
          docData: nextDocument,
          pendingGeneration,
          generationErrors,
          exportErrors,
        });
      }

      if (!nextDocument) {
        pageError = t('document.notFound');
        return;
      }

      if (shouldPollDocument(nextDocument)) {
        schedulePoll();
      }
    } catch (error) {
      const message = text(error?.message) || t('document.loadingError');
      if (!background) {
        pageError = message;
      } else if (docData && shouldPollDocument(docData)) {
        schedulePoll();
      }
    } finally {
      if (!background) loading = false;
    }
  }

  function buildGuidance(guidance) {
    const reasonKey = text(guidance?.reasonKey).toLowerCase();
    const customInstruction = text(guidance?.customInstruction).slice(0, 500);
    if (!reasonKey && !customInstruction) return null;
    const payload = {};
    if (reasonKey) payload.reasonKey = reasonKey;
    if (customInstruction) payload.customInstruction = customInstruction;
    return payload;
  }

  function generationOptions(featureKey, guidance = null) {
    const options = { ...BASE_OPTIONS[featureKey] };
    const normalizedGuidance = buildGuidance(guidance);
    if (normalizedGuidance) options.regenerationGuidance = normalizedGuidance;
    return options;
  }

  async function queueGeneration(featureState, { regenerate = false, guidance = null } = {}) {
    if (!featureState || !currentDocumentId || extractionStatus !== 'complete') return false;
    if (regenerate && !featureState.canRegenerate) return false;
    if (!regenerate && !featureState.canGenerate) return false;

    setFeatureError(featureState.key, '');
    setFeaturePending(featureState.key, true);
    let queued = false;

    try {
      await requestGeneration(currentDocumentId, {
        type: featureState.key,
        options: generationOptions(featureState.key, guidance),
        regenerate,
      });
      queued = true;
      schedulePoll();
      await fetchDocumentState({ background: true });
      return true;
    } catch (error) {
      setFeaturePending(featureState.key, false);
      setFeatureError(featureState.key, text(error?.message) || t('document.generation.requestFailed'));
      return false;
    } finally {
      if (!queued) setFeaturePending(featureState.key, false);
    }
  }

  function triggerBlobDownload(blob, fileName) {
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = fileName || 'study-export.pdf';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(href), 0);
  }

  async function exportFeature(featureKey) {
    const target = featureState(featureKey, { document: docData, extractionStatus, pendingGeneration, generationErrors });
    if (!currentDocumentId || !target.hasContent || target.busy || exportBusy[featureKey]) return;

    setExportError(featureKey, '');
    setExportBusy(featureKey, true);

    try {
      const { blob, fileName } = await exportStudyMaterialPdf(currentDocumentId, featureKey);
      triggerBlobDownload(blob, fileName);
    } catch (error) {
      setExportError(featureKey, text(error?.message) || t('document.activity.errors.exportPdfFailed'));
    } finally {
      setExportBusy(featureKey, false);
    }
  }

  function openRegenerateModal(featureState) {
    if (!featureState?.canRegenerate || regenerateSubmitting) return;
    regenerateFeatureKey = featureState.key;
    regenerateModalOpen = true;
  }

  function closeRegenerateModal() {
    if (regenerateSubmitting) return;
    regenerateModalOpen = false;
  }

  async function submitRegeneration(event) {
    if (regenerateSubmitting) return;
    regenerateSubmitting = true;
    const target = featureState(regenerateFeatureKey, { document: docData, extractionStatus, pendingGeneration, generationErrors });
    const queued = await queueGeneration(target, { regenerate: true, guidance: event?.detail });
    regenerateSubmitting = false;
    if (queued) regenerateModalOpen = false;
  }

  function goBackToHub() {
    window.location.hash = currentDocumentId ? `/study/${currentDocumentId}` : '/study';
  }

  function startExam() {
    if (!examFeature.hasContent || examPhase !== 'question') return;
    examStarted = true;
    examSubmitError = '';
  }

  function previousFlashcard() {
    if (flashcardPhase !== 'question') return;
    if (flashcardIndex <= 0) return;
    flashcardIndex -= 1;
    revealAnswer = false;
    flashcardProgressError = '';
  }

  function nextFlashcard() {
    if (flashcardPhase !== 'question') return;
    if (flashcardIndex >= flashcards.length - 1) {
      flashcardPhase = 'result';
      revealAnswer = false;
      flashcardProgressError = '';
      return;
    }
    flashcardIndex += 1;
    revealAnswer = false;
    flashcardProgressError = '';
  }

  function restartFlashcardsSession() {
    resetFlashcardsState(flashcards.length);
  }

  async function markFlashcard(result) {
    if (!currentDocumentId || !currentFlashcard || flashcardProgressBusy) return;

    flashcardProgressBusy = true;
    flashcardProgressError = '';
    try {
      await saveFlashcardProgress({
        documentId: currentDocumentId,
        cardIndex: flashcardIndex,
        mastered: result === 'correct',
      });
      flashcardResults = flashcardResults.map((value, index) => (index === flashcardIndex ? result : value));
      revealAnswer = false;
      if (flashcardIndex < flashcards.length - 1) {
        flashcardIndex += 1;
      } else {
        flashcardPhase = 'result';
      }
    } catch (error) {
      flashcardProgressError = text(error?.message) || t('document.activity.flashcards.progressSaveError');
    } finally {
      flashcardProgressBusy = false;
    }
  }

  function resetExamState(questionCount = 0) {
    examPhase = 'question';
    currentQuestionIndex = 0;
    examAnswers = Array.from({ length: Math.max(0, questionCount) }, () => '');
    examScore = 0;
    examSubmitting = false;
    examSubmitError = '';
    examStarted = false;
  }

  function questionType(question) {
    const type = text(question?.type).toLowerCase();
    if (type === 'true_false' || type === 'truefalse') return 'true_false';
    return 'mcq';
  }

  function questionOptions(question) {
    const options = Array.isArray(question?.options) ? question.options.map((option) => text(option)).filter(Boolean) : [];
    return questionType(question) === 'true_false'
      ? [t('document.activity.exam.boolean.true'), t('document.activity.exam.boolean.false')]
      : options;
  }

  function setExamAnswer(answer) {
    examAnswers = examAnswers.map((value, index) => (index === currentQuestionIndex ? answer : value));
  }

  function previousQuestion() {
    if (currentQuestionIndex <= 0) return;
    currentQuestionIndex -= 1;
  }

  function nextQuestion() {
    if (currentQuestionIndex >= examQuestions.length - 1) return;
    currentQuestionIndex += 1;
  }

  function normalizeComparableAnswer(answer, type) {
    const normalized = text(answer).toLowerCase();
    if (type === 'true_false') {
      if (normalized === 'true' || normalized === 't') return 'true';
      if (normalized === 'false' || normalized === 'f') return 'false';
    }
    return normalized;
  }

  function isAnswerCorrect(question, answer) {
    const type = questionType(question);
    return normalizeComparableAnswer(answer, type)
      && normalizeComparableAnswer(answer, type) === normalizeComparableAnswer(question?.correctAnswer, type);
  }

  function examScoreValue() {
    let score = 0;
    for (let index = 0; index < examQuestions.length; index += 1) {
      if (isAnswerCorrect(examQuestions[index], examAnswers[index])) score += 1;
    }
    return score;
  }

  function attemptAnswersPayload() {
    return examQuestions.map((question, index) => ({
      questionIndex: index,
      question: text(question?.question),
      selectedAnswer: text(examAnswers[index]),
      correctAnswer: text(question?.correctAnswer),
    }));
  }

  async function submitExam() {
    if (!currentDocumentId || !examQuestions.length || examSubmitting) return;
    examSubmitting = true;
    examSubmitError = '';
    examScore = examScoreValue();
    examPhase = 'submitting';

    try {
      await saveLegacyExamAttempt({
        documentId: currentDocumentId,
        score: examScore,
        totalQuestions: examQuestions.length,
        answers: attemptAnswersPayload(),
      });
    } catch (error) {
      examSubmitError = text(error?.message) || t('document.activity.exam.saveAttemptError');
    } finally {
      examSubmitting = false;
      examPhase = 'result';
    }
  }

  function optionLetter(index) {
    return String.fromCharCode(65 + index);
  }

  function getFileType(document) {
    return getDocumentFileTypeLabel(document);
  }
</script>

{#if loading && !docData}
  <DocumentDetailSkeleton />
{:else if !docData}
  <Card as="section" class="activity-panel activity-panel-error" variant="base" padding="md" border="strong">
    <h2>{t('document.processingFailedTitle')}</h2>
    <p>{pageError || t('document.notFound')}</p>
    <Button type="button" variant="back" on:click={goBackToHub}>{t('document.activity.backToHub')}</Button>
  </Card>
{:else}
  <StudyActivityShell
    className={`document-activity document-activity--${mode}`}
    {mode}
    {modeLabel}
    {fileTypeBadge}
    status={chromeStatus}
    statusLabel={chromeStatusLabel}
    statusHeadline={chromeStatusHeadline}
    statusCopy={chromeStatusCopy}
    showProgress={showChromeProgress}
    progressLabel={chromeProgressLabel}
    progressValue={chromeProgressValue}
    progressMax={chromeProgressMax}
    contentWidth={showActiveStudyShell ? '' : 'wide'}
    chromeVariant={showActiveStudyShell ? 'active-session' : 'default'}
  >
    <div slot="back" class={`activity-back ${mode === 'flashcards' ? 'activity-back--flashcards' : ''}`}>
      <Button
        type="button"
        className={`chrome-back-link ${showActiveStudyShell ? 'chrome-back-link--session' : 'chrome-back-link--summary'}`}
        variant="ghost"
        size="sm"
        on:click={goBackToHub}
      >
        <span slot="icon" aria-hidden="true">
          <svg class="rtl-flip" viewBox="0 0 24 24"><path d="M10.75 6.75 5.5 12l5.25 5.25M6.5 12h12" /></svg>
        </span>
        {t('document.activity.backToHub')}
      </Button>
    </div>

    <svelte:fragment slot="chrome-progress">
      <div class={`session-chrome-progress ${mode === 'flashcards' ? 'session-chrome-progress--flashcards' : ''}`}>
        <ProgressBar
          value={chromeProgressValue}
          max={chromeProgressMax}
          ariaLabel={chromeProgressLabel}
          className="session-chrome-progress__bar"
        />
      </div>
    </svelte:fragment>

    <svelte:fragment slot="chrome-status">
      {#if mode === 'flashcards'}
        <div class="session-chrome-status session-chrome-status--flashcards" aria-label={chromeProgressLabel}>
          <span class="session-chrome-status__metric session-chrome-status__metric--current">
            Card {flashcards.length ? flashcardIndex + 1 : 0} / {flashcards.length}
          </span>
          <span class="session-chrome-status__dot" aria-hidden="true">&bull;</span>
          <span class="session-chrome-status__metric session-chrome-status__metric--correct">
            {t('document.exam.reviewCorrect')} {flashcardsCorrect}
          </span>
          <span class="session-chrome-status__dot" aria-hidden="true">&bull;</span>
          <span class="session-chrome-status__metric session-chrome-status__metric--incorrect">
            {t('document.exam.reviewIncorrect')} {flashcardsIncorrect}
          </span>
        </div>
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="actions">
      {#if activeFeature.hasContent}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          on:click={() => exportFeature(activeFeature.key)}
          loading={exportBusy[activeFeature.key]}
          disabled={!activeFeature.hasContent || activeFeature.busy}
        >
          <span slot="icon" aria-hidden="true">
            <Download />
          </span>
          {exportBusy[activeFeature.key] ? t('document.activity.actions.exportingPdf') : t('document.activity.actions.exportPdf')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          on:click={() => openRegenerateModal(activeFeature)}
          disabled={!activeFeature.canRegenerate}
        >
          {activeFeature.busy ? t('document.activity.regenerate.running') : t('document.actions.regenerate')}
        </Button>
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="banner">
      {#if extractionStatus === 'failed'}
        <Card as="section" class="activity-panel activity-panel-error status-panel" variant="base" padding="md" border="strong">
          <div class="row">
            <h2>{t('document.processingFailedTitle')}</h2>
            <StatusBadge status="failed" label={t('status.failed')} />
          </div>
          <p>{text(docData?.processingError) || t('document.processingFailed')}</p>
        </Card>
      {:else if showProcessingBanner}
        <Card as="section" class="activity-panel status-panel" variant="base" padding="md">
          <div class="row">
            <h2>{isExtractionActive(extractionStatus) ? t('document.activity.states.extractionProcessing') : t('document.activity.states.generationProcessing')}</h2>
            <StatusBadge status="processing" label={t('status.processing')} />
          </div>
          <p>{t('document.activity.states.processingContinues')}</p>
        </Card>
      {/if}
    </svelte:fragment>

    {#if mode === 'summary'}
      <div class="activity-content-head activity-content-head--summary">
        <div class="activity-content-head__copy">
          <Badge tone="success" variant="outline" size="sm" uppercase className="summary-mode-badge">{modeLabel}</Badge>
          <h1 class="activity-content-head__title">{title}</h1>
        </div>
        <div class="activity-content-head__actions">
          {#if summaryFeature.hasContent}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="summary-regenerate-button"
              on:click={() => exportFeature(summaryFeature.key)}
              loading={exportBusy[summaryFeature.key]}
              disabled={!summaryFeature.hasContent || summaryFeature.busy}
            >
              <span slot="icon" aria-hidden="true"><Download /></span>
              {exportBusy[summaryFeature.key] ? t('document.activity.actions.exportingPdf') : t('document.activity.actions.exportPdf')}
            </Button>
          {:else if !summaryFeature.hasContent && (summaryFeature.canGenerate || summaryFeature.busy)}
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="summary-regenerate-button"
              on:click={() => queueGeneration(summaryFeature, { regenerate: summaryFeature.shouldRegenerate })}
              disabled={!summaryFeature.canGenerate}
            >
              {summaryFeature.busy ? t('document.actions.generating') : t('document.activity.actions.generateSummary')}
            </Button>
          {/if}
        </div>
      </div>

      {#if activeExportError}
        <p class="error activity-inline-error">{activeExportError}</p>
      {/if}

      {#if summaryFeature.hasContent}
        <Card as="article" class="activity-frame activity-frame--summary" variant="base" padding="lg" border="strong">
          <article class="reader">
            {#if summaryBlocks.length}
              {#each summaryBlocks as block}
                {#if block.type === 'heading'}
                  <h3 class="reader-section-title">{block.text}</h3>
                {:else if block.type === 'list'}
                  <ul class="reader-list">
                    {#each block.items as item}
                      <li>
                        {#each parseInlineSegments(item) as segment}
                          {#if segment.strong}
                            <strong>{segment.text}</strong>
                          {:else}
                            {segment.text}
                          {/if}
                        {/each}
                      </li>
                    {/each}
                  </ul>
                {:else}
                  <p class="reader-paragraph">
                    {#each parseInlineSegments(block.text) as segment}
                      {#if segment.strong}
                        <strong>{segment.text}</strong>
                      {:else}
                        {segment.text}
                      {/if}
                    {/each}
                  </p>
                {/if}
              {/each}
            {:else}
              <p class="reader-paragraph">{docData.summary}</p>
            {/if}
          </article>
        </Card>
      {:else}
        <Card as="section" class="activity-launch activity-launch--empty" variant="base" padding="lg" border="dashed">
          <div class="launch-copy">
            <h2>{t('document.activity.summary.title')}</h2>
            <p>{summaryFeature.errorMessage || t('document.summary.generatePrompt')}</p>
          </div>
        </Card>
      {/if}
    {/if}

    {#if mode === 'flashcards'}
      <div class="activity-content-head activity-content-head--flashcards">
        <div class="activity-content-head__copy">
          <Badge tone="accent" variant="outline" size="sm" uppercase className="summary-mode-badge">{modeLabel}</Badge>
          <h1 class="activity-content-head__title">{title}</h1>
        </div>
        {#if flashcardsFeature.hasContent}
          <div class="activity-content-head__actions">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="summary-regenerate-button"
              on:click={() => exportFeature(flashcardsFeature.key)}
              loading={exportBusy[flashcardsFeature.key]}
              disabled={!flashcardsFeature.hasContent || flashcardsFeature.busy}
            >
              <span slot="icon" aria-hidden="true"><Download /></span>
              {exportBusy[flashcardsFeature.key] ? t('document.activity.actions.exportingPdf') : t('document.activity.actions.exportPdf')}
            </Button>
          </div>
        {/if}
      </div>

      {#if activeExportError}
        <p class="error activity-inline-error">{activeExportError}</p>
      {/if}

      {#if flashcardsFeature.hasContent}
        <section class="study-session study-session--flashcards" aria-label={modeLabel}>
          <section class="study-session__canvas study-session__canvas--flashcards">
            {#if flashcardsCompleted}
              <Card as="article" class="activity-frame study-session-panel study-session-panel--review flashcard-results-card" variant="base" padding="lg" border="strong">
                <p class="flashcard-results-card__label">{t('document.activity.flashcards.resultsTitle')}</p>
                <p class="flashcard-results-card__value">{flashcardsCorrect} / {flashcards.length}</p>
                <p class="flashcard-results-card__meta">
                  {t('document.activity.flashcards.resultsMeta', {
                    incorrect: flashcardsIncorrect,
                    unanswered: flashcardsUnanswered,
                  })}
                </p>
              </Card>

              <div class="flashcard-review-head">
                <h3>{t('document.activity.exam.reviewTitle')}</h3>
              </div>

              <div class="stack stack-spacious flashcard-review-list">
                {#each flashcards as flashcard, index}
                  <article class="review" class:review-correct={flashcardResults[index] === 'correct'}>
                    <div class="review-head">
                      <p class="review-question">{index + 1}. {flashcard.question}</p>
                      <span class={`review-icon ${flashcardResults[index] === 'correct' ? 'review-icon--correct' : 'review-icon--incorrect'}`} aria-hidden="true">
                        {#if flashcardResults[index] === 'correct'}
                          <Check />
                        {:else if flashcardResults[index] === 'incorrect'}
                          <X />
                        {:else}
                          <span class="review-icon__dash">-</span>
                        {/if}
                      </span>
                    </div>
                    <div class="review-copy">
                      <p>
                        <strong>{t('document.activity.flashcards.resultLabel')}</strong>
                        {' '}
                        {flashcardResults[index] === 'correct'
                          ? t('document.exam.reviewCorrect')
                          : flashcardResults[index] === 'incorrect'
                            ? t('document.exam.reviewIncorrect')
                            : t('document.activity.exam.notAnswered')}
                      </p>
                      <p><strong>{t('document.activity.flashcards.answerLabel')}</strong> {flashcard.answer}</p>
                      {#if text(flashcard.explanation)}
                        <p>{flashcard.explanation}</p>
                      {/if}
                    </div>
                  </article>
                {/each}
              </div>

              <Button type="button" variant="primary" block className="flashcard-retake-button" on:click={restartFlashcardsSession}>
                <span slot="icon" aria-hidden="true">
                  <RotateCcw />
                </span>
                {t('document.activity.flashcards.restart')}
              </Button>
            {:else}
              <Card
                as="article"
                class={`activity-stage flashcard-stage study-session-card study-session-card--flashcards ${revealAnswer ? 'flashcard-stage-answer' : ''}`}
                variant="base"
                padding="lg"
                border={revealAnswer ? 'strong' : 'subtle'}
              >
                <div class="flashcard-stage__copy study-session-card__copy study-session-card__copy--flashcards">
                  <p class="card-side">{t('document.activity.flashcards.questionLabel')}</p>
                  <h2>{currentFlashcard?.question}</h2>
                </div>

                <div class={`flashcard-stage__answer ${revealAnswer ? 'flashcard-stage__answer--visible' : ''}`}>
                  <div class="flashcard-stage__answer-copy">
                    <p class="flashcard-stage__answer-label">{t('document.activity.flashcards.answerLabel')}</p>
                    <p class="flashcard-stage__answer-text">{currentFlashcard?.answer}</p>
                    {#if revealAnswer && text(currentFlashcard?.explanation)}
                      <p class="explanation">{currentFlashcard.explanation}</p>
                    {/if}
                  </div>
                </div>
              </Card>

              <div class="study-session__primary study-session__primary--flashcards controls controls-primary">
                {#if !revealAnswer}
                  <Button type="button" variant="primary" size="lg" block className="flashcard-reveal-button" on:click={() => (revealAnswer = true)}>
                    {t('document.activity.actions.revealAnswer')}
                  </Button>
                {:else}
                  <div class="study-session__answer-actions study-session__answer-actions--flashcards">
                    <Button type="button" variant="success" className="flashcard-score-button" on:click={() => markFlashcard('correct')} disabled={flashcardProgressBusy}>
                      <span slot="icon" aria-hidden="true">
                        <Check />
                      </span>
                      {t('document.activity.actions.markCorrect')}
                  </Button>
                  <Button type="button" variant="danger" className="flashcard-score-button" on:click={() => markFlashcard('incorrect')} disabled={flashcardProgressBusy}>
                    <span slot="icon" aria-hidden="true">
                      <X />
                    </span>
                    {t('document.activity.actions.markIncorrect')}
                  </Button>
                </div>
              {/if}
            </div>

              {#if flashcardProgressError}<p class="error study-session__error">{flashcardProgressError}</p>{/if}

              <div class="flashcard-session-footer">
                <div class="study-session__nav controls controls-secondary flashcard-nav">
                  <Button type="button" variant="secondary" size="lg" className="flashcard-nav-button" on:click={previousFlashcard} disabled={flashcardIndex === 0}>
                    <span slot="icon" aria-hidden="true">
                      <ChevronLeft class="rtl-flip" />
                    </span>
                    {t('document.activity.actions.previous')}
                  </Button>
                <Button type="button" variant="secondary" size="lg" className="flashcard-nav-button" on:click={nextFlashcard}>
                    {flashcardIndex >= flashcards.length - 1 ? t('document.activity.flashcards.viewResults') : t('document.activity.actions.next')}
                    <span slot="icon" aria-hidden="true">
                      <ChevronRight class="rtl-flip" />
                    </span>
                  </Button>
                </div>

              </div>
            {/if}
          </section>
        </section>
      {:else}
        <Card as="section" class="activity-launch activity-launch--empty" variant="base" padding="lg" border="dashed">
          <div class="launch-copy">
            <h2>{t('document.hub.features.flashcards')}</h2>
            <p>{flashcardsFeature.errorMessage || t('document.flashcards.generatePrompt')}</p>
          </div>
          <div class="launch-actions">
            <Button type="button" variant="primary" on:click={() => queueGeneration(flashcardsFeature, { regenerate: flashcardsFeature.shouldRegenerate })} disabled={!flashcardsFeature.canGenerate}>
              {flashcardsFeature.busy ? t('document.actions.generating') : t('document.activity.actions.generateFlashcards')}
            </Button>
          </div>
        </Card>
      {/if}
    {/if}

    {#if mode === 'exam'}
      <div class="activity-content-head activity-content-head--exam">
        <div class="activity-content-head__copy">
          <Badge tone="warning" variant="soft" size="sm" uppercase className="summary-mode-badge">{modeLabel}</Badge>
          <h1 class="activity-content-head__title">{title}</h1>
        </div>
        {#if examFeature.hasContent}
          <div class="activity-content-head__actions">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="summary-regenerate-button"
              on:click={() => exportFeature(examFeature.key)}
              loading={exportBusy[examFeature.key]}
              disabled={!examFeature.hasContent || examFeature.busy}
            >
              <span slot="icon" aria-hidden="true"><Download /></span>
              {exportBusy[examFeature.key] ? t('document.activity.actions.exportingPdf') : t('document.activity.actions.exportPdf')}
            </Button>
          </div>
        {/if}
      </div>

      {#if activeExportError}
        <p class="error activity-inline-error">{activeExportError}</p>
      {/if}

      {#if examFeature.hasContent}
        {#if examPhase === 'submitting'}
          <section class="study-session study-session--exam exam-surface">
            <section class="study-session__canvas study-session__canvas--compact">
              <Card as="article" class="activity-launch activity-launch--submitting study-session-panel study-session-panel--compact exam-start-card" variant="base" padding="lg" border="strong">
                <div class="launch-copy">
                  <Badge tone="info" variant="soft" size="sm" uppercase>{t('status.processing')}</Badge>
                  <h2>{t('document.activity.exam.submittingTitle')}</h2>
                  <p>{t('document.activity.exam.submittingBody')}</p>
                </div>
              </Card>
            </section>
          </section>
        {:else if examPhase === 'result'}
          <section class="study-session study-session--exam study-session--scrollable exam-surface" aria-label={modeLabel}>
            <section class="study-session__canvas study-session__canvas--results">
              <Card as="article" class="activity-frame activity-frame--results study-session-panel study-session-panel--review exam-score-card" variant="base" padding="lg" border="strong">
                <p class="exam-score-card__label">{t('document.activity.exam.resultsTitle')}</p>
                <p class="exam-score-card__value">{examScore} / {examQuestions.length}</p>
                <p class="exam-score-card__meta">{examScorePercent}% correct</p>
              </Card>

              {#if examSubmitError}<p class="error">{examSubmitError}</p>{/if}

              <div class="exam-review-head">
                <h3>{t('document.activity.exam.reviewTitle')}</h3>
              </div>

              <div class="stack stack-spacious exam-review-list">
                {#each examQuestions as question, index}
                  <article class="review" class:review-correct={isAnswerCorrect(question, examAnswers[index])}>
                    <div class="review-head">
                      <p class="review-question">{index + 1}. {question.question}</p>
                      <span class={`review-icon ${isAnswerCorrect(question, examAnswers[index]) ? 'review-icon--correct' : 'review-icon--incorrect'}`} aria-hidden="true">
                        {#if isAnswerCorrect(question, examAnswers[index])}
                          <Check />
                        {:else}
                          <X />
                        {/if}
                      </span>
                    </div>
                    <div class="review-copy">
                      <p>
                        {t('document.activity.exam.yourAnswer', { answer: text(examAnswers[index]) || t('document.activity.exam.notAnswered') })}
                      </p>
                      {#if !isAnswerCorrect(question, examAnswers[index])}
                        <p>{t('document.activity.exam.correctAnswer', { answer: text(question?.correctAnswer) })}</p>
                      {/if}
                    </div>
                  </article>
                {/each}
              </div>

              <Button type="button" variant="primary" block className="exam-retake-button" on:click={() => resetExamState(examQuestions.length)}>
                <span slot="icon" aria-hidden="true">
                  <RotateCcw />
                </span>
                {t('document.activity.actions.retakeExam')}
              </Button>
            </section>
          </section>
        {:else if showExamLaunch}
          <section class="study-session study-session--exam exam-surface" aria-label={modeLabel}>
            <section class="study-session__canvas study-session__canvas--compact">
              <Card as="section" class="activity-launch exam-start-card" variant="base" padding="lg" border="strong">
                <div class="launch-copy exam-start-card__copy">
                  <h2>{t('document.activity.exam.introTitle')}</h2>
                  <p>{t('document.activity.exam.introDescription', { count: examQuestions.length })}</p>
                </div>

                <div class="launch-actions exam-start-card__actions">
                  <Button type="button" variant="primary" size="lg" block className="exam-start-button" on:click={startExam}>
                    <span slot="icon" aria-hidden="true">
                      <Play />
                    </span>
                    {t('document.activity.actions.startExam')}
                  </Button>
                </div>
              </Card>
            </section>
          </section>
        {:else}
          <section class="study-session study-session--exam exam-surface" aria-label={modeLabel}>
            <section class="study-session__canvas study-session__canvas--exam">
              <div class="exam-progress">
                <div class="exam-progress__meta">
                  <span>{examChromeCurrentLabel}</span>
                  <span>{t('document.activity.exam.answeredInline', { answered: examAnsweredCount })}</span>
                </div>
                <ProgressBar
                  value={currentQuestionIndex + 1}
                  max={examQuestions.length || 1}
                  ariaLabel={examProgressLabel}
                  className="exam-progress__bar"
                />
              </div>

              <Card as="article" class="activity-stage question-surface study-session-card study-session-card--exam exam-question-card" variant="base" padding="lg" border="strong">
                <div class="study-session-card__copy study-session-card__copy--exam">
                  <p class="exam-question-card__prompt">{currentExamQuestion?.question}</p>
                </div>

                <div class="stack stack-spacious study-session-card__body exam-option-stack">
                  {#each questionOptions(currentExamQuestion) as option, optionIndex}
                    <button type="button" class="option" class:option-selected={text(examAnswers[currentQuestionIndex]) === option} on:click={() => setExamAnswer(option)}>
                      <span class="option-letter">{optionLetter(optionIndex)}</span>
                      <span>{option}</span>
                    </button>
                  {/each}
                </div>
              </Card>

              <div class="study-session__nav controls controls-secondary exam-nav">
                <Button type="button" variant="secondary" size="md" className="exam-nav-button" on:click={previousQuestion} disabled={currentQuestionIndex === 0}>
                  <span slot="icon" aria-hidden="true">
                    <ChevronLeft class="rtl-flip" />
                  </span>
                  {t('document.activity.actions.previous')}
                </Button>
                {#if currentQuestionIndex < examQuestions.length - 1}
                  <Button type="button" variant="primary" size="md" className="exam-nav-button" on:click={nextQuestion} disabled={!text(examAnswers[currentQuestionIndex])}>
                    {t('document.activity.actions.next')}
                    <span slot="icon" aria-hidden="true">
                      <ChevronRight class="rtl-flip" />
                    </span>
                  </Button>
                {:else}
                  <Button type="button" variant="primary" size="md" className="exam-nav-button" on:click={submitExam} disabled={examSubmitting || !text(examAnswers[currentQuestionIndex])}>
                    {t('document.activity.actions.submitExam')}
                    <span slot="icon" aria-hidden="true">
                      <ChevronRight class="rtl-flip" />
                    </span>
                  </Button>
                {/if}
              </div>
            </section>
          </section>
        {/if}
      {:else}
        <Card as="section" class="activity-launch activity-launch--empty" variant="base" padding="lg" border="dashed">
          <div class="launch-copy">
            <h2>{t('document.hub.features.exam')}</h2>
            <p>{examFeature.errorMessage || t('document.exam.generatePrompt')}</p>
          </div>
          <div class="launch-actions">
            <Button type="button" variant="primary" on:click={() => queueGeneration(examFeature, { regenerate: examFeature.shouldRegenerate })} disabled={!examFeature.canGenerate}>
              {examFeature.busy ? t('document.actions.generating') : t('document.activity.actions.generateExam')}
            </Button>
          </div>
        </Card>
      {/if}
    {/if}
  </StudyActivityShell>
{/if}

<GuidedRegenerateModal
  open={regenerateModalOpen}
  busy={regenerateSubmitting}
  title={t('document.activity.regenerate.title')}
  description={t('document.activity.regenerate.description')}
  reasons={regenerationReasonOptions}
  reasonLabel={t('document.activity.regenerate.reasonLabel')}
  customLabel={t('document.activity.regenerate.customLabel')}
  customPlaceholder={t('document.activity.regenerate.customPlaceholder')}
  confirmLabel={t('document.activity.regenerate.confirm')}
  cancelLabel={t('document.activity.regenerate.cancel')}
  on:cancel={closeRegenerateModal}
  on:confirm={submitRegeneration}
/>

<style>
  :global(.document-activity) {
    min-width: 0;
  }

  .activity-back {
    width: 100%;
  }

  .activity-back--flashcards {
    width: fit-content;
    display: flex;
    justify-content: flex-start;
    justify-self: start;
    align-items: center;
  }

  /* Inline page header that now lives inside the content body for summary/exam */
  .activity-content-head {
    width: 100%;
    margin-inline: auto;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--study-flow-action-gap);
    flex-wrap: wrap;
  }

  .activity-content-head--summary {
    max-width: var(--study-flow-reading-width);
  }

  .activity-content-head--flashcards {
    max-width: var(--study-flow-session-content-width);
  }

  .activity-content-head--exam {
    max-width: var(--study-flow-session-width);
  }

  .activity-content-head__copy {
    display: grid;
    gap: var(--ui-space-2);
    min-width: 0;
    flex: 1;
  }

  .activity-content-head__title {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: var(--study-flow-title-size);
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.02em;
  }

  .activity-content-head__actions {
    display: flex;
    align-items: flex-start;
    flex-shrink: 0;
  }

  .activity-inline-error {
    width: 100%;
    margin: 0 auto;
  }

  :global(.chrome-back-link) {
    width: fit-content;
    border-color: transparent;
    background: transparent;
  }

  :global(.chrome-back-link--summary.ui-button) {
    min-height: auto;
    padding-inline: 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
  }

  :global(.chrome-back-link--summary.ui-button:hover:not(:disabled)) {
    transform: none;
  }

  :global(.chrome-back-link svg) {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.9;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .summary-chrome__actions {
    display: flex;
    justify-content: flex-start;
    gap: var(--study-flow-action-gap);
  }

  :global(.summary-mode-badge.ui-badge) {
    width: fit-content;
    min-height: var(--study-flow-chip-min-height);
    padding-inline: var(--study-flow-chip-padding-inline);
    border-radius: var(--study-flow-chip-radius);
  }

  :global(.summary-chrome__actions .ui-button) {
    min-height: var(--ui-control-height-sm);
  }

  :global(.summary-regenerate-button.ui-button) {
    box-shadow: none;
  }

  .row,
  .section-header,
  .review-head {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .section-copy,
  .launch-copy {
    display: grid;
    gap: var(--study-flow-copy-gap);
  }

  .error,
  .review p,
  .launch-copy p {
    margin: 0;
  }

  .launch-copy p,
  .review p {
    color: var(--ui-text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  :global(.activity-panel),
  :global(.activity-frame),
  :global(.activity-launch),
  :global(.activity-stage) {
    display: grid;
    gap: var(--study-flow-card-gap);
  }

  :global(.status-panel),
  :global(.activity-frame),
  :global(.activity-launch) {
    width: min(100%, var(--study-flow-hub-width));
    margin-inline: auto;
  }

  :global(.activity-panel-error) {
    border-color: color-mix(in srgb, var(--color-danger) 35%, var(--color-border) 65%);
  }

  :global(.activity-launch) {
    min-height: 0;
    align-content: start;
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-surface-card) 100%, transparent), color-mix(in srgb, var(--ui-surface-card) 86%, var(--ui-surface-secondary) 14%));
  }

  :global(.activity-launch--empty) {
    background: color-mix(in srgb, var(--ui-surface-card) 96%, transparent);
  }

  :global(.activity-launch--submitting),
  :global(.activity-frame--results) {
    max-width: var(--size-page-readable);
  }

  :global(.activity-frame--summary) {
    width: min(100%, var(--study-flow-reading-width));
    min-height: 0;
    gap: var(--study-flow-card-gap);
    border-radius: var(--study-flow-card-radius);
    background: var(--study-flow-card-surface);
    box-shadow: none;
  }

  .eyebrow,
  .card-side {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.67rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    font-weight: 600;
  }

  h2,
  p {
    margin: 0;
  }

  .launch-copy h2,
  :global(.flashcard-stage) h2 {
    font-size: clamp(1.15rem, 2vw, 1.6rem);
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .reader {
    display: grid;
    gap: 1.35rem;
  }

  .reader-paragraph,
  .reader-list li {
    line-height: 1.8;
    white-space: pre-wrap;
    color: color-mix(in srgb, var(--foreground) 84%, var(--muted-foreground) 16%);
    font-size: clamp(0.98rem, 1vw, 1.03rem);
  }

  .reader-section-title {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: clamp(1rem, 0.92rem + 0.42vw, 1.18rem);
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: -0.02em;
  }

  .reader-list {
    margin: 0;
    padding-left: 1.25rem;
    display: grid;
    gap: 0.7rem;
  }

  .reader strong,
  .reader-list strong {
    color: var(--ui-text-primary);
    font-weight: 600;
  }

  .launch-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.75rem;
  }

  .launch-metric {
    display: grid;
    gap: 0.35rem;
    padding: 0.95rem 1rem;
    border: 1px solid color-mix(in srgb, var(--ui-border-default) 88%, transparent);
    border-radius: var(--ui-radius-md);
    background: color-mix(in srgb, var(--ui-surface-secondary) 54%, var(--ui-surface-card) 46%);
  }

  .launch-metric__label {
    color: var(--ui-text-secondary);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .launch-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .launch-actions :global(.ui-button) {
    min-width: 10rem;
  }

  .session-chrome-progress {
    width: min(100%, 13rem);
  }

  .session-chrome-progress--flashcards {
    width: min(100%, var(--study-flow-session-progress-width));
    justify-self: center;
  }

  :global(.session-chrome-progress__bar) {
    height: 0.38rem;
    background: color-mix(in srgb, var(--ui-progress-track) 82%, transparent);
  }

  .session-chrome-status {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    flex-wrap: wrap;
    color: var(--ui-text-secondary);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .session-chrome-status--flashcards {
    width: 100%;
    justify-content: flex-end;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    gap: 0.45rem;
    flex-wrap: nowrap;
    white-space: nowrap;
  }

  :global(.study-activity-shell--flashcards.study-activity-shell--active-session .activity-chrome__controls) {
    align-items: center;
    gap: clamp(0.85rem, 0.9vw + 0.45rem, 1.25rem);
  }

  :global(.study-activity-shell--flashcards.study-activity-shell--active-session .activity-chrome__rail) {
    width: 100%;
    padding-block: 0 0;
    background: linear-gradient(180deg, color-mix(in srgb, var(--ui-bg-page) 96%, transparent), color-mix(in srgb, var(--ui-bg-page) 88%, transparent) 72%, transparent);
  }

  :global(.study-activity-shell--flashcards.study-activity-shell--active-session .activity-chrome__pane--progress) {
    justify-content: center;
  }

  :global(.study-activity-shell--flashcards.study-activity-shell--active-session .activity-chrome__pane--status) {
    min-width: 0;
    width: 100%;
  }

  .session-chrome-status__metric {
    white-space: nowrap;
  }

  .session-chrome-status__metric--current {
    color: var(--ui-text-primary);
  }

  .session-chrome-status__metric--correct {
    color: var(--ui-accent-success);
  }

  .session-chrome-status__metric--incorrect {
    color: var(--ui-accent-danger);
  }

  .session-chrome-status__metric--info {
    color: var(--ui-accent-info);
  }

  .session-chrome-status__dot {
    color: var(--ui-text-muted);
  }

  :global(.chrome-back-link--session.ui-button) {
    min-height: auto;
    padding: 0;
    width: auto;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    font-weight: 500;
    letter-spacing: -0.01em;
    box-shadow: none;
    border: none;
    border-radius: 0;
    background: transparent;
    justify-content: flex-start;
    flex-shrink: 0;
    white-space: nowrap;
  }

  :global(.chrome-back-link--session.ui-button:hover:not(:disabled)) {
    transform: none;
    color: var(--ui-text-primary);
  }

  .study-session {
    width: 100%;
    display: grid;
    grid-template-rows: auto;
    align-content: start;
    justify-items: center;
    gap: clamp(1.1rem, 0.9rem + 0.7vw, 1.5rem);
    padding-top: 0;
  }

  .study-session--scrollable {
    grid-template-rows: auto;
  }

  .study-session__canvas {
    width: 100%;
    margin-inline: auto;
    display: grid;
    align-content: start;
    justify-items: center;
    gap: clamp(1rem, 0.85rem + 0.55vw, 1.35rem);
    padding-block: 0;
  }

  .study-session__canvas--flashcards {
    max-width: var(--study-flow-session-content-width);
    gap: var(--study-flow-card-gap);
  }

  .study-session__canvas--exam {
    max-width: var(--study-flow-session-width);
  }

  .study-session__canvas--results,
  .study-session__canvas--compact {
    max-width: var(--study-flow-session-width);
  }

  .study-session--scrollable .study-session__canvas {
    align-content: start;
    padding-block: 0;
  }

  .study-session__hint {
    justify-self: center;
    text-align: center;
    color: var(--ui-text-muted);
    font-size: 0.82rem;
    line-height: 1.5;
    letter-spacing: 0.01em;
    margin-top: 0;
    padding-bottom: 0;
  }

  .study-session__hint--flashcards {
    width: fit-content;
    max-width: 100%;
    margin: 0;
    padding: 0;
    color: var(--ui-text-muted);
    font-size: 0.75rem;
    line-height: 1.5;
    text-align: center;
  }

  .study-session__primary,
  .study-session__nav,
  .study-session__error {
    width: min(100%, var(--study-flow-session-width));
  }

  .study-session__primary {
    justify-content: center;
    margin-top: 0;
  }

  .study-session__primary--flashcards {
    margin-top: 0;
  }

  .study-session__answer-actions {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .study-session__answer-actions--flashcards {
    gap: var(--study-flow-card-gap);
  }

  .controls {
    display: flex;
    gap: 0.55rem;
    flex-wrap: wrap;
  }

  .controls-primary {
    justify-content: center;
  }

  .controls-secondary {
    justify-content: space-between;
    align-items: center;
    margin-top: 0;
  }

  .study-session__nav :global(.ui-button) {
    min-width: 0;
  }

  :global(.study-session-card) {
    width: min(100%, var(--study-flow-session-width));
    background: var(--study-flow-card-surface);
    box-shadow: none;
  }

  :global(.study-session-card--flashcards) {
    width: 100%;
    min-height: clamp(18rem, 38vh, 22rem);
    display: grid;
    gap: clamp(1rem, 0.8rem + 0.75vw, 1.5rem);
    text-align: left;
    border-radius: var(--study-flow-card-radius);
    padding: clamp(1.5rem, 1.15rem + 0.8vw, 2rem);
    box-shadow: none;
  }

  .study-session-card__copy {
    display: grid;
    gap: 0.55rem;
  }

  .study-session-card__copy--flashcards {
    width: 100%;
    gap: 0.9rem;
    justify-items: start;
    text-align: left;
  }

  .study-session-card__copy--exam {
    width: 100%;
    gap: var(--ui-space-3);
    justify-items: start;
    text-align: left;
  }

  .study-session-card__body {
    width: 100%;
  }

  :global(.study-session-card) h2 {
    max-width: none;
    text-wrap: balance;
  }

  :global(.study-session-card--flashcards) h2 {
    max-width: none;
    font-size: clamp(1.55rem, 1.15rem + 0.95vw, 2.2rem);
    line-height: 1.38;
    font-weight: 500;
    letter-spacing: -0.03em;
  }

  :global(.study-session-card--exam) {
    max-height: none;
    gap: calc(var(--study-flow-card-gap) + var(--ui-space-2));
    border-radius: var(--study-flow-card-radius);
    box-shadow: none;
  }

  :global(.study-session-card--exam) h2 {
    font-size: clamp(1.35rem, 1.15rem + 0.8vw, 1.8rem);
    line-height: 1.35;
  }

  .exam-surface {
    gap: var(--study-flow-card-gap);
  }

  .exam-start-card {
    width: min(100%, var(--study-flow-hub-width));
    min-height: 0;
    justify-items: center;
    text-align: center;
    gap: calc(var(--study-flow-card-gap) + var(--ui-space-2));
    border-radius: var(--study-flow-card-radius);
    background: var(--study-flow-card-surface);
    box-shadow: none;
    align-content: center;
  }

  :global(.activity-launch.exam-start-card) {
    width: min(100%, var(--study-flow-hub-width));
    min-height: 0;
    align-content: center;
  }

  .exam-start-card__copy,
  .exam-start-card__actions {
    width: 100%;
  }

  .exam-start-card__copy {
    justify-items: center;
    text-align: center;
  }

  .exam-start-card__actions {
    display: grid;
  }

  .exam-start-button {
    width: 100%;
    min-height: 3.5rem;
    box-shadow: none;
    border-radius: calc(var(--ui-radius-md) + 0.05rem);
  }

  .exam-progress {
    width: min(100%, var(--study-flow-session-width));
    display: grid;
    gap: 0.55rem;
  }

  .exam-progress__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    color: var(--ui-text-secondary);
    font-size: 0.84rem;
    line-height: 1.4;
  }

  :global(.exam-progress__bar) {
    height: 0.38rem;
  }

  .exam-question-card {
    gap: 1.5rem;
    background: var(--study-flow-card-surface);
  }

  .exam-question-card__prompt {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: clamp(1.05rem, 0.95rem + 0.45vw, 1.18rem);
    font-weight: 500;
    line-height: 1.65;
  }

  .exam-option-stack {
    width: 100%;
  }

  .exam-nav {
    width: min(100%, var(--study-flow-session-width));
    gap: 0.75rem;
  }

  :global(.exam-nav-button.ui-button) {
    flex: 1 1 0;
    min-width: 0;
    box-shadow: none;
  }

  .exam-score-card {
    width: min(100%, var(--study-flow-session-width));
    justify-items: center;
    text-align: center;
    gap: 0.55rem;
    box-shadow: none;
  }

  .exam-score-card__label,
  .exam-score-card__meta {
    margin: 0;
    color: var(--ui-text-secondary);
  }

  .exam-score-card__label {
    font-size: 0.84rem;
  }

  .exam-score-card__value {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: clamp(2.25rem, 2rem + 1vw, 3rem);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .exam-score-card__meta {
    font-size: 0.9rem;
  }

  .exam-review-head h3 {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: 0.84rem;
    font-weight: 600;
  }

  .exam-review-list {
    width: 100%;
  }

  .review-copy {
    display: grid;
    gap: 0.3rem;
  }

  .review-copy p {
    color: var(--ui-text-secondary);
  }

  .review-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .review-icon svg {
    width: 1.1rem;
    height: 1.1rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

  .review-icon__dash {
    font-size: 1rem;
    line-height: 1;
    color: var(--ui-text-muted);
  }

  .review-icon--correct {
    color: var(--ui-accent-success);
  }

  .review-icon--incorrect {
    color: var(--ui-accent-danger);
  }

  :global(.exam-retake-button.ui-button) {
    box-shadow: none;
  }

  :global(.study-session-panel--compact),
  :global(.study-session-panel--review) {
    width: 100%;
  }

  :global(.flashcard-stage-answer) {
    border-color: var(--ui-border-strong);
  }

  .flashcard-stage__answer {
    display: grid;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    border-top: 0 solid transparent;
    padding-top: 0;
    transition:
      max-height var(--motion-slow) var(--ease-standard),
      opacity var(--motion-default) var(--ease-standard),
      padding-top var(--motion-default) var(--ease-standard),
      border-color var(--motion-default) var(--ease-standard);
  }

  .flashcard-stage__answer--visible {
    max-height: 22rem;
    opacity: 1;
    border-top: 1px solid var(--ui-border-default);
    padding-top: 1.1rem;
  }

  .flashcard-stage__answer-copy {
    display: grid;
    gap: 0.8rem;
  }

  .flashcard-stage__answer-label {
    margin: 0;
    color: var(--ui-accent-success);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .flashcard-stage__answer-text {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: 0.98rem;
    line-height: 1.65;
  }

  :global(.flashcard-reveal-button.ui-button) {
    min-height: 3.25rem;
    font-size: 0.98rem;
    box-shadow: none;
    border-radius: calc(var(--ui-radius-md) + 0.05rem);
    border: 1px solid var(--ui-text-primary);
  }

  :global(.flashcard-score-button.ui-button) {
    min-height: 3.1rem;
    flex: 1 1 0;
    font-size: 0.95rem;
    box-shadow: none;
    border: 1px solid currentColor;
  }

  :global(.flashcard-score-button .ui-button__icon svg),
  :global(.flashcard-nav-button .ui-button__icon svg) {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

  .flashcard-nav {
    width: 100%;
    gap: var(--ui-space-4);
    margin-top: 0;
  }

  :global(.flashcard-nav-button.ui-button) {
    flex: 1 1 0;
    min-width: var(--study-flow-session-nav-button-min-width);
    min-height: var(--study-flow-session-nav-button-height);
    padding-inline: 1.25rem;
    border-radius: calc(var(--ui-radius-md) - 0.05rem);
    background: var(--ui-surface-card);
    border: 1px solid var(--ui-border-default);
    color: var(--ui-text-primary);
    box-shadow: none;
  }

  :global(.flashcard-nav-button.ui-button:hover:not(:disabled)) {
    transform: none;
  }

  :global(.flashcard-nav-button .ui-button__icon) {
    color: var(--ui-text-secondary);
  }

  .flashcard-session-footer {
    width: 100%;
    display: grid;
    justify-items: center;
    gap: var(--ui-space-3);
  }

  .flashcard-results-card {
    width: min(100%, var(--study-flow-session-width));
    justify-items: center;
    text-align: center;
    gap: 0.55rem;
    box-shadow: none;
  }

  .flashcard-results-card__label,
  .flashcard-results-card__meta {
    margin: 0;
    color: var(--ui-text-secondary);
  }

  .flashcard-results-card__label {
    font-size: 0.84rem;
  }

  .flashcard-results-card__value {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: clamp(2.1rem, 1.9rem + 0.9vw, 2.8rem);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .flashcard-results-card__meta {
    font-size: 0.9rem;
  }

  .flashcard-review-head h3 {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: 0.84rem;
    font-weight: 600;
  }

  .flashcard-review-list {
    width: 100%;
  }

  :global(.flashcard-retake-button.ui-button) {
    box-shadow: none;
  }

  .explanation {
    color: var(--color-text-secondary);
    line-height: 1.6;
    font-size: var(--font-size-sm);
    max-width: 34rem;
  }

  :global(.question-surface) {
    gap: 1rem;
  }

  .stack {
    display: grid;
    gap: 0.75rem;
  }

  .stack-spacious {
    gap: 0.9rem;
  }

  .option {
    border: 1px solid color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    border-radius: var(--ui-radius-sm);
    background: color-mix(in srgb, var(--card) 88%, var(--muted) 12%);
    color: var(--color-text-primary);
    min-height: 3.75rem;
    padding: 0.95rem 1rem;
    display: flex;
    gap: 0.85rem;
    align-items: start;
    cursor: pointer;
    text-align: left;
    font: inherit;
    font-size: var(--font-size-sm);
    box-shadow: none;
    transition: border-color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard),
      transform var(--motion-fast) var(--ease-standard);
  }

  .option:hover {
    border-color: color-mix(in srgb, var(--ui-text-primary) 56%, var(--ui-border-default) 44%);
    background:
      linear-gradient(90deg, color-mix(in srgb, var(--ui-text-primary) 14%, transparent), transparent 18%),
      color-mix(in srgb, var(--ui-surface-secondary) 86%, var(--ui-surface-card) 14%);
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--ui-text-primary) 18%, transparent),
      0 12px 28px rgba(0, 0, 0, 0.22);
    transform: translateY(-3px);
  }

  .option-selected {
    border-color: color-mix(in srgb, var(--ui-text-primary) 76%, var(--ui-border-default) 24%);
    background: linear-gradient(180deg, #ffffff 0%, #f1f1f1 100%);
    color: #111111;
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.72),
      0 16px 36px rgba(0, 0, 0, 0.26);
    transform: translateY(-2px);
  }

  .option-selected .option-letter {
    border-color: #111111;
    background: #111111;
    color: #ffffff;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.16);
  }

  .option:focus-visible {
    outline: none;
    box-shadow:
      var(--ui-focus-ring-strong),
      0 0 0 1px color-mix(in srgb, var(--ui-text-primary) 22%, transparent);
  }

  .option-letter {
    width: 1.75rem;
    height: 1.75rem;
    flex: 0 0 auto;
    border-radius: 0.5rem;
    border: 1px solid color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    display: grid;
    place-items: center;
    font-size: 0.67rem;
    font-weight: 600;
    background: color-mix(in srgb, var(--background) 75%, var(--muted) 25%);
    transition: border-color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .option:hover .option-letter {
    border-color: color-mix(in srgb, var(--ui-text-primary) 46%, var(--ui-border-default) 54%);
    background: color-mix(in srgb, var(--ui-text-primary) 28%, var(--ui-surface-secondary) 72%);
    color: var(--ui-text-primary);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ui-text-primary) 14%, transparent);
  }

  .review {
    border: 1px solid color-mix(in srgb, var(--color-danger) 22%, var(--ui-border-subtle) 78%);
    border-radius: var(--ui-radius-sm);
    background: color-mix(in srgb, var(--color-danger) 4%, var(--card) 96%);
    padding: 1rem;
    display: grid;
    gap: 0.6rem;
    font-size: var(--font-size-sm);
  }

  .review-correct {
    border-color: color-mix(in srgb, var(--color-success) 22%, var(--ui-border-subtle) 78%);
    background: color-mix(in srgb, var(--color-success) 4%, var(--card) 96%);
  }

  .review-question {
    color: var(--color-text-primary);
    font-weight: 600;
    line-height: 1.5;
  }

  .error {
    color: var(--color-danger);
    border: 1px solid color-mix(in srgb, var(--color-danger) 28%, transparent);
    border-radius: var(--ui-radius-sm);
    background: color-mix(in srgb, var(--color-danger) 10%, transparent);
    padding: 0.5rem 0.62rem;
    font-size: var(--font-size-xs);
  }

  @media (max-width: 640px) {
    .activity-content-head {
      flex-direction: column;
      gap: var(--ui-space-3);
    }

    .activity-content-head__actions {
      width: 100%;
    }

    :global(.summary-regenerate-button.ui-button) {
      width: 100%;
    }

    .exam-progress__meta {
      font-size: 0.78rem;
    }

    .exam-nav {
      gap: 0.65rem;
    }

    .exam-question-card__prompt {
      font-size: 1rem;
    }

    .launch-metrics {
      grid-template-columns: 1fr;
    }

    .session-chrome-progress {
      width: min(100%, 11rem);
    }

    .session-chrome-status {
      gap: 0.35rem 0.45rem;
      font-size: 0.72rem;
    }

    .session-chrome-status--flashcards {
      gap: 0.35rem;
      flex-wrap: wrap;
      white-space: normal;
    }

    .controls-secondary,
    .row,
    .section-header,
    .review-head {
      align-items: stretch;
    }

    .launch-actions :global(.ui-button),
    .controls :global(.ui-button) {
      width: 100%;
    }

    .study-session__canvas {
      padding-top: 0;
    }

    .study-session__answer-actions {
      display: grid;
      width: 100%;
    }

    .study-session__answer-actions--flashcards {
      gap: 0.75rem;
    }

    .study-session__nav {
      gap: 0.75rem;
    }

    .flashcard-session-footer {
      gap: var(--ui-space-4);
    }

    .study-session__nav :global(.ui-button) {
      min-width: 0;
    }

    :global(.study-session-card--flashcards) {
      gap: 1.25rem;
      padding: 1.25rem;
    }

    :global(.study-session-card--exam) {
      max-height: none;
    }

    :global(.study-session-card--flashcards) h2 {
      font-size: clamp(1.3rem, 1.02rem + 0.75vw, 1.7rem);
    }
  }

</style>
