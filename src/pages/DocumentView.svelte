<script>
  import { onDestroy } from 'svelte';
  import { t } from '../lib/i18n/t.js';
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';
  import GuidedRegenerateModal from '../lib/components/ui/GuidedRegenerateModal.svelte';
  import {
    getDocument,
    requestGeneration,
    saveLegacyExamAttempt,
    saveFlashcardProgress,
  } from '../lib/api/studyHub.js';

  const POLL_INTERVAL_MS = 2500;
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
  $: showProcessingBanner = Boolean(docData) && (isExtractionActive(extractionStatus) || hasActiveGeneration(docData));
  $: title = text(docData?.originalName) || text(docData?.title) || t('document.hub.untitled');

  $: summaryFeature = featureState('summary');
  $: flashcardsFeature = featureState('flashcards');
  $: examFeature = featureState('exam');
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
    void fetchDocumentState();
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

  function hasFeatureContent(featureKey, document = docData) {
    if (featureKey === 'summary') return Boolean(text(document?.summary));
    if (featureKey === 'flashcards') return Array.isArray(document?.flashcards) && document.flashcards.length > 0;
    return Array.isArray(document?.examQuestions) && document.examQuestions.length > 0;
  }

  function hasActiveGeneration(document = docData) {
    return FEATURES.some((featureKey) => {
      const status = normalizeGenerationStatus(document?.generationState?.[featureKey]?.status);
      return isGenerationActive(status) || pendingGeneration[featureKey];
    });
  }

  function featureState(featureKey) {
    const generation = docData?.generationState?.[featureKey] ?? {};
    const status = normalizeGenerationStatus(generation?.status);
    const hasContent = hasFeatureContent(featureKey);
    const busy = Boolean(pendingGeneration[featureKey]) || isGenerationActive(status);
    const errorMessage = text(generationErrors[featureKey]) || text(generation?.errorMessage);
    return {
      key: featureKey,
      status,
      busy,
      hasContent,
      canGenerate: extractionStatus === 'complete' && !busy,
      canRegenerate: extractionStatus === 'complete' && hasContent && !busy,
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
    const target = featureState(regenerateFeatureKey);
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
  <section class="panel">
    <p>{t('document.loading')}</p>
  </section>
{:else if !docData}
  <section class="panel panel-error">
    <h2>{t('document.processingFailedTitle')}</h2>
    <p>{pageError || t('document.notFound')}</p>
    <button type="button" class="btn secondary" on:click={goBackToHub}>{t('document.activity.backToHub')}</button>
  </section>
{:else}
  <div class="activity mode-{mode}">
    <header class="activity-header">
      <button type="button" class="back-link" on:click={goBackToHub}>{t('document.activity.backToHub')}</button>
      <div>
        <p class="eyebrow">{mode === 'summary' ? t('document.activity.section.summary') : mode === 'flashcards' ? t('document.activity.section.flashcards') : t('document.activity.section.exam')}</p>
        <h1>{title}</h1>
        <p class="sub">{mode === 'summary' ? t('document.activity.subtitle.summary') : mode === 'flashcards' ? t('document.activity.subtitle.flashcards') : t('document.activity.subtitle.exam')}</p>
      </div>
      {#if activeFeature.hasContent}
        <button type="button" class="btn secondary" on:click={() => openRegenerateModal(activeFeature)} disabled={!activeFeature.canRegenerate}>
          {activeFeature.busy ? t('document.activity.regenerate.running') : t('document.actions.regenerate')}
        </button>
      {/if}
    </header>

    {#if extractionStatus === 'failed'}
      <section class="panel panel-error">
        <div class="row">
          <h2>{t('document.processingFailedTitle')}</h2>
          <StatusBadge status="failed" label={t('status.failed')} />
        </div>
        <p>{text(docData?.processingError) || t('document.processingFailed')}</p>
      </section>
    {:else if showProcessingBanner}
      <section class="panel">
        <div class="row">
          <h2>{isExtractionActive(extractionStatus) ? t('document.activity.states.extractionProcessing') : t('document.activity.states.generationProcessing')}</h2>
          <StatusBadge status="processing" label={t('status.processing')} />
        </div>
        <p>{t('document.activity.states.processingContinues')}</p>
      </section>
    {/if}

    {#if mode === 'summary'}
      <section class="surface">
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
            <button type="button" class="btn primary" on:click={() => queueGeneration(summaryFeature, { regenerate: summaryFeature.shouldRegenerate })} disabled={!summaryFeature.canGenerate}>
              {summaryFeature.busy ? t('document.actions.generating') : t('document.activity.actions.generateSummary')}
            </button>
          </div>
        {/if}
      </section>
    {/if}

    {#if mode === 'flashcards'}
      <section class="surface">
        {#if flashcardsFeature.hasContent}
          <p class="progress">{t('document.activity.flashcards.progressLabel', { current: flashcardIndex + 1, total: flashcards.length, correct: flashcardsCorrect, incorrect: flashcardsIncorrect })}</p>
          <article class="card" class:card-answer={revealAnswer}>
            <p class="card-side">{revealAnswer ? t('document.activity.flashcards.answerLabel') : t('document.activity.flashcards.questionLabel')}</p>
            <h2>{revealAnswer ? currentFlashcard?.answer : currentFlashcard?.question}</h2>
            {#if revealAnswer && text(currentFlashcard?.explanation)}
              <p class="explanation">{currentFlashcard.explanation}</p>
            {/if}
          </article>
          <div class="controls">
            {#if !revealAnswer}
              <button type="button" class="btn primary" on:click={() => (revealAnswer = true)}>{t('document.activity.actions.revealAnswer')}</button>
            {:else}
              <button type="button" class="btn secondary" on:click={() => (revealAnswer = false)}>{t('document.activity.actions.hideAnswer')}</button>
              <button type="button" class="btn success" on:click={() => markFlashcard('correct')} disabled={flashcardProgressBusy}>{t('document.activity.actions.markCorrect')}</button>
              <button type="button" class="btn danger" on:click={() => markFlashcard('incorrect')} disabled={flashcardProgressBusy}>{t('document.activity.actions.markIncorrect')}</button>
            {/if}
          </div>
          {#if flashcardProgressError}<p class="error">{flashcardProgressError}</p>{/if}
          <div class="controls">
            <button type="button" class="btn secondary" on:click={previousFlashcard} disabled={flashcardIndex === 0}>{t('document.activity.actions.previous')}</button>
            <button type="button" class="btn secondary" on:click={nextFlashcard} disabled={flashcardIndex >= flashcards.length - 1}>{t('document.activity.actions.next')}</button>
          </div>
        {:else}
          <div class="empty">
            <p>{flashcardsFeature.errorMessage || t('document.flashcards.generatePrompt')}</p>
            <button type="button" class="btn primary" on:click={() => queueGeneration(flashcardsFeature, { regenerate: flashcardsFeature.shouldRegenerate })} disabled={!flashcardsFeature.canGenerate}>
              {flashcardsFeature.busy ? t('document.actions.generating') : t('document.activity.actions.generateFlashcards')}
            </button>
          </div>
        {/if}
      </section>
    {/if}

    {#if mode === 'exam'}
      <section class="surface">
        {#if examFeature.hasContent}
          {#if examPhase === 'intro'}
            <article class="panel exam-intro">
              <h2>{t('document.activity.exam.introTitle')}</h2>
              <p>{t('document.activity.exam.introDescription', { count: examQuestions.length })}</p>
              <button type="button" class="btn primary" on:click={startExam}>{t('document.activity.actions.startExam')}</button>
            </article>
          {:else if examPhase === 'question'}
            <p class="progress">{t('document.exam.progress', { current: currentQuestionIndex + 1, total: examQuestions.length })} · {t('document.activity.exam.answeredCount', { answered: examAnsweredCount, total: examQuestions.length })}</p>
            <article class="panel question">
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
                <input class="answer-input" type="text" value={examAnswers[currentQuestionIndex] || ''} placeholder={t('document.exam.inputPlaceholder')} on:input={(event) => setExamAnswer(event.currentTarget.value)} />
              {/if}
            </article>
            <div class="controls">
              <button type="button" class="btn secondary" on:click={previousQuestion} disabled={currentQuestionIndex === 0}>{t('document.activity.actions.previous')}</button>
              {#if currentQuestionIndex < examQuestions.length - 1}
                <button type="button" class="btn secondary" on:click={nextQuestion}>{t('document.activity.actions.next')}</button>
              {:else}
                <button type="button" class="btn primary" on:click={submitExam} disabled={examSubmitting}>{t('document.activity.actions.submitExam')}</button>
              {/if}
            </div>
          {:else if examPhase === 'submitting'}
            <article class="panel exam-intro">
              <h2>{t('document.activity.exam.submittingTitle')}</h2>
              <p>{t('document.activity.exam.submittingBody')}</p>
            </article>
          {:else}
            <article class="panel">
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
              <button type="button" class="btn primary" on:click={() => resetExamState(examQuestions.length)}>{t('document.activity.actions.retakeExam')}</button>
            </article>
          {/if}
        {:else}
          <div class="empty">
            <p>{examFeature.errorMessage || t('document.exam.generatePrompt')}</p>
            <button type="button" class="btn primary" on:click={() => queueGeneration(examFeature, { regenerate: examFeature.shouldRegenerate })} disabled={!examFeature.canGenerate}>
              {examFeature.busy ? t('document.actions.generating') : t('document.activity.actions.generateExam')}
            </button>
          </div>
        {/if}
      </section>
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
  .activity { display: grid; gap: 1rem; }
  .activity-header { display: grid; gap: 0.75rem; grid-template-columns: auto 1fr auto; align-items: start; }
  .back-link { border: 0; background: transparent; padding: 0; color: var(--color-accent-primary); text-decoration: underline; cursor: pointer; }
  .eyebrow { margin: 0; color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; }
  h1, h2, h3, p { margin: 0; }
  .sub { color: var(--color-text-secondary); margin-top: 0.2rem; }
  .panel, .surface { border: 1px solid var(--color-border); border-radius: var(--radius-2); background: var(--color-surface-1); padding: var(--space-4); display: grid; gap: 0.75rem; }
  .surface { gap: 1rem; }
  .panel-error { border-color: color-mix(in srgb, var(--color-danger) 35%, var(--color-border) 65%); }
  .row { display: flex; justify-content: space-between; gap: 0.5rem; align-items: start; }
  .reader p { line-height: 1.8; white-space: pre-wrap; color: var(--color-text-secondary); }
  .empty { display: grid; gap: 0.75rem; min-height: 160px; align-content: center; }
  .progress { color: var(--color-text-secondary); }
  .note { color: color-mix(in srgb, var(--color-info) 80%, white 20%); }
  .error { color: var(--color-danger); }
  .card { border: 1px solid var(--color-border); border-radius: var(--radius-2); background: var(--color-surface-2); padding: 1.25rem; display: grid; gap: 0.75rem; min-height: 220px; align-content: center; }
  .card-answer { border-color: color-mix(in srgb, var(--color-accent-primary) 55%, var(--color-border) 45%); }
  .card-side { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); font-weight: 700; }
  .explanation { color: var(--color-text-secondary); line-height: 1.6; }
  .controls { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .btn { min-height: 42px; border-radius: var(--radius-1); border: 1px solid var(--color-border); padding: 0 0.9rem; font: inherit; font-weight: 600; cursor: pointer; }
  .btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .primary { background: var(--gradient-accent-strong); color: var(--color-bg); border-color: transparent; }
  .secondary { background: var(--color-surface-2); color: var(--color-text-primary); }
  .success { background: color-mix(in srgb, var(--color-success) 85%, black 15%); border-color: transparent; color: var(--color-bg); }
  .danger { background: color-mix(in srgb, var(--color-danger) 85%, black 15%); border-color: transparent; color: var(--color-bg); }
  .stack { display: grid; gap: 0.5rem; }
  .option { border: 1px solid var(--color-border); border-radius: var(--radius-1); background: var(--color-surface-2); color: var(--color-text-primary); min-height: 44px; padding: 0.5rem 0.65rem; display: flex; gap: 0.65rem; align-items: center; cursor: pointer; text-align: left; }
  .option-selected { border-color: color-mix(in srgb, var(--color-accent-primary) 70%, var(--color-border) 30%); background: var(--color-accent-surface); }
  .option-letter { width: 1.65rem; height: 1.65rem; border-radius: 8px; border: 1px solid var(--color-border); display: grid; place-items: center; font-size: 0.8rem; font-weight: 700; }
  .answer-input { width: 100%; min-height: 44px; border-radius: var(--radius-1); border: 1px solid var(--color-border); background: var(--color-surface-2); color: var(--color-text-primary); padding: 0 0.75rem; font: inherit; }
  .review { border: 1px solid color-mix(in srgb, var(--color-danger) 35%, var(--color-border) 65%); border-radius: var(--radius-1); background: color-mix(in srgb, var(--color-danger-surface) 50%, transparent); padding: 0.65rem; display: grid; gap: 0.25rem; }
  .review-correct { border-color: color-mix(in srgb, var(--color-success) 40%, var(--color-border) 60%); background: color-mix(in srgb, var(--color-success-surface) 45%, transparent); }
  .review-question { color: var(--color-text-primary); font-weight: 600; }
  @media (max-width: 900px) { .activity-header { grid-template-columns: 1fr; } }
  @media (max-width: 640px) { .controls .btn { width: 100%; } }
</style>
