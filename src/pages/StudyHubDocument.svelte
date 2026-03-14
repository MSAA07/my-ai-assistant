<script>
  import { onDestroy } from 'svelte';
  import { t } from '../lib/i18n/t.js';
  import Badge from '../lib/components/ui/Badge.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import Card from '../lib/components/ui/Card.svelte';
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';
  import DocumentDetailSkeleton from '../lib/components/ui/DocumentDetailSkeleton.svelte';
  import { getDocument, requestGeneration } from '../lib/api/studyHub.js';
  import { getDocumentFileTypeLabel } from '../lib/utils/fileType.js';
  import { readPageCache, writePageCache } from '../stores/pageCache.js';

  export let documentId = '';
  export let studyTab = 'summary';

  const POLL_INTERVAL_MS = 2500;
  const DOCUMENT_CACHE_KEY = (id) => `page:study-document:${id}`;
  const FEATURE_CONFIG = {
    summary: {
      titleKey: 'document.hub.features.summary',
      openSection: 'summary'
    },
    flashcards: {
      titleKey: 'document.hub.features.flashcards',
      openSection: 'flashcards'
    },
    exam: {
      titleKey: 'document.hub.features.exam',
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

  $: fileTypeBadge = getFileType(documentData);
  $: uploadedMeta = getUploadedMeta(documentData);
  $: featureCards = FEATURE_KEYS.map((featureKey) => createFeatureCard(featureKey, documentData, extractionStatus, pendingGeneration, generationErrors));

  $: if (documentId && documentId !== currentDocumentId) {
    currentDocumentId = documentId;
    resetState();
    const cached = readPageCache(DOCUMENT_CACHE_KEY(documentId));
    if (cached?.loaded && cached?.documentData) {
      documentData = cached.documentData;
      pendingGeneration = cached.pendingGeneration ?? createFeatureMap(false);
      generationErrors = cached.generationErrors ?? createFeatureMap('');
      loading = false;
    }
    void fetchDocumentState({ background: Boolean(cached?.loaded && cached?.documentData) });
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
    if (state === 'generating') return 'processing';
    return 'info';
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
    const errorMessage = state === 'failed'
      ? localError || serverError || t('document.generation.failedNoContent')
      : '';

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
      errorMessage
    };
  }

  function getFileType(document) {
    return getDocumentFileTypeLabel(document);
  }

  function formatDate(value) {
    if (!value) return '';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleDateString();
  }

  function getUploadedMeta(document) {
    if (!document) return null;

    const uploadDate = formatDate(document?.uploadDate || document?.createdAt);

    if (!uploadDate) return null;

    return { label: t('document.uploaded'), value: uploadDate };
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
      if (documentData) {
        writePageCache(DOCUMENT_CACHE_KEY(requestedId), {
          loaded: true,
          documentData,
          pendingGeneration,
          generationErrors
        });
      }

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
  <Card as="section" class="hub-hero" variant="base" padding="lg" border="strong">
    <div class="hero-header">
      <Button type="button" className="back-link" variant="back" size="sm" on:click={goBackToLibrary}>
        <span slot="icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M10.75 6.75 5.5 12l5.25 5.25M6.5 12h12" /></svg>
        </span>
        {t('document.hub.backToStudyHub')}
      </Button>

      <div class="hero-copy">
        <div class="hero-badges">
          <Badge tone="neutral" variant="outline" size="sm" className="hub-eyebrow">{t('documentsPage.eyebrow')}</Badge>
          {#if fileTypeBadge}
            <Badge tone="destructive" variant="outline" size="sm" className="document-file-badge">{fileTypeBadge}</Badge>
          {/if}
          {#if uploadedMeta}
            <div class="hero-upload-meta" aria-label={uploadedMeta.label}>
              <span class="hero-upload-meta-label">{uploadedMeta.label}</span>
              <strong class="hero-upload-meta-value">{uploadedMeta.value}</strong>
            </div>
          {/if}
        </div>

        <div class="hero-heading">
          <h1>{normalizeString(documentData?.originalName) || normalizeString(documentData?.title) || t('document.hub.untitled')}</h1>
          <p class="hero-subtitle">{t('document.hub.readyHint')}</p>
        </div>
      </div>
    </div>
  </Card>

  {#if loading && !documentData}
    <DocumentDetailSkeleton />
  {:else if !documentData}
    <Card as="section" class="state-panel state-panel-error" variant="base" padding="md" border="strong">
      <h2>{t('document.processingFailedTitle')}</h2>
      <p>{error || t('document.notFound')}</p>
      <div class="row">
        <Button type="button" variant="back" on:click={goBackToLibrary}>{t('document.hub.backToStudyHub')}</Button>
      </div>
    </Card>
  {:else}
    {#if error}
      <Card class="inline-error" variant="soft" border="strong" padding="sm">{error}</Card>
    {/if}

    {#if extractionStatus === 'failed'}
      <Card as="section" class="state-panel state-panel-error" variant="base" padding="md" border="strong">
        <div class="row">
          <h2>{t('document.processingFailedTitle')}</h2>
          <StatusBadge status="failed" label={t('status.failed')} />
        </div>
        <p>{normalizeString(documentData?.processingError) || t('document.processingFailed')}</p>
        <p>{t('document.hub.processing.continues')}</p>
      </Card>
    {:else if showProcessingBanner}
      <Card as="section" class="state-panel processing-panel" variant="soft" padding="md" border="strong">
        <div class="row">
          <h2>{processingTitle}</h2>
          <StatusBadge status={processingTone} label={isExtractionProcessing ? t('status.processing') : t('document.hub.states.generating')} />
        </div>
        <p>{processingBody}</p>
        <p>{t('document.hub.processing.continues')}</p>
      </Card>
    {/if}

    <section class="features-grid" aria-label={t('document.hub.featuresTitle')}>
      {#each featureCards as card (card.key)}
        <Card as="article" class="feature-card" variant="base" padding="md" hoverable border={card.errorMessage ? 'strong' : 'subtle'}>
          <div class="feature-card-header">
            <div class="feature-heading">
              <h2>{card.title}</h2>
            </div>
            <StatusBadge status={card.stateTone} label={card.stateLabel} />
          </div>

          {#if card.errorMessage}
            <p class="feature-inline-error">{card.errorMessage}</p>
          {/if}

          <div class="feature-actions">
            <Button
              type="button"
              variant="primary"
              on:click={() => runPrimaryAction(card)}
              disabled={!card.canPrimaryAction}
            >
              {card.primaryLabel}
            </Button>

            {#if card.canRegenerate}
              <Button
                type="button"
                variant="secondary"
                on:click={() => regenerateFeature(card)}
              >
                {t('document.actions.regenerate')}
              </Button>
            {/if}
          </div>
        </Card>
      {/each}
    </section>
  {/if}
</div>

<style>
  .document-hub {
    width: min(100%, 64rem);
    margin: 0 auto;
    display: grid;
    gap: 1.5rem;
  }

  :global(.hub-hero) {
    display: grid;
    gap: 1rem;
    background:
      radial-gradient(circle at top right, color-mix(in srgb, var(--foreground) 7%, transparent) 0%, transparent 46%),
      linear-gradient(180deg, color-mix(in srgb, var(--card) 92%, var(--muted) 8%) 0%, var(--card) 100%);
  }

  .hero-header {
    display: grid;
    align-items: flex-start;
    gap: 1rem;
  }

  .document-hub :global(.back-link) {
    justify-self: start;
    width: fit-content;
  }

  .document-hub :global(.back-link svg) {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.9;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .hero-copy {
    display: grid;
    gap: 0.875rem;
    min-width: 0;
  }

  .hero-badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    align-items: center;
  }

  :global(.hub-eyebrow) {
    width: fit-content;
    color: var(--muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  :global(.document-file-badge) {
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .hero-upload-meta {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    min-height: 1.875rem;
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    background: color-mix(in srgb, var(--card) 78%, var(--muted) 22%);
    box-shadow: var(--shadow-inline-control);
    white-space: nowrap;
  }

  .hero-upload-meta-label {
    color: var(--muted-foreground);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .hero-upload-meta-value {
    color: var(--foreground);
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .hero-heading {
    display: grid;
    gap: 0.5rem;
  }

  h1 {
    margin: 0;
    color: var(--foreground);
    font-size: clamp(1.55rem, 3vw, 1.95rem);
    font-weight: 600;
    line-height: 1.08;
    letter-spacing: -0.03em;
    word-break: break-word;
  }

  h2 {
    margin: 0;
    color: var(--foreground);
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .hero-subtitle {
    margin: 0;
    max-width: 44rem;
    color: var(--muted-foreground);
    font-size: 0.95rem;
    line-height: 1.55;
  }

  .document-hub :global(.state-panel) {
    display: grid;
    gap: var(--space-2);
  }

  .document-hub :global(.state-panel h2),
  .document-hub :global(.state-panel p) {
    margin: 0;
  }

  .document-hub :global(.state-panel p) {
    color: var(--muted-foreground);
    line-height: 1.45;
    font-size: var(--font-size-sm);
  }

  .document-hub :global(.state-panel-error) {
    border-color: color-mix(in srgb, var(--destructive) 35%, var(--border) 65%);
  }

  .document-hub :global(.processing-panel) {
    border-color: color-mix(in srgb, var(--info) 24%, var(--border) 76%);
    background: color-mix(in srgb, var(--info) 8%, var(--card) 92%);
  }

  .features-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .document-hub :global(.feature-card) {
    display: grid;
    gap: 1rem;
    min-height: 190px;
  }

  .feature-card-header {
    display: grid;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .feature-heading {
    display: grid;
    gap: 0.25rem;
  }

  .feature-inline-error {
    margin: 0;
    color: var(--destructive);
    line-height: 1.45;
    font-size: var(--font-size-sm);
  }

  .feature-actions {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    margin-top: auto;
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  :global(.inline-error) {
    color: var(--destructive);
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

    .hero-upload-meta {
      width: fit-content;
      max-width: 100%;
    }

    .feature-card-header {
      grid-template-columns: 1fr;
    }

    .feature-actions {
      flex-direction: column;
    }

    .feature-actions :global(.ui-button) {
      width: 100%;
    }
  }
</style>
