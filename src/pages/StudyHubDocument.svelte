<script>
  import { onDestroy } from 'svelte';
  import { t } from '../lib/i18n/t.js';
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';
  import { getDocument, requestGeneration } from '../lib/api/studyHub.js';

  export let documentId = '';
  export let studyTab = 'summary';

  const POLL_INTERVAL_MS = 2500;
  const FEATURE_CONFIG = {
    summary: {
      titleKey: 'document.hub.features.summary',
      descriptionKey: 'document.summary.generatePrompt',
      openSection: 'summary'
    },
    flashcards: {
      titleKey: 'document.hub.features.flashcards',
      descriptionKey: 'document.flashcards.generatePrompt',
      openSection: 'flashcards'
    },
    exam: {
      titleKey: 'document.hub.features.exam',
      descriptionKey: 'document.exam.generatePrompt',
      openSection: 'exam'
    }
  };
  const FEATURE_KEYS = Object.keys(FEATURE_CONFIG);

  let currentDocumentId = '';
  let documentData = null;
  let loading = true;
  let error = '';
  let pollTimer = null;
  let pendingGeneration = createFeatureMap(false);
  let generationErrors = createFeatureMap('');

  $: void studyTab;
  $: extractionStatus = normalizeDocumentStatus(documentData?.processingStatus);
  $: isExtractionProcessing = extractionStatus === 'queued' || extractionStatus === 'processing';
  $: hasActiveGeneration = FEATURE_KEYS.some((featureKey) => {
    const status = normalizeGenerationStatus(documentData?.generationState?.[featureKey]?.status);
    return status === 'queued' || status === 'running';
  });
  $: showProcessingBanner = Boolean(documentData) && (isExtractionProcessing || hasActiveGeneration);
  $: processingTone = isExtractionProcessing ? 'processing' : 'info';
  $: processingTitle = isExtractionProcessing
    ? t('document.hub.processing.extractingTitle')
    : t('document.hub.processing.generatingTitle');
  $: processingBody = isExtractionProcessing
    ? t('document.hub.processing.extractingBody')
    : t('document.hub.processing.generatingBody');

  $: metaItems = getMetaItems(documentData);
  $: featureCards = FEATURE_KEYS.map((featureKey) => createFeatureCard(featureKey, documentData, extractionStatus, pendingGeneration, generationErrors));

  $: if (documentId && documentId !== currentDocumentId) {
    currentDocumentId = documentId;
    resetState();
    void fetchDocumentState();
  }

  onDestroy(() => {
    clearPollTimer();
  });

  function createFeatureMap(initialValue) {
    return {
      summary: initialValue,
      flashcards: initialValue,
      exam: initialValue
    };
  }

  function normalizeString(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function normalizeDocumentStatus(status) {
    const normalized = normalizeString(status).toLowerCase();
    if (normalized === 'queued' || normalized === 'processing' || normalized === 'complete' || normalized === 'failed') {
      return normalized;
    }
    return 'failed';
  }

  function normalizeGenerationStatus(status) {
    const normalized = normalizeString(status).toLowerCase();
    if (normalized === 'queued' || normalized === 'running' || normalized === 'complete' || normalized === 'failed' || normalized === 'not_requested') {
      return normalized;
    }
    return 'not_requested';
  }

  function hasFeatureContent(featureKey, document = documentData) {
    if (featureKey === 'summary') {
      return normalizeString(document?.summary).length > 0;
    }

    if (featureKey === 'flashcards') {
      return Array.isArray(document?.flashcards) && document.flashcards.length > 0;
    }

    return Array.isArray(document?.examQuestions) && document.examQuestions.length > 0;
  }

  function getFeatureState({ extraction, generationStatus, hasContent, isPending }) {
    if (isPending || generationStatus === 'queued' || generationStatus === 'running') {
      return 'generating';
    }

    if (generationStatus === 'failed') {
      return 'failed';
    }

    if (hasContent || generationStatus === 'complete') {
      return 'ready';
    }

    if (extraction === 'queued' || extraction === 'processing') {
      return 'generating';
    }

    return 'not_generated';
  }

  function getStateLabel(state) {
    if (state === 'ready') return t('status.ready');
    if (state === 'generating') return t('document.hub.states.generating');
    if (state === 'failed') return t('status.failed');
    return t('document.hub.states.notGenerated');
  }

  function getStateTone(state) {
    if (state === 'ready') return 'ready';
    if (state === 'failed') return 'failed';
    return 'processing';
  }

  function getPrimaryActionLabel(state) {
    if (state === 'ready') return t('document.hub.actions.open');
    if (state === 'failed') return t('document.actions.retry');
    if (state === 'generating') return t('document.actions.generating');
    return t('document.actions.generate');
  }

  function getGenerationOptions(featureKey) {
    if (featureKey === 'summary') {
      return { length: 'medium' };
    }

    if (featureKey === 'flashcards') {
      return { includeExplanations: false };
    }

    return { questionCount: 10 };
  }

  function getFeatureHint(featureKey, state, generationStatus, localError, serverError) {
    if (state === 'generating') {
      if (extractionStatus === 'queued' || extractionStatus === 'processing') {
        return t('document.hub.states.waitingForExtraction');
      }

      if (generationStatus === 'queued') {
        return t('document.generation.queuedNoContent');
      }

      return t('document.generation.runningNoContent');
    }

    if (state === 'failed') {
      return localError || serverError || t('document.generation.failedNoContent');
    }

    if (state === 'not_generated') {
      return t(FEATURE_CONFIG[featureKey].descriptionKey);
    }

    return t('document.hub.readyHint');
  }

  function createFeatureCard(featureKey, document, extraction, pendingByFeature, errorByFeature) {
    const generation = document?.generationState?.[featureKey] ?? {};
    const generationStatus = normalizeGenerationStatus(generation?.status);
    const hasContent = hasFeatureContent(featureKey, document);
    const state = getFeatureState({
      extraction,
      generationStatus,
      hasContent,
      isPending: Boolean(pendingByFeature?.[featureKey])
    });

    const canGenerate = extraction === 'complete' && state !== 'generating';
    const canPrimaryAction = state === 'ready' || canGenerate;
    const canRegenerate = extraction === 'complete' && state === 'ready' && !pendingByFeature?.[featureKey];
    const serverError = normalizeString(generation?.errorMessage);
    const localError = normalizeString(errorByFeature?.[featureKey]);

    return {
      key: featureKey,
      title: t(FEATURE_CONFIG[featureKey].titleKey),
      state,
      stateLabel: getStateLabel(state),
      stateTone: getStateTone(state),
      primaryLabel: getPrimaryActionLabel(state),
      canPrimaryAction,
      canRegenerate,
      shouldRegenerate: hasContent || generationStatus === 'complete',
      hint: getFeatureHint(featureKey, state, generationStatus, localError, serverError),
      showHintAsError: state === 'failed'
    };
  }

  function getFileType(document) {
    const explicitType = normalizeString(document?.fileType || document?.mimeType);
    if (explicitType) {
      return explicitType.toUpperCase();
    }

    const fileName = normalizeString(document?.originalName || document?.title);
    if (!fileName.includes('.')) {
      return '';
    }

    const ext = normalizeString(fileName.split('.').pop());
    return ext ? ext.toUpperCase() : '';
  }

  function formatDate(value) {
    if (!value) return '';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleDateString();
  }

  function getMetaItems(document) {
    if (!document) return [];

    const items = [];
    const fileType = getFileType(document);
    const language = normalizeString(document?.language);
    const uploadDate = formatDate(document?.uploadDate || document?.createdAt);

    if (fileType) {
      items.push({ key: 'fileType', label: t('document.hub.meta.fileType'), value: fileType });
    }

    if (language) {
      items.push({ key: 'language', label: t('document.language'), value: language });
    }

    if (uploadDate) {
      items.push({ key: 'uploaded', label: t('document.uploaded'), value: uploadDate });
    }

    return items;
  }

  function clearPollTimer() {
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
  }

  function schedulePoll() {
    clearPollTimer();
    pollTimer = setTimeout(() => {
      void fetchDocumentState({ background: true });
    }, POLL_INTERVAL_MS);
  }

  function shouldPollDocument(document) {
    if (!document) {
      return false;
    }

    const extraction = normalizeDocumentStatus(document?.processingStatus);
    if (extraction === 'queued' || extraction === 'processing') {
      return true;
    }

    const hasActiveFeatureGeneration = FEATURE_KEYS.some((featureKey) => {
      const status = normalizeGenerationStatus(document?.generationState?.[featureKey]?.status);
      return status === 'queued' || status === 'running';
    });

    if (hasActiveFeatureGeneration) {
      return true;
    }

    return FEATURE_KEYS.some((featureKey) => pendingGeneration[featureKey]);
  }

  function syncPendingGeneration(nextDocument) {
    const nextPending = { ...pendingGeneration };
    const nextErrors = { ...generationErrors };

    for (const featureKey of FEATURE_KEYS) {
      const generationStatus = normalizeGenerationStatus(nextDocument?.generationState?.[featureKey]?.status);
      const hasContent = hasFeatureContent(featureKey, nextDocument);

      if (nextPending[featureKey] && (generationStatus !== 'not_requested' || hasContent)) {
        nextPending[featureKey] = false;
        nextErrors[featureKey] = '';
      }
    }

    pendingGeneration = nextPending;
    generationErrors = nextErrors;
  }

  function setFeaturePending(featureKey, isPending) {
    pendingGeneration = {
      ...pendingGeneration,
      [featureKey]: isPending
    };
  }

  function setFeatureError(featureKey, message = '') {
    generationErrors = {
      ...generationErrors,
      [featureKey]: message
    };
  }

  function resetState() {
    clearPollTimer();
    documentData = null;
    loading = true;
    error = '';
    pendingGeneration = createFeatureMap(false);
    generationErrors = createFeatureMap('');
  }

  async function fetchDocumentState({ background = false } = {}) {
    if (!currentDocumentId) {
      return;
    }

    if (!background) {
      loading = true;
      error = '';
    }

    clearPollTimer();

    try {
      const requestedId = currentDocumentId;
      const data = await getDocument(requestedId);

      if (requestedId !== currentDocumentId) {
        return;
      }

      documentData = data?.document ?? null;
      syncPendingGeneration(documentData);

      if (!documentData) {
        error = t('document.notFound');
        return;
      }

      if (shouldPollDocument(documentData)) {
        schedulePoll();
      }
    } catch (err) {
      const message = normalizeString(err?.message) || t('document.loadingError');

      if (!background) {
        error = message;
      } else if (documentData && shouldPollDocument(documentData)) {
        schedulePoll();
      }
    } finally {
      if (!background) {
        loading = false;
      }
    }
  }

  async function generateFeature(featureKey, { regenerate = false } = {}) {
    if (!currentDocumentId || extractionStatus !== 'complete') {
      return;
    }

    setFeatureError(featureKey, '');
    setFeaturePending(featureKey, true);

    try {
      await requestGeneration(currentDocumentId, {
        type: featureKey,
        options: getGenerationOptions(featureKey),
        regenerate
      });

      await fetchDocumentState({ background: true });
    } catch (err) {
      setFeaturePending(featureKey, false);
      setFeatureError(featureKey, normalizeString(err?.message) || t('document.generation.requestFailed'));
    }
  }

  function openFeature(featureKey) {
    const openSection = FEATURE_CONFIG[featureKey]?.openSection ?? 'summary';
    window.location.hash = `/legacy/documents/${currentDocumentId}/${openSection}`;
  }

  async function runPrimaryAction(card) {
    if (!card?.canPrimaryAction) {
      return;
    }

    if (card.state === 'ready') {
      openFeature(card.key);
      return;
    }

    if (card.state === 'not_generated' || card.state === 'failed') {
      await generateFeature(card.key, { regenerate: card.shouldRegenerate });
    }
  }

  async function regenerateFeature(card) {
    if (!card?.canRegenerate) {
      return;
    }

    await generateFeature(card.key, { regenerate: true });
  }

  function goBackToLibrary() {
    window.location.hash = '/study';
  }
</script>

<div class="document-hub">
  <header class="hub-header">
    <button type="button" class="back-link" on:click={goBackToLibrary}>
      {t('document.hub.backToStudyHub')}
    </button>

    <h1>{normalizeString(documentData?.originalName) || normalizeString(documentData?.title) || t('document.hub.untitled')}</h1>

    {#if metaItems.length > 0}
      <div class="meta-row">
        {#each metaItems as item (item.key)}
          <p class="meta-chip">
            <span>{item.label}:</span>
            <strong>{item.value}</strong>
          </p>
        {/each}
      </div>
    {/if}
  </header>

  {#if loading && !documentData}
    <section class="state-panel">
      <p>{t('document.loading')}</p>
    </section>
  {:else if !documentData}
    <section class="state-panel state-panel-error">
      <h2>{t('document.processingFailedTitle')}</h2>
      <p>{error || t('document.notFound')}</p>
      <div class="row">
        <button type="button" on:click={goBackToLibrary}>{t('document.hub.backToStudyHub')}</button>
      </div>
    </section>
  {:else}
    {#if error}
      <p class="inline-error">{error}</p>
    {/if}

    {#if extractionStatus === 'failed'}
      <section class="state-panel state-panel-error">
        <div class="row">
          <h2>{t('document.processingFailedTitle')}</h2>
          <StatusBadge status="failed" label={t('status.failed')} />
        </div>
        <p>{normalizeString(documentData?.processingError) || t('document.processingFailed')}</p>
        <p>{t('document.hub.processing.continues')}</p>
      </section>
    {:else if showProcessingBanner}
      <section class="state-panel processing-panel">
        <div class="row">
          <h2>{processingTitle}</h2>
          <StatusBadge status={processingTone} label={isExtractionProcessing ? t('status.processing') : t('document.hub.states.generating')} />
        </div>
        <p>{processingBody}</p>
        <p>{t('document.hub.processing.continues')}</p>
      </section>
    {/if}

    <section class="features-grid" aria-label={t('document.hub.featuresTitle')}>
      {#each featureCards as card (card.key)}
        <article class="feature-card">
          <div class="feature-card-header">
            <h2>{card.title}</h2>
            <StatusBadge status={card.stateTone} label={card.stateLabel} />
          </div>

          <p class:feature-hint-error={card.showHintAsError} class="feature-hint">{card.hint}</p>

          <div class="feature-actions">
            <button
              type="button"
              on:click={() => runPrimaryAction(card)}
              disabled={!card.canPrimaryAction}
            >
              {card.primaryLabel}
            </button>

            {#if card.canRegenerate}
              <button
                type="button"
                class="secondary-btn"
                on:click={() => regenerateFeature(card)}
              >
                {t('document.actions.regenerate')}
              </button>
            {/if}
          </div>
        </article>
      {/each}
    </section>
  {/if}
</div>

<style>
  .document-hub {
    display: grid;
    gap: var(--space-4);
  }

  .hub-header {
    display: grid;
    gap: var(--space-2);
  }

  .back-link {
    border: none;
    background: transparent;
    color: var(--color-accent-primary);
    padding: 0;
    min-height: 0;
    justify-self: start;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .back-link:hover {
    color: color-mix(in srgb, var(--color-accent-primary) 75%, white 25%);
  }

  h1 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 1.8rem;
    line-height: 1.3;
    word-break: break-word;
  }

  h2 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 1.2rem;
  }

  .meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .meta-chip {
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    border: 1px solid var(--color-border);
    background: color-mix(in srgb, var(--color-surface-1) 90%, transparent);
    color: var(--color-text-secondary);
    font-size: 0.82rem;
  }

  .meta-chip strong {
    color: var(--color-text-primary);
    font-weight: 600;
  }

  .state-panel {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    background: var(--color-surface-1);
    padding: var(--space-4);
    display: grid;
    gap: var(--space-2);
  }

  .state-panel h2,
  .state-panel p {
    margin: 0;
  }

  .state-panel p {
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .state-panel-error {
    border-color: color-mix(in srgb, var(--color-danger) 35%, var(--color-border) 65%);
  }

  .processing-panel {
    border-color: color-mix(in srgb, var(--color-info) 28%, var(--color-border) 72%);
    background: color-mix(in srgb, var(--color-info) 10%, var(--color-surface-1) 90%);
  }

  .features-grid {
    display: grid;
    gap: var(--space-3);
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .feature-card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    background: var(--color-surface-1);
    padding: var(--space-4);
    display: grid;
    gap: var(--space-3);
  }

  .feature-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.6rem;
  }

  .feature-hint {
    margin: 0;
    color: var(--color-text-secondary);
    line-height: 1.6;
    min-height: 52px;
  }

  .feature-hint-error {
    color: var(--color-danger);
  }

  .feature-actions {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  button {
    min-height: 40px;
    border-radius: var(--radius-1);
    border: 1px solid var(--color-border);
    background: var(--gradient-accent-strong);
    color: var(--color-bg);
    padding: 0.5rem 0.9rem;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: border-color var(--motion-fast) var(--ease-standard), transform var(--motion-fast) var(--ease-standard);
  }

  button:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  .secondary-btn {
    background: color-mix(in srgb, var(--color-surface-2) 88%, transparent);
    color: var(--color-text-primary);
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .inline-error {
    margin: 0;
    border: 1px solid color-mix(in srgb, var(--color-danger) 36%, transparent);
    border-radius: var(--radius-1);
    background: var(--color-danger-surface);
    color: var(--color-danger);
    padding: 0.7rem 0.85rem;
  }

  @media (max-width: 1024px) {
    .features-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .features-grid {
      grid-template-columns: 1fr;
    }

    .feature-actions {
      flex-direction: column;
    }

    .feature-actions button {
      width: 100%;
    }
  }
</style>
