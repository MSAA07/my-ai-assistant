<script>
  import { onDestroy } from 'svelte';
  import { t } from '../lib/i18n/t.js';
  import Badge from '../lib/components/ui/Badge.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import Card from '../lib/components/ui/Card.svelte';
  import FieldShell from '../lib/components/ui/FieldShell.svelte';
  import MetaPill from '../lib/components/ui/MetaPill.svelte';
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
  $: modeLabel = mode === 'summary' ? t('document.activity.section.summary') : mode === 'flashcards' ? t('document.activity.section.flashcards') : t('document.activity.section.exam');
  $: modeSubtitle = mode === 'summary' ? t('document.activity.subtitle.summary') : mode === 'flashcards' ? t('document.activity.subtitle.flashcards') : t('document.activity.subtitle.exam');
  $: metaItems = getMetaItems(docData);

  $: flashcards = Array.isArray(docData?.flashcards) ? docData.flashcards : [];
  $: currentFlashcard = flashcards[flashcardIndex] ?? null;
  $: flashcardsCorrect = flashcardResults.filter((result) => result === 'correct').length;
  $: flashcardsIncorrect = flashcardResults.filter((result) => result === 'incorrect').length;
  $: flashcardProgressPercent = flashcards.length ? ((flashcardIndex + 1) / flashcards.length) * 100 : 0;
  $: summaryParagraphs = text(docData?.summary)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  $: examQuestions = Array.isArray(docData?.examQuestions) ? docData.examQuestions : [];
  $: currentExamQuestion = examQuestions[currentQuestionIndex] ?? null;
  $: examAnsweredCount = examAnswers.filter((answer) => text(answer)).length;
  $: examProgressPercent = examQuestions.length ? ((currentQuestionIndex + 1) / examQuestions.length) * 100 : 0;

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

  function getFileType(document) {
    const explicitType = text(document?.fileType || document?.mimeType);
    if (explicitType) return explicitType.toUpperCase();

    const fileName = text(document?.originalName || document?.title);
    if (!fileName.includes('.')) return '';

    const ext = text(fileName.split('.').pop());
    return ext ? ext.toUpperCase() : '';
  }

  function formatDate(value) {
    if (!value) return '';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';

    return parsed.toLocaleDateString();
  }

  function getMetaItems(document) {
    if (!document) return [];

    const items = [];
    const fileType = getFileType(document);
    const language = text(document?.language);
    const uploadDate = formatDate(document?.uploadDate || document?.createdAt);

    if (fileType) items.push({ key: 'fileType', label: t('document.hub.meta.fileType'), value: fileType });
    if (language) items.push({ key: 'language', label: t('document.language'), value: language });
    if (uploadDate) items.push({ key: 'uploaded', label: t('document.uploaded'), value: uploadDate });

    return items;
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
  <div class="activity mode-{mode}">
    <Card as="header" class="activity-hero" variant="base" padding="lg" border="strong">
      <div class="hero-toolbar">
        <Button type="button" class="activity-back-link" variant="back" size="sm" on:click={goBackToHub}>
          <span slot="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M10.75 6.75 5.5 12l5.25 5.25M6.5 12h12" /></svg>
          </span>
          {t('document.activity.backToHub')}
        </Button>
        {#if activeFeature.hasContent}
          <Button type="button" variant="secondary" on:click={() => openRegenerateModal(activeFeature)} disabled={!activeFeature.canRegenerate}>
            {activeFeature.busy ? t('document.activity.regenerate.running') : t('document.actions.regenerate')}
          </Button>
        {/if}
      </div>

      <div class="hero-main">
        <div class="hero-copy">
          <Badge tone="accent" variant="soft" size="sm" uppercase>{modeLabel}</Badge>
          <h1>{title}</h1>
          <p class="sub">{modeSubtitle}</p>
        </div>

        {#if metaItems.length}
          <div class="meta-grid">
            {#each metaItems as item}
              <MetaPill label={item.label} value={item.value} />
            {/each}
          </div>
        {/if}
      </div>
    </Card>

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

    {#if mode === 'summary'}
      <section class="activity-body summary-body">
        {#if summaryFeature.hasContent}
          <Card as="article" class="summary-surface" variant="base" padding="lg" border="strong">
            <div class="section-header">
              <div class="section-copy">
                <p class="eyebrow">{t('document.activity.summary.title')}</p>
                <h2>{modeSubtitle}</h2>
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

            {#if summaryFeature.busy}
              <p class="note">{t('document.activity.summary.regenerating')}</p>
            {/if}
          </Card>
        {:else}
          <Card as="section" class="empty-state" variant="base" padding="lg" border="dashed">
            <div class="empty">
              <Badge tone="neutral" variant="outline" size="sm" uppercase>{modeLabel}</Badge>
              <h2>{t('document.activity.summary.title')}</h2>
              <p>{summaryFeature.errorMessage || t('document.summary.generatePrompt')}</p>
            </div>
            <Button type="button" variant="primary" on:click={() => queueGeneration(summaryFeature, { regenerate: summaryFeature.shouldRegenerate })} disabled={!summaryFeature.canGenerate}>
              {summaryFeature.busy ? t('document.actions.generating') : t('document.activity.actions.generateSummary')}
            </Button>
          </Card>
        {/if}
      </section>
    {/if}

    {#if mode === 'flashcards'}
      <section class="activity-body study-body">
        {#if flashcardsFeature.hasContent}
          <Card as="section" class="study-surface flashcards-surface" variant="base" padding="lg" border="strong">
            <div class="section-header section-header-study">
              <div class="section-copy">
                <p class="eyebrow">{modeLabel}</p>
                <h2>{modeSubtitle}</h2>
                <p class="progress">{t('document.activity.flashcards.progressLabel', { current: flashcardIndex + 1, total: flashcards.length, correct: flashcardsCorrect, incorrect: flashcardsIncorrect })}</p>
              </div>
            </div>

            <div class="progress-rail" aria-hidden="true">
              <span style={`width: ${flashcardProgressPercent}%`}></span>
            </div>

            <Card as="article" class={`flashcard-stage ${revealAnswer ? 'flashcard-stage-answer' : ''}`} variant="raised" padding="xl" border={revealAnswer ? 'strong' : 'subtle'}>
              <p class="card-side">{revealAnswer ? t('document.activity.flashcards.answerLabel') : t('document.activity.flashcards.questionLabel')}</p>
              <h2>{revealAnswer ? currentFlashcard?.answer : currentFlashcard?.question}</h2>
              {#if revealAnswer && text(currentFlashcard?.explanation)}
                <p class="explanation">{currentFlashcard.explanation}</p>
              {/if}
            </Card>

            <div class="controls controls-primary">
              {#if !revealAnswer}
                <Button type="button" variant="primary" on:click={() => (revealAnswer = true)}>{t('document.activity.actions.revealAnswer')}</Button>
              {:else}
                <Button type="button" variant="secondary" on:click={() => (revealAnswer = false)}>{t('document.activity.actions.hideAnswer')}</Button>
                <Button type="button" variant="success" on:click={() => markFlashcard('correct')} disabled={flashcardProgressBusy}>{t('document.activity.actions.markCorrect')}</Button>
                <Button type="button" variant="danger" on:click={() => markFlashcard('incorrect')} disabled={flashcardProgressBusy}>{t('document.activity.actions.markIncorrect')}</Button>
              {/if}
            </div>

            {#if flashcardProgressError}<p class="error">{flashcardProgressError}</p>{/if}

            <div class="controls controls-secondary">
              <Button type="button" variant="secondary" on:click={previousFlashcard} disabled={flashcardIndex === 0}>{t('document.activity.actions.previous')}</Button>
              <Button type="button" variant="secondary" on:click={nextFlashcard} disabled={flashcardIndex >= flashcards.length - 1}>{t('document.activity.actions.next')}</Button>
            </div>
          </Card>
        {:else}
          <Card as="section" class="empty-state" variant="base" padding="lg" border="dashed">
            <div class="empty">
              <Badge tone="neutral" variant="outline" size="sm" uppercase>{modeLabel}</Badge>
              <h2>{t('document.hub.features.flashcards')}</h2>
              <p>{flashcardsFeature.errorMessage || t('document.flashcards.generatePrompt')}</p>
            </div>
            <Button type="button" variant="primary" on:click={() => queueGeneration(flashcardsFeature, { regenerate: flashcardsFeature.shouldRegenerate })} disabled={!flashcardsFeature.canGenerate}>
              {flashcardsFeature.busy ? t('document.actions.generating') : t('document.activity.actions.generateFlashcards')}
            </Button>
          </Card>
        {/if}
      </section>
    {/if}

    {#if mode === 'exam'}
      <section class="activity-body exam-body">
        {#if examFeature.hasContent}
          {#if examPhase === 'intro'}
            <Card as="article" class="study-surface exam-intro" variant="base" padding="lg" border="strong">
              <Badge tone="accent" variant="soft" size="sm" uppercase>{modeLabel}</Badge>
              <h2>{t('document.activity.exam.introTitle')}</h2>
              <p>{t('document.activity.exam.introDescription', { count: examQuestions.length })}</p>
              <Button type="button" variant="primary" on:click={startExam}>{t('document.activity.actions.startExam')}</Button>
            </Card>
          {:else if examPhase === 'question'}
            <Card as="section" class="study-surface exam-surface" variant="base" padding="lg" border="strong">
              <div class="section-header section-header-study">
                <div class="section-copy">
                  <p class="eyebrow">{t('document.activity.exam.questionLabel', { index: currentQuestionIndex + 1 })}</p>
                  <h2>{currentExamQuestion?.question}</h2>
                  <p class="progress">{t('document.exam.progress', { current: currentQuestionIndex + 1, total: examQuestions.length })} · {t('document.activity.exam.answeredCount', { answered: examAnsweredCount, total: examQuestions.length })}</p>
                </div>
              </div>

              <div class="progress-rail" aria-hidden="true">
                <span style={`width: ${examProgressPercent}%`}></span>
              </div>

              <Card as="article" class="question-surface" variant="raised" padding="lg" border="subtle">
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
          {:else if examPhase === 'submitting'}
            <Card as="article" class="study-surface exam-intro" variant="base" padding="lg" border="strong">
              <Badge tone="info" variant="soft" size="sm" uppercase>{t('status.processing')}</Badge>
              <h2>{t('document.activity.exam.submittingTitle')}</h2>
              <p>{t('document.activity.exam.submittingBody')}</p>
            </Card>
          {:else}
            <Card as="article" class="study-surface exam-results" variant="base" padding="lg" border="strong">
              <div class="results-summary">
                <Badge tone={examScore === examQuestions.length ? 'success' : examScore > 0 ? 'info' : 'destructive'} variant="soft" size="sm" uppercase>{t('document.activity.exam.resultsTitle')}</Badge>
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

              <div class="controls controls-secondary">
                <Button type="button" variant="primary" on:click={() => resetExamState(examQuestions.length)}>{t('document.activity.actions.retakeExam')}</Button>
              </div>
            </Card>
          {/if}
        {:else}
          <Card as="section" class="empty-state" variant="base" padding="lg" border="dashed">
            <div class="empty">
              <Badge tone="neutral" variant="outline" size="sm" uppercase>{modeLabel}</Badge>
              <h2>{t('document.hub.features.exam')}</h2>
              <p>{examFeature.errorMessage || t('document.exam.generatePrompt')}</p>
            </div>
            <Button type="button" variant="primary" on:click={() => queueGeneration(examFeature, { regenerate: examFeature.shouldRegenerate })} disabled={!examFeature.canGenerate}>
              {examFeature.busy ? t('document.actions.generating') : t('document.activity.actions.generateExam')}
            </Button>
          </Card>
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
  .activity {
    display: grid;
    gap: 1.5rem;
    min-width: 0;
  }

  .activity-hero {
    display: grid;
    gap: 1.5rem;
    background:
      radial-gradient(circle at top right, color-mix(in srgb, var(--foreground) 7%, transparent) 0%, transparent 46%),
      linear-gradient(180deg, color-mix(in srgb, var(--card) 92%, var(--muted) 8%) 0%, var(--card) 100%);
  }

  .hero-toolbar {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .hero-main {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.95fr);
    align-items: end;
  }

  .hero-copy {
    display: grid;
    gap: 0.75rem;
    min-width: 0;
  }

  .activity :global(.activity-back-link) {
    width: fit-content;
  }

  .activity :global(.activity-back-link svg) {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.9;
    stroke-linecap: round;
    stroke-linejoin: round;
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
  p {
    margin: 0;
  }

  .hero-copy h1 {
    font-size: clamp(1.6rem, 3vw, 2.35rem);
    font-weight: 600;
    line-height: 1.08;
    letter-spacing: -0.03em;
    text-wrap: balance;
  }

  .section-copy h2,
  .study-surface h2,
  .summary-surface h2 {
    font-size: clamp(1.1rem, 2vw, 1.5rem);
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .sub {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    max-width: 44rem;
    line-height: 1.6;
  }

  .meta-grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  .activity-body {
    width: 100%;
    min-width: 0;
    margin-inline: auto;
  }

  .summary-body {
    max-width: 50rem;
  }

  .study-body,
  .exam-body {
    max-width: 56rem;
  }

  :global(.activity-panel),
  .summary-surface,
  .study-surface {
    display: grid;
    gap: 1rem;
  }

  .status-panel {
    max-width: 56rem;
    margin-inline: auto;
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

  .section-header {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    align-items: start;
    flex-wrap: wrap;
  }

  .section-header-study {
    margin-bottom: 0.25rem;
  }

  .section-copy {
    display: grid;
    gap: 0.45rem;
  }

  .summary-surface {
    min-height: min(72vh, 780px);
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

  .empty-state {
    display: grid;
    gap: 1.25rem;
    justify-items: start;
    max-width: 50rem;
    margin-inline: auto;
  }

  .empty {
    display: grid;
    gap: 0.75rem;
    min-height: 180px;
    align-content: center;
  }

  .empty h2 {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .empty p {
    color: var(--muted-foreground);
    line-height: 1.6;
    max-width: 42rem;
  }

  .progress {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .progress-rail {
    width: 100%;
    height: 0.35rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--muted) 88%, transparent);
    overflow: hidden;
  }

  .progress-rail span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: color-mix(in srgb, var(--foreground) 82%, var(--muted) 18%);
    transition: width var(--motion-default) var(--ease-standard);
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

  .flashcards-surface {
    gap: 1.25rem;
  }

  .flashcard-stage {
    display: grid;
    gap: 1rem;
    min-height: clamp(280px, 46vh, 420px);
    align-content: center;
    text-align: center;
    justify-items: center;
  }

  .flashcard-stage h2 {
    max-width: 34rem;
    text-wrap: balance;
  }

  .flashcard-stage-answer {
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

  .stack {
    display: grid;
    gap: 0.75rem;
  }

  .stack-spacious {
    gap: 0.9rem;
  }

  .exam-intro,
  .exam-results {
    max-width: 44rem;
    margin-inline: auto;
  }

  .exam-intro {
    min-height: 300px;
    place-content: center;
    justify-items: start;
  }

  .question-surface {
    gap: 1rem;
  }

  .results-summary {
    display: grid;
    gap: 0.75rem;
  }

  .results-summary h2 {
    font-size: clamp(1.35rem, 2vw, 1.85rem);
  }

  .results-summary p {
    color: var(--muted-foreground);
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

  .review-head {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: start;
    flex-wrap: wrap;
  }

  .review-question {
    color: var(--color-text-primary);
    font-weight: 600;
    line-height: 1.5;
  }

  @media (max-width: 900px) {
    .hero-main {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .activity {
      gap: 1rem;
    }

    .activity-hero {
      gap: 1rem;
    }

    .hero-toolbar,
    .section-header,
    .controls-secondary,
    .review-head {
      align-items: stretch;
    }

    .controls :global(.ui-button) {
      width: 100%;
    }

    .meta-grid {
      grid-template-columns: 1fr;
    }

    .flashcard-stage {
      min-height: 240px;
    }
  }
</style>
