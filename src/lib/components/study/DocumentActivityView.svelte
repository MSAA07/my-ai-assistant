<script>
  import { onDestroy } from 'svelte';
  import { t } from '../../i18n/t.js';
  import Badge from '../ui/Badge.svelte';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import FieldShell from '../ui/FieldShell.svelte';
  import ProgressBar from '../ui/ProgressBar.svelte';
  import StatusBadge from '../ui/StatusBadge.svelte';
  import GuidedRegenerateModal from '../ui/GuidedRegenerateModal.svelte';
  import DocumentDetailSkeleton from '../ui/DocumentDetailSkeleton.svelte';
  import StudyActivityShell from './StudyActivityShell.svelte';
  import { getDocumentFileTypeLabel } from '../../utils/fileType.js';
  import { readPageCache, writePageCache } from '../../../stores/pageCache.js';
  import {
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

  let regenerateModalOpen = false;
  let regenerateFeatureKey = 'summary';
  let regenerateSubmitting = false;

  let flashcardIndex = 0;
  let revealAnswer = false;
  let flashcardResults = [];
  let flashcardProgressError = '';
  let flashcardProgressBusy = false;
  let flashcardsStarted = false;

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

  $: summaryParagraphs = text(docData?.summary)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  $: flashcards = Array.isArray(docData?.flashcards) ? docData.flashcards : [];
  $: currentFlashcard = flashcards[flashcardIndex] ?? null;
  $: flashcardsCorrect = flashcardResults.filter((result) => result === 'correct').length;
  $: flashcardsIncorrect = flashcardResults.filter((result) => result === 'incorrect').length;
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

  $: showFlashcardsLaunch = mode === 'flashcards' && flashcardsFeature.hasContent && !flashcardsStarted;
  $: showExamLaunch = mode === 'exam' && examFeature.hasContent && examPhase === 'question' && !examStarted;
  $: showFocusedFlashcardsChrome = mode === 'flashcards' && flashcardsFeature.hasContent && flashcardsStarted;
  $: showChromeProgress = showFocusedFlashcardsChrome
    || (mode === 'exam' && examFeature.hasContent && !showExamLaunch);
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
      return flashcardsStarted
        ? flashcardProgressLabel
        : t('document.activity.flashcards.cardCount', { count: flashcards.length });
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
      if (!flashcardsStarted) {
        return modeSubtitle;
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
      flashcardsStarted = false;
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
    regenerateModalOpen = false;
    regenerateFeatureKey = 'summary';
    regenerateSubmitting = false;
    resetFlashcardsState();
    resetExamState();
  }

  function resetFlashcardsState(cardCount = 0) {
    flashcardIndex = 0;
    revealAnswer = false;
    flashcardResults = new Array(Math.max(0, cardCount)).fill(null);
    flashcardProgressError = '';
    flashcardProgressBusy = false;
    flashcardsStarted = false;
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

  function startFlashcards() {
    if (!flashcardsFeature.hasContent) return;
    flashcardsStarted = true;
    flashcardProgressError = '';
  }

  function startExam() {
    if (!examFeature.hasContent || examPhase !== 'question') return;
    examStarted = true;
    examSubmitError = '';
  }

  function previousFlashcard() {
    if (flashcardIndex <= 0) return;
    flashcardIndex -= 1;
    revealAnswer = false;
    flashcardProgressError = '';
  }

  function nextFlashcard() {
    if (flashcardIndex >= flashcards.length - 1) return;
    flashcardIndex += 1;
    revealAnswer = false;
    flashcardProgressError = '';
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
      if (flashcardIndex < flashcards.length - 1) {
        flashcardIndex += 1;
        revealAnswer = false;
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
    if (type === 'mcq' || type === 'multiple_choice') return 'mcq';
    return Array.isArray(question?.options) && question.options.length ? 'mcq' : 'short';
  }

  function questionOptions(question) {
    const options = Array.isArray(question?.options) ? question.options.map((option) => text(option)).filter(Boolean) : [];
    if (options.length) return options;
    if (questionType(question) === 'true_false') return ['True', 'False'];
    return [];
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
    contentWidth="wide"
    chromeVariant={showFocusedFlashcardsChrome ? 'focused-flashcards' : 'default'}
  >
    <div slot="back" class="activity-back">
      <Button
        type="button"
        className={`chrome-back-link ${showFocusedFlashcardsChrome ? 'chrome-back-link--focused' : ''}`}
        variant={showFocusedFlashcardsChrome ? 'ghost' : 'back'}
        size="sm"
        on:click={goBackToHub}
      >
        <span slot="icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M10.75 6.75 5.5 12l5.25 5.25M6.5 12h12" /></svg>
        </span>
        {t('document.activity.backToHub')}
      </Button>
    </div>

    <svelte:fragment slot="chrome-progress">
      <div class="flashcards-chrome-progress">
        <ProgressBar
          value={chromeProgressValue}
          max={chromeProgressMax}
          ariaLabel={chromeProgressLabel}
          className="flashcards-chrome-progress__bar"
        />
      </div>
    </svelte:fragment>

    <svelte:fragment slot="chrome-status">
      <div class="flashcards-chrome-status" aria-label={chromeProgressLabel}>
        <span class="flashcards-chrome-status__metric flashcards-chrome-status__metric--current">
          Card {flashcards.length ? flashcardIndex + 1 : 0} / {flashcards.length}
        </span>
        <span class="flashcards-chrome-status__dot" aria-hidden="true">&bull;</span>
        <span class="flashcards-chrome-status__metric flashcards-chrome-status__metric--correct">
          {t('document.exam.reviewCorrect')} {flashcardsCorrect}
        </span>
        <span class="flashcards-chrome-status__dot" aria-hidden="true">&bull;</span>
        <span class="flashcards-chrome-status__metric flashcards-chrome-status__metric--incorrect">
          {t('document.exam.reviewIncorrect')} {flashcardsIncorrect}
        </span>
      </div>
    </svelte:fragment>

    <svelte:fragment slot="actions">
      {#if activeFeature.hasContent}
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
      {#if summaryFeature.hasContent}
        <Card as="article" class="activity-frame activity-frame--summary" variant="base" padding="lg" border="strong">
          <div class="section-header">
            <div class="section-copy">
              <p class="eyebrow">{title}</p>
              <h2>{t('document.activity.summary.title')}</h2>
            </div>
            {#if summaryFeature.busy}
              <StatusBadge status="processing" label={t('status.processing')} />
            {/if}
          </div>

          <article class="reader">
            {#if summaryParagraphs.length}
              {#each summaryParagraphs as paragraph}
                <p>{paragraph}</p>
              {/each}
            {:else}
              <p>{docData.summary}</p>
            {/if}
          </article>
        </Card>
      {:else}
        <Card as="section" class="activity-launch activity-launch--empty" variant="base" padding="lg" border="dashed">
          <div class="launch-copy">
            <Badge tone="neutral" variant="outline" size="sm" uppercase>{modeLabel}</Badge>
            <p class="eyebrow">{title}</p>
            <h2>{t('document.activity.summary.title')}</h2>
            <p>{summaryFeature.errorMessage || t('document.summary.generatePrompt')}</p>
          </div>
          <div class="launch-actions">
            <Button type="button" variant="primary" on:click={() => queueGeneration(summaryFeature, { regenerate: summaryFeature.shouldRegenerate })} disabled={!summaryFeature.canGenerate}>
              {summaryFeature.busy ? t('document.actions.generating') : t('document.activity.actions.generateSummary')}
            </Button>
          </div>
        </Card>
      {/if}
    {/if}

    {#if mode === 'flashcards'}
      {#if flashcardsFeature.hasContent}
        {#if showFlashcardsLaunch}
          <Card as="section" class="activity-launch" variant="base" padding="lg" border="strong">
            <div class="launch-copy">
              <Badge tone="info" variant="soft" size="sm" uppercase>{t('status.ready')}</Badge>
              <p class="eyebrow">{title}</p>
              <h2>{t('document.hub.features.flashcards')}</h2>
              <p>{modeSubtitle}</p>
            </div>

            <div class="launch-metrics">
              <div class="launch-metric">
                <span class="launch-metric__label">{t('document.activity.flashcards.cardCount', { count: flashcards.length })}</span>
                <strong>{flashcards.length}</strong>
              </div>
              <div class="launch-metric">
                <span class="launch-metric__label">{t('document.exam.reviewCorrect')}</span>
                <strong>{flashcardsCorrect}</strong>
              </div>
              <div class="launch-metric">
                <span class="launch-metric__label">{t('document.exam.reviewIncorrect')}</span>
                <strong>{flashcardsIncorrect}</strong>
              </div>
            </div>

            <div class="launch-actions">
              <Button type="button" variant="primary" on:click={startFlashcards}>{t('document.activity.actions.startFlashcards')}</Button>
            </div>
          </Card>
        {:else}
          <section class="activity-stack flashcards-active" aria-label={modeLabel}>
            <section class="flashcards-focus-canvas">
              <Card
                as="article"
                class={`activity-stage flashcard-stage flashcard-stage--focused ${revealAnswer ? 'flashcard-stage-answer' : ''}`}
                variant="base"
                padding="xl"
                border={revealAnswer ? 'strong' : 'subtle'}
              >
                <div class="flashcard-stage__copy">
                  <p class="card-side">{revealAnswer ? t('document.activity.flashcards.answerLabel') : t('document.activity.flashcards.questionLabel')}</p>
                  <h2>{revealAnswer ? currentFlashcard?.answer : currentFlashcard?.question}</h2>
                  {#if revealAnswer && text(currentFlashcard?.explanation)}
                    <p class="explanation">{currentFlashcard.explanation}</p>
                  {/if}
                </div>
              </Card>

              <div class="flashcards-focus-primary controls controls-primary">
                {#if !revealAnswer}
                  <Button type="button" variant="primary" size="lg" block on:click={() => (revealAnswer = true)}>{t('document.activity.actions.revealAnswer')}</Button>
                {:else}
                  <div class="flashcards-focus-answer-actions">
                    <Button type="button" variant="secondary" size="sm" on:click={() => (revealAnswer = false)}>{t('document.activity.actions.hideAnswer')}</Button>
                    <Button type="button" variant="success" on:click={() => markFlashcard('correct')} disabled={flashcardProgressBusy}>{t('document.activity.actions.markCorrect')}</Button>
                    <Button type="button" variant="danger" on:click={() => markFlashcard('incorrect')} disabled={flashcardProgressBusy}>{t('document.activity.actions.markIncorrect')}</Button>
                  </div>
                {/if}
              </div>

              {#if flashcardProgressError}<p class="error flashcards-focus-error">{flashcardProgressError}</p>{/if}

              <div class="flashcards-focus-nav controls controls-secondary">
                <Button type="button" variant="secondary" size="sm" on:click={previousFlashcard} disabled={flashcardIndex === 0}>{t('document.activity.actions.previous')}</Button>
                <Button type="button" variant="secondary" size="sm" on:click={nextFlashcard} disabled={flashcardIndex >= flashcards.length - 1}>{t('document.activity.actions.next')}</Button>
              </div>
            </section>
          </section>
        {/if}
      {:else}
        <Card as="section" class="activity-launch activity-launch--empty" variant="base" padding="lg" border="dashed">
          <div class="launch-copy">
            <Badge tone="neutral" variant="outline" size="sm" uppercase>{modeLabel}</Badge>
            <p class="eyebrow">{title}</p>
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
      {#if examFeature.hasContent}
        {#if examPhase === 'submitting'}
          <Card as="article" class="activity-launch activity-launch--submitting" variant="base" padding="lg" border="strong">
            <div class="launch-copy">
              <Badge tone="info" variant="soft" size="sm" uppercase>{t('status.processing')}</Badge>
              <p class="eyebrow">{title}</p>
              <h2>{t('document.activity.exam.submittingTitle')}</h2>
              <p>{t('document.activity.exam.submittingBody')}</p>
            </div>
          </Card>
        {:else if examPhase === 'result'}
          <Card as="article" class="activity-frame activity-frame--results" variant="base" padding="lg" border="strong">
            <div class="results-summary">
              <Badge tone={examScore === examQuestions.length ? 'success' : examScore > 0 ? 'info' : 'destructive'} variant="soft" size="sm" uppercase>{t('document.activity.exam.resultsTitle')}</Badge>
              <p class="eyebrow">{title}</p>
              <h2>{t('document.activity.exam.scoreLabel', { score: examScore, total: examQuestions.length })}</h2>
              <p>{t('document.activity.exam.reviewTitle')}</p>
            </div>

            {#if examSubmitError}<p class="error">{examSubmitError}</p>{/if}

            <div class="stack stack-spacious">
              {#each examQuestions as question, index}
                <article class="review" class:review-correct={isAnswerCorrect(question, examAnswers[index])}>
                  <div class="review-head">
                    <p class="review-question">{question.question}</p>
                    <Badge tone={isAnswerCorrect(question, examAnswers[index]) ? 'success' : 'destructive'} variant="soft" size="sm">
                      {isAnswerCorrect(question, examAnswers[index]) ? t('document.exam.reviewCorrect') : t('document.exam.reviewIncorrect')}
                    </Badge>
                  </div>
                  <p>{t('document.activity.exam.yourAnswer', { answer: text(examAnswers[index]) || t('document.activity.exam.notAnswered') })}</p>
                  <p>{t('document.activity.exam.correctAnswer', { answer: text(question?.correctAnswer) })}</p>
                </article>
              {/each}
            </div>

            <div class="launch-actions">
              <Button type="button" variant="primary" on:click={() => resetExamState(examQuestions.length)}>{t('document.activity.actions.retakeExam')}</Button>
            </div>
          </Card>
        {:else if showExamLaunch}
          <Card as="section" class="activity-launch" variant="base" padding="lg" border="strong">
            <div class="launch-copy">
              <Badge tone="info" variant="soft" size="sm" uppercase>{t('status.ready')}</Badge>
              <p class="eyebrow">{title}</p>
              <h2>{t('document.activity.exam.introTitle')}</h2>
              <p>{t('document.activity.exam.introDescription', { count: examQuestions.length })}</p>
            </div>

            <div class="launch-metrics">
              <div class="launch-metric">
                <span class="launch-metric__label">{t('document.exam.questionCount', { count: examQuestions.length })}</span>
                <strong>{examQuestions.length}</strong>
              </div>
              <div class="launch-metric">
                <span class="launch-metric__label">{t('document.activity.exam.answeredCount', { answered: examAnsweredCount, total: examQuestions.length })}</span>
                <strong>{examAnsweredCount}</strong>
              </div>
            </div>

            <div class="launch-actions">
              <Button type="button" variant="primary" on:click={startExam}>{t('document.activity.actions.startExam')}</Button>
            </div>
          </Card>
        {:else}
          <Card as="section" class="activity-frame activity-frame--exam" variant="base" padding="lg" border="strong">
            <div class="section-header section-header-study">
              <div class="section-copy">
                <p class="eyebrow">{title}</p>
                <h2>{currentExamQuestion?.question}</h2>
                <p class="progress-text">{examProgressLabel} · {t('document.activity.exam.answeredCount', { answered: examAnsweredCount, total: examQuestions.length })}</p>
              </div>
            </div>

            <Card as="article" class="activity-stage question-surface" variant="raised" padding="lg" border="subtle">
              {#if questionOptions(currentExamQuestion).length > 0}
                <div class="stack stack-spacious">
                  {#each questionOptions(currentExamQuestion) as option, optionIndex}
                    <button type="button" class="option" class:option-selected={text(examAnswers[currentQuestionIndex]) === option} on:click={() => setExamAnswer(option)}>
                      <span class="option-letter">{optionLetter(optionIndex)}</span>
                      <span>{option}</span>
                    </button>
                  {/each}
                </div>
              {:else}
                <FieldShell class="answer-input-shell">
                  <input class="answer-input" type="text" value={examAnswers[currentQuestionIndex] || ''} placeholder={t('document.exam.inputPlaceholder')} on:input={(event) => setExamAnswer(event.currentTarget.value)} />
                </FieldShell>
              {/if}
            </Card>

            <div class="controls controls-secondary">
              <Button type="button" variant="secondary" on:click={previousQuestion} disabled={currentQuestionIndex === 0}>{t('document.activity.actions.previous')}</Button>
              {#if currentQuestionIndex < examQuestions.length - 1}
                <Button type="button" variant="secondary" on:click={nextQuestion}>{t('document.activity.actions.next')}</Button>
              {:else}
                <Button type="button" variant="primary" on:click={submitExam} disabled={examSubmitting}>{t('document.activity.actions.submitExam')}</Button>
              {/if}
            </div>
          </Card>
        {/if}
      {:else}
        <Card as="section" class="activity-launch activity-launch--empty" variant="base" padding="lg" border="dashed">
          <div class="launch-copy">
            <Badge tone="neutral" variant="outline" size="sm" uppercase>{modeLabel}</Badge>
            <p class="eyebrow">{title}</p>
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

  :global(.chrome-back-link) {
    width: fit-content;
    border-color: color-mix(in srgb, var(--ui-border-default) 80%, transparent);
    background: color-mix(in srgb, var(--ui-surface-card) 88%, transparent);
    backdrop-filter: blur(10px);
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
  .results-summary,
  .launch-copy {
    display: grid;
    gap: 0.5rem;
  }

  .progress-text,
  .error,
  .review p,
  .launch-copy p {
    margin: 0;
  }

  .progress-text,
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
    gap: 1rem;
  }

  :global(.status-panel),
  :global(.activity-frame),
  :global(.activity-launch) {
    width: min(100%, var(--size-page-study-wide));
    margin-inline: auto;
  }

  :global(.activity-panel-error) {
    border-color: color-mix(in srgb, var(--color-danger) 35%, var(--color-border) 65%);
  }

  :global(.activity-launch) {
    min-height: clamp(280px, 44vh, 380px);
    align-content: space-between;
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-surface-card) 100%, transparent), color-mix(in srgb, var(--ui-surface-card) 86%, var(--ui-surface-secondary) 14%));
  }

  :global(.activity-launch--empty) {
    min-height: 18rem;
    background: color-mix(in srgb, var(--ui-surface-card) 96%, transparent);
  }

  :global(.activity-launch--submitting),
  :global(.activity-frame--results) {
    max-width: var(--size-page-readable);
  }

  :global(.activity-frame--summary) {
    min-height: min(72vh, 780px);
  }

  :global(.activity-frame--flashcards) {
    max-width: var(--size-page-study-compact);
  }

  :global(.activity-frame--exam) {
    max-width: var(--size-page-study-wide);
  }

  .activity-stack,
  .flashcards-active {
    display: grid;
    gap: 1rem;
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

  .section-copy h2,
  .results-summary h2,
  .launch-copy h2,
  :global(.flashcard-stage) h2 {
    font-size: clamp(1.15rem, 2vw, 1.6rem);
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .reader {
    display: grid;
    gap: 1.25rem;
  }

  .reader p {
    line-height: 1.8;
    white-space: pre-wrap;
    color: color-mix(in srgb, var(--foreground) 86%, var(--muted-foreground) 14%);
    font-size: clamp(0.98rem, 1vw, 1.03rem);
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

  .launch-metric strong {
    font-size: clamp(1.1rem, 1rem + 0.45vw, 1.45rem);
    line-height: 1;
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

  .flashcards-chrome-progress {
    width: min(100%, 13rem);
  }

  :global(.flashcards-chrome-progress__bar) {
    height: 0.38rem;
    background: color-mix(in srgb, var(--ui-progress-track) 82%, transparent);
  }

  .flashcards-chrome-status {
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

  .flashcards-chrome-status__metric--current {
    color: var(--ui-text-primary);
  }

  .flashcards-chrome-status__metric--correct {
    color: var(--ui-accent-success);
  }

  .flashcards-chrome-status__metric--incorrect {
    color: var(--ui-accent-danger);
  }

  .flashcards-chrome-status__dot {
    color: var(--ui-text-muted);
  }

  :global(.chrome-back-link--focused) {
    padding-inline: var(--ui-space-1);
  }

  :global(.flashcard-stage) {
    display: grid;
    place-items: center;
    min-height: clamp(320px, 48vh, 460px);
    text-align: center;
  }

  .flashcard-stage__copy {
    display: grid;
    gap: 0.85rem;
    justify-items: center;
  }

  :global(.flashcard-stage) h2 {
    max-width: 34rem;
    text-wrap: balance;
  }

  :global(.flashcard-stage-answer) {
    border-color: var(--ui-border-strong);
  }

  .explanation {
    color: var(--color-text-secondary);
    line-height: 1.6;
    font-size: var(--font-size-sm);
    max-width: 34rem;
  }

  .controls {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .controls-primary {
    justify-content: center;
  }

  .controls-secondary {
    justify-content: space-between;
    align-items: center;
  }

  .flashcards-focus-canvas {
    width: min(100%, var(--size-page-study-compact));
    margin-inline: auto;
    min-height: clamp(30rem, calc(100vh - 11rem), 42rem);
    display: grid;
    align-content: center;
    justify-items: center;
    gap: clamp(0.9rem, 0.75rem + 0.9vw, 1.35rem);
    padding-block: clamp(1rem, 3vh, 2rem) clamp(1.25rem, 4vh, 2.5rem);
  }

  .flashcards-focus-primary,
  .flashcards-focus-nav,
  .flashcards-focus-error {
    width: min(100%, 44rem);
  }

  .flashcards-focus-primary {
    justify-content: center;
  }

  .flashcards-focus-answer-actions {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .flashcards-focus-nav :global(.ui-button) {
    min-width: 7.5rem;
  }

  :global(.flashcard-stage--focused) {
    width: min(100%, 44rem);
    min-height: clamp(11.5rem, 18vh, 15rem);
    background: color-mix(in srgb, var(--ui-surface-card) 96%, transparent);
    box-shadow: none;
  }

  :global(.flashcard-stage--focused) .flashcard-stage__copy {
    width: min(100%, 38rem);
    gap: var(--ui-space-4);
    justify-items: start;
    text-align: left;
  }

  :global(.flashcard-stage--focused) h2 {
    max-width: none;
    font-size: clamp(1.7rem, 1.35rem + 1vw, 2.15rem);
    line-height: 1.3;
  }

  :global(.flashcard-stage--focused) .explanation {
    max-width: 34rem;
  }

  :global(.question-surface) {
    gap: 1rem;
  }

  .results-summary h2 {
    font-size: clamp(1.35rem, 2vw, 1.85rem);
  }

  .results-summary p {
    color: var(--muted-foreground);
  }

  .stack {
    display: grid;
    gap: 0.75rem;
  }

  .stack-spacious {
    gap: 0.9rem;
  }

  .option {
    border: 1px solid color-mix(in srgb, var(--foreground) 8%, var(--border) 92%);
    border-radius: 1rem;
    background: color-mix(in srgb, var(--card) 72%, var(--muted) 28%);
    color: var(--color-text-primary);
    min-height: 4rem;
    padding: 0.9rem 1rem;
    display: flex;
    gap: 0.85rem;
    align-items: start;
    cursor: pointer;
    text-align: left;
    font: inherit;
    font-size: var(--font-size-sm);
    box-shadow: var(--shadow-inline-control);
    transition: border-color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard);
  }

  .option:hover {
    border-color: var(--ui-border-strong);
    background: color-mix(in srgb, var(--card) 56%, var(--muted) 44%);
    box-shadow: var(--shadow-card);
  }

  .option-selected {
    border-color: color-mix(in srgb, var(--foreground) 22%, var(--border) 78%);
    background: color-mix(in srgb, var(--foreground) 6%, var(--muted) 94%);
  }

  .option:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring);
  }

  .option-letter {
    width: 1.8rem;
    height: 1.8rem;
    flex: 0 0 auto;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    display: grid;
    place-items: center;
    font-size: 0.67rem;
    font-weight: 600;
    background: color-mix(in srgb, var(--background) 75%, var(--muted) 25%);
  }

  :global(.answer-input-shell) {
    margin-top: 0;
  }

  .answer-input {
    width: 100%;
    min-height: 3rem;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--color-text-primary);
    font: inherit;
    font-size: 1rem;
  }

  .review {
    border: 1px solid color-mix(in srgb, var(--color-danger) 24%, var(--ui-border-subtle) 76%);
    border-radius: 1rem;
    background: color-mix(in srgb, var(--color-danger) 8%, var(--card) 92%);
    padding: 1rem 1.1rem;
    display: grid;
    gap: 0.5rem;
    font-size: var(--font-size-sm);
  }

  .review-correct {
    border-color: color-mix(in srgb, var(--color-success) 24%, var(--ui-border-subtle) 76%);
    background: color-mix(in srgb, var(--color-success) 8%, var(--card) 92%);
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
    .launch-metrics {
      grid-template-columns: 1fr;
    }

    .flashcards-chrome-progress {
      width: min(100%, 11rem);
    }

    .flashcards-chrome-status {
      gap: 0.35rem 0.45rem;
      font-size: 0.72rem;
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

    .flashcards-focus-canvas {
      min-height: auto;
      padding-top: 0.5rem;
    }

    .flashcards-focus-answer-actions {
      display: grid;
      width: 100%;
    }

    .flashcards-focus-nav {
      gap: 0.75rem;
    }

    .flashcards-focus-nav :global(.ui-button) {
      min-width: 0;
    }

    :global(.flashcard-stage) {
      min-height: 260px;
    }

    :global(.flashcard-stage--focused) {
      min-height: 14rem;
    }

    :global(.flashcard-stage--focused) h2 {
      font-size: clamp(1.35rem, 1.1rem + 1vw, 1.75rem);
    }
  }
</style>
