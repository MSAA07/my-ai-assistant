<script>
  import { onDestroy } from 'svelte';
  import { t } from '../lib/i18n/t.js';
  import Button from '../lib/components/ui/Button.svelte';
  import Card from '../lib/components/ui/Card.svelte';
  import FieldShell from '../lib/components/ui/FieldShell.svelte';
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';
  import GuidedRegenerateModal from '../lib/components/ui/GuidedRegenerateModal.svelte';
  import DocumentDetailSkeleton from '../lib/components/ui/DocumentDetailSkeleton.svelte';
  import { readPageCache, writePageCache } from '../stores/pageCache.js';
  import {
    getDocument,
    requestGeneration,
    saveLegacyExamAttempt,
    saveFlashcardProgress,
  } from '../lib/api/studyHub.js';

  const POLL_INTERVAL_MS = 2500;
  const DOCUMENT_CACHE_KEY = (id) => `page:document-view:${id}`;
  const FEATURES = ['summary', 'flashcards', 'exam'];
  const BASE_OPTIONS = {
    summary: { length: 'medium' },
    flashcards: { includeExplanations: false },
    exam: { questionCount: 10 },
  };

  export let documentId = '';
  export let documentSection = 'summary';

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

  let examPhase = 'intro';
  let currentQuestionIndex = 0;
  let examAnswers = [];
  let examScore = 0;
  let examSubmitting = false;
  let examSubmitError = '';

  $: mode = normalizeMode(documentSection);
  $: activeFeatureKey = mode === 'flashcards' ? 'flashcards' : mode === 'exam' ? 'exam' : 'summary';
  $: extractionStatus = normalizeDocumentStatus(docData?.processingStatus);
  $: showProcessingBanner = Boolean(docData) && (isExtractionActive(extractionStatus) || hasActiveGeneration(docData, pendingGeneration));
  $: title = text(docData?.originalName) || text(docData?.title) || t('document.hub.untitled');

  $: summaryFeature = featureState('summary', { document: docData, extractionStatus, pendingGeneration, generationErrors });
  $: flashcardsFeature = featureState('flashcards', { document: docData, extractionStatus, pendingGeneration, generationErrors });
  $: examFeature = featureState('exam', { document: docData, extractionStatus, pendingGeneration, generationErrors });
  $: activeFeature = activeFeatureKey === 'summary' ? summaryFeature : activeFeatureKey === 'flashcards' ? flashcardsFeature : examFeature;

  $: flashcards = Array.isArray(docData?.flashcards) ? docData.flashcards : [];
  $: currentFlashcard = flashcards[flashcardIndex] ?? null;
  $: flashcardsCorrect = flashcardResults.filter((result) => result === 'correct').length;
  $: flashcardsIncorrect = flashcardResults.filter((result) => result === 'incorrect').length;

  $: examQuestions = Array.isArray(docData?.examQuestions) ? docData.examQuestions : [];
  $: currentExamQuestion = examQuestions[currentQuestionIndex] ?? null;
  $: examAnsweredCount = examAnswers.filter((answer) => text(answer)).length;

  $: regenerationReasonOptions = [
    { value: 'missing_parts', label: t('document.activity.regenerate.reasons.missingParts') },
    { value: 'not_comprehensive_enough', label: t('document.activity.regenerate.reasons.notComprehensiveEnough') },
    { value: 'too_short', label: t('document.activity.regenerate.reasons.tooShort') },
    { value: 'too_generic', label: t('document.activity.regenerate.reasons.tooGeneric') },
  ];

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
    flashcardIndex = 0;
    revealAnswer = false;
    flashcardResults = [];
    flashcardProgressError = '';
    flashcardProgressBusy = false;
    resetExamState(0);
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
      flashcardIndex = 0;
      revealAnswer = false;
      flashcardResults = new Array(nextFlashcards.length).fill(null);
      flashcardProgressError = '';
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
    examPhase = 'intro';
    currentQuestionIndex = 0;
    examAnswers = Array.from({ length: Math.max(0, questionCount) }, () => '');
    examScore = 0;
    examSubmitting = false;
    examSubmitError = '';
  }

  function startExam() {
    if (!examQuestions.length) return;
    examPhase = 'question';
    currentQuestionIndex = 0;
    if (examAnswers.length !== examQuestions.length) {
      examAnswers = Array.from({ length: examQuestions.length }, () => '');
    }
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
</script>

{#if loading && !docData}
  <DocumentDetailSkeleton />
{:else if !docData}
  <Card as="section" class="activity-panel activity-panel-error" variant="base" padding="md" border="strong">
    <h2>{t('document.processingFailedTitle')}</h2>
    <p>{pageError || t('document.notFound')}</p>
    <Button type="button" variant="secondary" on:click={goBackToHub}>{t('document.activity.backToHub')}</Button>
  </Card>
{:else}
  <div class="activity mode-{mode}">
    <header class="activity-header">
      <Button type="button" class="activity-back-link" variant="ghost" size="sm" on:click={goBackToHub}>{t('document.activity.backToHub')}</Button>
      <div>
        <p class="eyebrow">{mode === 'summary' ? t('document.activity.section.summary') : mode === 'flashcards' ? t('document.activity.section.flashcards') : t('document.activity.section.exam')}</p>
        <h1>{title}</h1>
        <p class="sub">{mode === 'summary' ? t('document.activity.subtitle.summary') : mode === 'flashcards' ? t('document.activity.subtitle.flashcards') : t('document.activity.subtitle.exam')}</p>
      </div>
      {#if activeFeature.hasContent}
        <Button type="button" variant="secondary" on:click={() => openRegenerateModal(activeFeature)} disabled={!activeFeature.canRegenerate}>
          {activeFeature.busy ? t('document.activity.regenerate.running') : t('document.actions.regenerate')}
        </Button>
      {/if}
    </header>

    {#if extractionStatus === 'failed'}
      <Card as="section" class="activity-panel activity-panel-error" variant="base" padding="md" border="strong">
        <div class="row">
          <h2>{t('document.processingFailedTitle')}</h2>
          <StatusBadge status="failed" label={t('status.failed')} />
        </div>
        <p>{text(docData?.processingError) || t('document.processingFailed')}</p>
      </Card>
    {:else if showProcessingBanner}
      <Card as="section" class="activity-panel" variant="base" padding="md">
        <div class="row">
          <h2>{isExtractionActive(extractionStatus) ? t('document.activity.states.extractionProcessing') : t('document.activity.states.generationProcessing')}</h2>
          <StatusBadge status="processing" label={t('status.processing')} />
        </div>
        <p>{t('document.activity.states.processingContinues')}</p>
      </Card>
    {/if}

    {#if mode === 'summary'}
      <Card as="section" class="activity-surface" variant="base" padding="md">
        {#if summaryFeature.hasContent}
          <article class="reader">
            <h2>{t('document.activity.summary.title')}</h2>
            <p>{docData.summary}</p>
          </article>
          {#if summaryFeature.busy}
            <p class="note">{t('document.activity.summary.regenerating')}</p>
          {/if}
        {:else}
          <div class="empty">
            <p>{summaryFeature.errorMessage || t('document.summary.generatePrompt')}</p>
            <Button type="button" variant="primary" on:click={() => queueGeneration(summaryFeature, { regenerate: summaryFeature.shouldRegenerate })} disabled={!summaryFeature.canGenerate}>
              {summaryFeature.busy ? t('document.actions.generating') : t('document.activity.actions.generateSummary')}
            </Button>
          </div>
        {/if}
      </Card>
    {/if}

    {#if mode === 'flashcards'}
      <Card as="section" class="activity-surface" variant="base" padding="md">
        {#if flashcardsFeature.hasContent}
          <p class="progress">{t('document.activity.flashcards.progressLabel', { current: flashcardIndex + 1, total: flashcards.length, correct: flashcardsCorrect, incorrect: flashcardsIncorrect })}</p>
          <Card as="article" class={`flashcard-panel ${revealAnswer ? 'flashcard-panel-answer' : ''}`} variant="soft" padding="md">
            <p class="card-side">{revealAnswer ? t('document.activity.flashcards.answerLabel') : t('document.activity.flashcards.questionLabel')}</p>
            <h2>{revealAnswer ? currentFlashcard?.answer : currentFlashcard?.question}</h2>
            {#if revealAnswer && text(currentFlashcard?.explanation)}
              <p class="explanation">{currentFlashcard.explanation}</p>
            {/if}
          </Card>
          <div class="controls">
            {#if !revealAnswer}
              <Button type="button" variant="primary" on:click={() => (revealAnswer = true)}>{t('document.activity.actions.revealAnswer')}</Button>
            {:else}
              <Button type="button" variant="secondary" on:click={() => (revealAnswer = false)}>{t('document.activity.actions.hideAnswer')}</Button>
              <Button type="button" variant="success" on:click={() => markFlashcard('correct')} disabled={flashcardProgressBusy}>{t('document.activity.actions.markCorrect')}</Button>
              <Button type="button" variant="danger" on:click={() => markFlashcard('incorrect')} disabled={flashcardProgressBusy}>{t('document.activity.actions.markIncorrect')}</Button>
            {/if}
          </div>
          {#if flashcardProgressError}<p class="error">{flashcardProgressError}</p>{/if}
          <div class="controls">
            <Button type="button" variant="secondary" on:click={previousFlashcard} disabled={flashcardIndex === 0}>{t('document.activity.actions.previous')}</Button>
            <Button type="button" variant="secondary" on:click={nextFlashcard} disabled={flashcardIndex >= flashcards.length - 1}>{t('document.activity.actions.next')}</Button>
          </div>
        {:else}
          <div class="empty">
            <p>{flashcardsFeature.errorMessage || t('document.flashcards.generatePrompt')}</p>
            <Button type="button" variant="primary" on:click={() => queueGeneration(flashcardsFeature, { regenerate: flashcardsFeature.shouldRegenerate })} disabled={!flashcardsFeature.canGenerate}>
              {flashcardsFeature.busy ? t('document.actions.generating') : t('document.activity.actions.generateFlashcards')}
            </Button>
          </div>
        {/if}
      </Card>
    {/if}

    {#if mode === 'exam'}
      <Card as="section" class="activity-surface" variant="base" padding="md">
        {#if examFeature.hasContent}
          {#if examPhase === 'intro'}
            <Card as="article" class="activity-panel exam-intro" variant="soft" padding="md">
              <h2>{t('document.activity.exam.introTitle')}</h2>
              <p>{t('document.activity.exam.introDescription', { count: examQuestions.length })}</p>
              <Button type="button" variant="primary" on:click={startExam}>{t('document.activity.actions.startExam')}</Button>
            </Card>
          {:else if examPhase === 'question'}
            <p class="progress">{t('document.exam.progress', { current: currentQuestionIndex + 1, total: examQuestions.length })} · {t('document.activity.exam.answeredCount', { answered: examAnsweredCount, total: examQuestions.length })}</p>
            <Card as="article" class="activity-panel question" variant="soft" padding="md">
              <p class="eyebrow">{t('document.activity.exam.questionLabel', { index: currentQuestionIndex + 1 })}</p>
              <h2>{currentExamQuestion?.question}</h2>
              {#if questionOptions(currentExamQuestion).length > 0}
                <div class="stack">
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
            <div class="controls">
              <Button type="button" variant="secondary" on:click={previousQuestion} disabled={currentQuestionIndex === 0}>{t('document.activity.actions.previous')}</Button>
              {#if currentQuestionIndex < examQuestions.length - 1}
                <Button type="button" variant="secondary" on:click={nextQuestion}>{t('document.activity.actions.next')}</Button>
              {:else}
                <Button type="button" variant="primary" on:click={submitExam} disabled={examSubmitting}>{t('document.activity.actions.submitExam')}</Button>
              {/if}
            </div>
          {:else if examPhase === 'submitting'}
            <Card as="article" class="activity-panel exam-intro" variant="soft" padding="md">
              <h2>{t('document.activity.exam.submittingTitle')}</h2>
              <p>{t('document.activity.exam.submittingBody')}</p>
            </Card>
          {:else}
            <Card as="article" class="activity-panel" variant="soft" padding="md">
              <h2>{t('document.activity.exam.resultsTitle')}</h2>
              <p>{t('document.activity.exam.scoreLabel', { score: examScore, total: examQuestions.length })}</p>
              {#if examSubmitError}<p class="error">{examSubmitError}</p>{/if}
              <h3>{t('document.activity.exam.reviewTitle')}</h3>
              <div class="stack">
                {#each examQuestions as question, index}
                  <article class="review" class:review-correct={isAnswerCorrect(question, examAnswers[index])}>
                    <p class="review-question">{question.question}</p>
                    <p>{t('document.activity.exam.yourAnswer', { answer: text(examAnswers[index]) || t('document.activity.exam.notAnswered') })}</p>
                    <p>{t('document.activity.exam.correctAnswer', { answer: text(question?.correctAnswer) })}</p>
                  </article>
                {/each}
              </div>
              <Button type="button" variant="primary" on:click={() => resetExamState(examQuestions.length)}>{t('document.activity.actions.retakeExam')}</Button>
            </Card>
          {/if}
        {:else}
          <div class="empty">
            <p>{examFeature.errorMessage || t('document.exam.generatePrompt')}</p>
            <Button type="button" variant="primary" on:click={() => queueGeneration(examFeature, { regenerate: examFeature.shouldRegenerate })} disabled={!examFeature.canGenerate}>
              {examFeature.busy ? t('document.actions.generating') : t('document.activity.actions.generateExam')}
            </Button>
          </div>
        {/if}
      </Card>
    {/if}
  </div>
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
  .activity {
    display: grid;
    gap: var(--space-3);
  }

  .activity-header {
    display: grid;
    gap: var(--space-2);
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
  }

  .activity :global(.activity-back-link) {
    grid-column: 1 / -1;
    color: var(--color-text-secondary);
    min-height: 0;
    padding-inline: 0;
    text-decoration: none;
  }

  .activity :global(.activity-back-link:hover) {
    color: var(--color-text-primary);
  }

  .eyebrow {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.67rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    font-weight: 600;
  }

  h1,
  h2,
  h3,
  p {
    margin: 0;
  }

  .activity-header h1 {
    font-size: clamp(1.18rem, 2.5vw, 1.5rem);
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: -0.03em;
  }

  .activity-header h2 {
    font-size: 0.95rem;
    font-weight: 600;
  }

  .sub {
    color: var(--color-text-secondary);
    margin-top: 0.2rem;
    font-size: var(--font-size-sm);
  }

  :global(.activity-panel),
  :global(.activity-surface) {
    display: grid;
    gap: 0.75rem;
  }

  :global(.activity-surface) {
    gap: var(--space-3);
  }

  :global(.activity-panel-error) {
    border-color: color-mix(in srgb, var(--color-danger) 35%, var(--color-border) 65%);
  }

  .row {
    display: flex;
    justify-content: space-between;
    gap: var(--space-2);
    align-items: start;
    flex-wrap: wrap;
  }

  .reader p {
    line-height: 1.55;
    white-space: pre-wrap;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .empty {
    display: grid;
    gap: var(--space-2);
    min-height: 140px;
    align-content: center;
    border: 1px dashed var(--ui-border-subtle);
    border-radius: var(--ui-radius-md);
    padding: var(--space-3);
    background: color-mix(in srgb, var(--ui-surface-base) 96%, transparent);
  }

  .progress {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .note {
    color: color-mix(in srgb, var(--color-info) 68%, var(--color-text-secondary) 32%);
    font-size: var(--font-size-xs);
  }

  .error {
    margin: 0;
    color: var(--color-danger);
    border: 1px solid color-mix(in srgb, var(--color-danger) 28%, transparent);
    border-radius: var(--ui-radius-sm);
    background: color-mix(in srgb, var(--color-danger) 10%, transparent);
    padding: 0.5rem 0.62rem;
    font-size: var(--font-size-xs);
  }

  :global(.flashcard-panel) {
    display: grid;
    gap: var(--space-2);
    min-height: 180px;
    align-content: center;
  }

  :global(.flashcard-panel-answer) {
    border-color: var(--ui-border-strong);
  }

  .card-side {
    font-size: 0.67rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-muted);
    font-weight: 600;
  }

  .explanation {
    color: var(--color-text-secondary);
    line-height: 1.45;
    font-size: var(--font-size-sm);
  }

  .controls {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .stack {
    display: grid;
    gap: 0.4rem;
  }

  .option {
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-sm);
    background: var(--ui-surface-base);
    color: var(--color-text-primary);
    min-height: var(--ui-control-height-md);
    padding: 0.45rem 0.58rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    cursor: pointer;
    text-align: left;
    font: inherit;
    font-size: var(--font-size-sm);
    transition: border-color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .option:hover {
    border-color: var(--ui-border-strong);
    background: color-mix(in srgb, var(--ui-surface-raised) 82%, transparent);
  }

  .option-selected {
    border-color: var(--ui-border-accent);
    background: rgba(255, 255, 255, 0.05);
  }

  .option:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring);
  }

  .option-letter {
    width: 1.35rem;
    height: 1.35rem;
    border-radius: var(--ui-radius-sm);
    border: 1px solid var(--ui-border-subtle);
    display: grid;
    place-items: center;
    font-size: 0.67rem;
    font-weight: 600;
  }

  :global(.answer-input-shell) {
    margin-top: var(--space-1);
  }

  .answer-input {
    width: 100%;
    min-height: var(--ui-control-height-md);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--color-text-primary);
    font: inherit;
  }

  .review {
    border: 1px solid color-mix(in srgb, var(--color-danger) 24%, var(--ui-border-subtle) 76%);
    border-radius: var(--ui-radius-sm);
    background: color-mix(in srgb, var(--color-danger) 8%, var(--ui-surface-base) 92%);
    padding: 0.52rem 0.62rem;
    display: grid;
    gap: 0.25rem;
    font-size: var(--font-size-sm);
  }

  .review-correct {
    border-color: color-mix(in srgb, var(--color-success) 24%, var(--ui-border-subtle) 76%);
    background: color-mix(in srgb, var(--color-success) 8%, var(--ui-surface-base) 92%);
  }

  .review-question {
    color: var(--color-text-primary);
    font-weight: 600;
  }

  @media (max-width: 900px) {
    .activity-header {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .controls :global(.ui-button) {
      width: 100%;
    }
  }
</style>
