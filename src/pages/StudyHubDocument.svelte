<script>
  import { onDestroy } from 'svelte';
  import { ArrowLeft, ClipboardCheck, FileText, Layers3 } from '@lucide/svelte';
  import { t } from '../lib/i18n/t.js';
  import Badge from '../lib/components/ui/Badge.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import Card from '../lib/components/ui/Card.svelte';
  import MetaPill from '../lib/components/ui/MetaPill.svelte';
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';
  import StudyActionCard from '../lib/components/ui/StudyActionCard.svelte';
  import DocumentDetailSkeleton from '../lib/components/ui/DocumentDetailSkeleton.svelte';
  import DocumentActivityView from '../lib/components/study/DocumentActivityView.svelte';
  import { getDocument, requestGeneration } from '../lib/api/studyHub.js';
  import { getDocumentFileTypeLabel } from '../lib/utils/fileType.js';
  import { readPageCache, writePageCache } from '../stores/pageCache.js';

  export let documentId = '';
  export let studyTab = '';

  const POLL_INTERVAL_MS = 2500;
  const DOCUMENT_CACHE_KEY = (id) => `page:study-document:${id}`;
  const ACTIVITY_TABS = new Set(['summary', 'flashcards', 'exam', 'exams']);
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
  $: normalizedStudyTab = normalizeString(studyTab).toLowerCase();
  $: isActivityRoute = ACTIVITY_TABS.has(normalizedStudyTab);
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
  $: languageMeta = getLanguageMeta(documentData);
  $: uploadedMeta = getUploadedMeta(documentData);
  $: featureCards = FEATURE_KEYS.map((featureKey) => createFeatureCard(featureKey, documentData, extractionStatus, pendingGeneration, generationErrors));

  $: if (!isActivityRoute && documentId && documentId !== currentDocumentId) {
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
    if (state === 'generating') return t('document.actions.generating');
    return t('document.actions.generate');
  }

  function getFeatureDescription(featureKey) {
    if (featureKey === 'summary') {
      return 'Get a comprehensive AI-generated summary of the key concepts and main points from your document.';
    }

    if (featureKey === 'flashcards') {
      return 'Study with AI-generated flashcards that help you memorize important terms and concepts.';
    }

    return 'Test your knowledge with a practice exam featuring multiple-choice questions based on the content.';
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
      description: getFeatureDescription(featureKey),
      canPrimaryAction,
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

  function getLanguageMeta(document) {
    const language = normalizeString(document?.language).toLowerCase();
    if (!language) return null;

    const label = language === 'arabic' ? 'Arabic' : 'English';
    return { label: t('documentsPage.labels.language'), value: label };
  }

  function featureIcon(featureKey) {
    if (featureKey === 'summary') return FileText;
    if (featureKey === 'flashcards') return Layers3;
    return ClipboardCheck;
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
    window.location.hash = `/study/${currentDocumentId}/${openSection}`;
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

  function goBackToLibrary() {
    window.location.hash = '/study';
  }
</script>

{#if isActivityRoute}
  <DocumentActivityView {documentId} studyTab={studyTab} />
{:else}
  <div class="document-hub">
    <header class="document-header">
      <Button type="button" className="back-link" variant="ghost" size="sm" on:click={goBackToLibrary}>
        <span slot="icon" aria-hidden="true">
          <ArrowLeft />
        </span>
        {t('document.hub.backToStudyHub')}
      </Button>

      <div class="document-title-block">
        <h1>{normalizeString(documentData?.originalName) || normalizeString(documentData?.title) || t('document.hub.untitled')}</h1>
        <div class="document-meta">
          {#if fileTypeBadge}
            <Badge tone="destructive" variant="outline" size="sm" className="document-meta-badge document-file-badge">{fileTypeBadge}</Badge>
          {/if}
          {#if languageMeta}
            <MetaPill className="document-meta-pill" label="" value={languageMeta.value} />
          {/if}
          {#if uploadedMeta}
            <MetaPill className="document-meta-pill" label="" value={`${uploadedMeta.label} ${uploadedMeta.value}`} />
          {/if}
        </div>
      </div>
    </header>

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
          {@const Icon = featureIcon(card.key)}
          <StudyActionCard class="feature-card" title={card.title} description={card.description} status={card.stateTone} statusLabel={card.stateLabel}>
            <div slot="icon">
              <Icon />
            </div>

            <svelte:fragment slot="description">
              <p>{card.description}</p>
              {#if card.errorMessage}
                <p class="feature-inline-error">{card.errorMessage}</p>
              {/if}
            </svelte:fragment>

            <div slot="actions" class="feature-actions">
              <Button
                type="button"
                variant={card.state === 'ready' ? 'primary' : 'secondary'}
                on:click={() => runPrimaryAction(card)}
                disabled={!card.canPrimaryAction}
              >
                {card.primaryLabel}
              </Button>
            </div>
          </StudyActionCard>
        {/each}
      </section>
    {/if}
  </div>
{/if}

<style>
  .document-hub {
    width: min(100%, 96rem);
    margin: 0 auto;
    display: grid;
    gap: clamp(1.25rem, 2vw, 1.9rem);
  }

  .document-header {
    display: grid;
    gap: clamp(0.75rem, 1.1vw, 1rem);
  }

  .document-hub :global(.back-link) {
    justify-self: start;
    width: fit-content;
    padding-inline: 0;
    min-height: auto;
    border: 0;
    background: transparent;
    box-shadow: none;
    color: var(--ui-text-secondary);
    font-size: 0.95rem;
  }

  .document-hub :global(.back-link svg) {
    width: 1.15rem;
    height: 1.15rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.1;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .document-hub :global(.back-link:hover) {
    color: var(--ui-text-primary);
    transform: none;
  }

  .document-title-block {
    display: grid;
    gap: 0.65rem;
  }

  .document-title-block h1 {
    margin: 0;
    font-size: clamp(1.8rem, 1.45rem + 1vw, 2.55rem);
    line-height: 1.08;
    letter-spacing: -0.04em;
    color: var(--ui-text-primary);
    max-width: 26ch;
  }

  .document-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    align-items: center;
  }

  :global(.document-meta-badge) {
    min-height: 2.75rem;
    padding-inline: 1.05rem;
    border-radius: var(--ui-radius-md);
    font-size: 0.82rem;
    letter-spacing: 0;
  }

  :global(.document-meta-pill) {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
    padding: 0 1.05rem;
    border-radius: var(--ui-radius-md);
    background: color-mix(in srgb, var(--ui-surface-card) 84%, var(--ui-surface-secondary) 16%);
    box-shadow: none;
  }

  :global(.document-meta-pill .ui-meta-pill__value) {
    font-size: 0.82rem;
    color: var(--ui-text-secondary);
    font-weight: 500;
  }

  :global(.document-file-badge) {
    color: #ff6b6b;
    border-color: color-mix(in srgb, #ff6b6b 26%, var(--ui-border-default) 74%);
    background: color-mix(in srgb, #ff6b6b 10%, transparent);
  }

  h2 {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.02em;
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
    border-color: color-mix(in srgb, var(--destructive) 35%, var(--ui-border-default) 65%);
  }

  .document-hub :global(.processing-panel) {
    border-color: color-mix(in srgb, var(--info) 24%, var(--ui-border-default) 76%);
    background: color-mix(in srgb, var(--info) 8%, var(--ui-surface-card) 92%);
  }

  .features-grid {
    display: grid;
    gap: 1.25rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
  }

  .document-hub :global(.feature-card) {
    min-height: 23rem;
    height: 100%;
  }

  .feature-inline-error {
    margin-top: 0.7rem;
    color: var(--destructive);
    line-height: 1.5;
    font-size: 0.88rem;
  }

  :global(.feature-card .ui-study-action-card__actions .ui-button) {
    min-height: 3.4rem;
    font-size: 0.98rem;
    letter-spacing: -0.01em;
  }

  :global(.feature-card .ui-study-action-card__actions .ui-button[data-variant='primary']) {
    box-shadow: 0 10px 22px color-mix(in srgb, var(--ui-text-primary) 12%, transparent);
  }

  :global(.feature-card .ui-study-action-card__actions .ui-button[data-variant='secondary']) {
    background: color-mix(in srgb, var(--ui-surface-secondary) 46%, var(--ui-surface-card) 54%);
    color: var(--ui-text-primary);
    border-color: color-mix(in srgb, var(--ui-border-default) 82%, transparent);
    box-shadow: none;
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

    .document-title-block h1 {
      max-width: 100%;
    }
  }

  @media (max-width: 640px) {
    .features-grid {
      grid-template-columns: 1fr;
    }

    .document-title-block {
      gap: 0.6rem;
    }

    .document-title-block h1 {
      font-size: clamp(1.6rem, 7vw, 2rem);
    }
  }
</style>
