<script>
  import { onDestroy } from 'svelte';
  import { ArrowLeft, ClipboardCheck, FileText, Layers3, Sparkles } from '@lucide/svelte';
  import { formatDate, formatNumber, t } from '../lib/i18n/t.js';
  import PageLayout from '../lib/components/layout/PageLayout.svelte';
  import Badge from '../lib/components/ui/Badge.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import Card from '../lib/components/ui/Card.svelte';
  import PageHeader from '../lib/components/ui/PageHeader.svelte';
  import ProgressBar from '../lib/components/ui/ProgressBar.svelte';
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';
  import StudyActionCard from '../lib/components/ui/StudyActionCard.svelte';
  import DocumentDetailSkeleton from '../lib/components/ui/DocumentDetailSkeleton.svelte';
  import DocumentActivityView from '../lib/components/study/DocumentActivityView.svelte';
  import { getDocument, getJob, requestGeneration } from '../lib/api/studyHub.js';
  import { getDocumentFileTypeLabel } from '../lib/utils/fileType.js';
  import { getDocumentDisplayName } from '../lib/utils/documentName.js';
  import { clearStudyGenerationPlan, readStudyGenerationPlan, writeStudyGenerationPlan } from '../lib/utils/studyGenerationPlan.js';
  import { readPageCache, writePageCache } from '../stores/pageCache.js';

  export let documentId = '';
  export let studyTab = '';

  const POLL_INTERVAL_MS = 2500;
  const DOCUMENT_CACHE_TTL_MS = 5000;
  const DOCUMENT_CACHE_KEY = (id) => `page:study-document:${id}`;
  const ACTIVITY_TABS = new Set(['summary', 'flashcards', 'exam', 'exams']);
  const FEATURE_CONFIG = {
    summary: { titleKey: 'document.hub.features.summary', descriptionKey: 'document.hub.featureDescriptions.summary', openSection: 'summary', options: { length: 'medium' } },
    flashcards: { titleKey: 'document.hub.features.flashcards', descriptionKey: 'document.hub.featureDescriptions.flashcards', openSection: 'flashcards', options: { includeExplanations: false } },
    exam: { titleKey: 'document.hub.features.exam', descriptionKey: 'document.hub.featureDescriptions.exam', openSection: 'exam', options: { questionCount: 10 } },
  };
  const FEATURE_KEYS = Object.keys(FEATURE_CONFIG);

  let currentDocumentId = '';
  let documentData = null;
  let loading = true;
  let error = '';
  let pollTimer = null;
  let planSyncBusy = false;
  let extractionJob = null;
  let pendingGeneration = featureMap(false);
  let generationErrors = featureMap('');
  let generationJobs = featureMap(null);
  let plannedGeneration = featureMap(null);
  let lastRouteKey = '';
  let normalizedStudyTab = '';
  let isActivityRoute = false;
  let routeKey = '';
  let extractionStatus = 'failed';
  let plannedFeatureKeys = [];
  let featureCards = [];
  let hasRequestedGeneration = false;
  let hasActiveGeneration = false;
  let showProgressExperience = false;
  let compactProgress = { active: false, title: '', helper: '', progressValue: 0, indeterminate: true, progressText: '', selectedFeatures: [] };
  let documentTitle = '';
  let fileTypeBadge = '';
  let languageMeta = null;
  let uploadedMeta = null;
  let documentSubtitle = '';

  $: normalizedStudyTab = text(studyTab).toLowerCase();
  $: isActivityRoute = ACTIVITY_TABS.has(normalizedStudyTab);
  $: routeKey = `${documentId}:${normalizedStudyTab || 'hub'}`;
  $: extractionStatus = normalizeDocumentStatus(documentData?.processingStatus);
  $: {
    plannedGeneration;
    plannedFeatureKeys = FEATURE_KEYS.filter((featureKey) => Boolean(plannedGeneration[featureKey]));
  }
  $: {
    documentData;
    extractionStatus;
    pendingGeneration;
    generationErrors;
    generationJobs;
    plannedGeneration;
    featureCards = FEATURE_KEYS.map((featureKey) => buildFeatureCard(featureKey));
  }
  $: {
    documentData;
    plannedFeatureKeys;
    hasRequestedGeneration = FEATURE_KEYS.some((featureKey) => normalizeGenerationStatus(documentData?.generationState?.[featureKey]?.status) !== 'not_requested') || plannedFeatureKeys.length > 0;
  }
  $: hasActiveGeneration = featureCards.some((card) => card.phase === 'queued' || card.phase === 'generating');
  $: showProgressExperience = Boolean(documentData) && (extractionStatus === 'queued' || extractionStatus === 'processing' || hasActiveGeneration || plannedFeatureKeys.length > 0);
  $: {
    documentData;
    extractionStatus;
    extractionJob;
    featureCards;
    plannedGeneration;
    compactProgress = buildCompactProgress();
  }
  $: documentTitle = getDocumentDisplayName(documentData, t('document.hub.untitled'));
  $: fileTypeBadge = getDocumentFileTypeLabel(documentData);
  $: languageMeta = getLanguageMeta(documentData);
  $: uploadedMeta = getUploadedMeta(documentData);
  $: documentSubtitle = extractionStatus === 'failed'
    ? text(documentData?.processingError) || t('document.processingFailed')
    : showProgressExperience
      ? compactProgress.helper
      : !hasRequestedGeneration
        ? t('document.hub.readyToGenerateHint')
        : t('document.hub.readyHint');

  $: if (!isActivityRoute && documentId && documentId !== currentDocumentId) {
    currentDocumentId = documentId;
    resetState();
    hydrateGenerationPlan(documentId);
    const cached = getCachedDocumentState(documentId);
    if (cached?.loaded && cached?.documentData) {
      documentData = cached.documentData;
      pendingGeneration = cached.pendingGeneration ?? featureMap(false);
      generationErrors = cached.generationErrors ?? featureMap('');
      generationJobs = cached.generationJobs ?? featureMap(null);
      extractionJob = cached.extractionJob ?? null;
      loading = false;
    }
    void fetchDocumentState({ background: Boolean(cached?.loaded && cached?.documentData) });
  }

  $: if (documentId && routeKey !== lastRouteKey) {
    const previousRouteKey = lastRouteKey;
    lastRouteKey = routeKey;
    if (previousRouteKey && !isActivityRoute && documentId === currentDocumentId) {
      error = '';
      void fetchDocumentState({ background: Boolean(documentData) });
    }
  }

  $: if (!isActivityRoute && currentDocumentId && documentData && plannedFeatureKeys.length > 0) {
    void maybeStartPlannedGeneration();
  }

  onDestroy(clearPollTimer);

  function featureMap(initialValue) {
    return { summary: initialValue, flashcards: initialValue, exam: initialValue };
  }

  function text(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function normalizeDocumentStatus(value) {
    const normalized = text(value).toLowerCase();
    return ['queued', 'processing', 'complete', 'failed'].includes(normalized) ? normalized : 'failed';
  }

  function normalizeGenerationStatus(value) {
    const normalized = text(value).toLowerCase();
    return ['not_requested', 'queued', 'running', 'complete', 'failed'].includes(normalized) ? normalized : 'not_requested';
  }

  function normalizeJobStatus(value) {
    const normalized = text(value).toLowerCase();
    return ['queued', 'running', 'succeeded', 'failed'].includes(normalized) ? normalized : '';
  }

  function clampProgress(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(Math.round(parsed), 100)) : 0;
  }

  function formatProgressText(value) {
    const pct = clampProgress(value);
    return pct > 0 ? `${formatNumber(pct)}%` : '';
  }

  function normalizeJob(job) {
    return job?.id ? { id: job.id, status: normalizeJobStatus(job.status), progressPct: clampProgress(job.progressPct), errorMessage: text(job.errorMessage) } : null;
  }

  function isLoadingPhase(phase) {
    return phase === 'queued' || phase === 'generating';
  }

  function isFinalizingJob(job) {
    return clampProgress(job?.progressPct) >= 96 || normalizeJobStatus(job?.status) === 'succeeded';
  }

  function hydrateGenerationPlan(nextDocumentId) {
    const storedPlan = readStudyGenerationPlan(nextDocumentId);
    plannedGeneration = FEATURE_KEYS.reduce((acc, featureKey) => {
      acc[featureKey] = storedPlan?.features?.[featureKey] ?? null;
      return acc;
    }, {});
  }

  function persistGenerationPlan() {
    if (!currentDocumentId) return;
    const features = FEATURE_KEYS.reduce((acc, featureKey) => {
      if (plannedGeneration[featureKey]) acc[featureKey] = plannedGeneration[featureKey];
      return acc;
    }, {});
    if (Object.keys(features).length > 0) {
      writeStudyGenerationPlan(currentDocumentId, { features });
    } else {
      clearStudyGenerationPlan(currentDocumentId);
    }
  }

  function setPlannedFeature(featureKey, value) {
    plannedGeneration = { ...plannedGeneration, [featureKey]: value };
    persistGenerationPlan();
  }

  function setFeaturePending(featureKey, isPending) {
    pendingGeneration = { ...pendingGeneration, [featureKey]: isPending };
  }

  function setFeatureError(featureKey, message = '') {
    generationErrors = { ...generationErrors, [featureKey]: message };
  }

  function setGenerationJob(featureKey, job) {
    generationJobs = { ...generationJobs, [featureKey]: job };
  }

  function hasFeatureContent(featureKey, document = documentData) {
    if (featureKey === 'summary') return text(document?.summary).length > 0;
    if (featureKey === 'flashcards') return Array.isArray(document?.flashcards) && document.flashcards.length > 0;
    return Array.isArray(document?.examQuestions) && document.examQuestions.length > 0;
  }

  function getFeaturePhase(featureKey) {
    const generationStatus = normalizeGenerationStatus(documentData?.generationState?.[featureKey]?.status);
    if (hasFeatureContent(featureKey) || generationStatus === 'complete') return 'ready';
    if (generationStatus === 'failed') return 'failed';
    if (extractionStatus === 'failed') return 'failed';
    if (pendingGeneration[featureKey] || generationStatus === 'running') return 'generating';
    if (generationStatus === 'queued' || plannedGeneration[featureKey]) return 'queued';
    return 'not_requested';
  }

  function getFeatureStatusLabel(phase) {
    if (phase === 'ready') return t('status.ready');
    if (phase === 'queued') return t('document.hub.loading.preparing');
    if (phase === 'generating') return t('document.hub.states.generating');
    if (phase === 'failed') return t('status.failed');
    return t('document.hub.states.notRequested');
  }

  function getFeatureTone(phase) {
    if (phase === 'ready') return 'ready';
    if (phase === 'failed') return 'failed';
    if (phase === 'queued' || phase === 'generating') return 'processing';
    return 'info';
  }

  function getFeaturePrimaryLabel(featureKey, phase) {
    if (phase === 'ready') return featureKey === 'flashcards' ? t('document.activity.actions.startFlashcards') : t('document.hub.actions.open');
    return t('document.actions.generate');
  }

  function getFeatureProgress(phase, job, extractionBlocked) {
    if (!isLoadingPhase(phase)) return { visible: false, value: 0, indeterminate: false, text: '' };
    if (job?.progressPct > 0) return { visible: true, value: clampProgress(job.progressPct), indeterminate: false, text: formatProgressText(job.progressPct) };
    return { visible: true, value: extractionBlocked ? 8 : 24, indeterminate: true, text: '' };
  }

  function getFeatureLoadingLabel(featureKey, phase, { compact = false, extractionBlocked = extractionStatus !== 'complete', job = generationJobs[featureKey] } = {}) {
    if (!isLoadingPhase(phase)) return '';
    if (extractionBlocked) return compact ? t('document.hub.loading.preparingDocument') : t('document.hub.loading.preparing');
    if (isFinalizingJob(job)) {
      return compact
        ? t('document.hub.loading.finalizingFeature', { feature: t(FEATURE_CONFIG[featureKey].titleKey) })
        : t('document.hub.loading.finalizing');
    }
    if (phase === 'queued') {
      return compact
        ? t('document.hub.loading.preparingFeature', { feature: t(FEATURE_CONFIG[featureKey].titleKey) })
        : t('document.hub.loading.preparing');
    }
    return compact
      ? t('document.hub.loading.generatingFeature', { feature: t(FEATURE_CONFIG[featureKey].titleKey) })
      : t('document.hub.states.generating');
  }

  function getFeatureStatusCopy(phase, errorMessage) {
    if (phase === 'failed') return errorMessage || text(documentData?.processingError) || t('document.generation.failedNoContent');
    if (phase === 'queued' && extractionStatus !== 'complete') return t('document.hub.loading.preparingDocumentHint');
    if (phase === 'queued') return t('document.hub.loading.preparingFeatureHint');
    if (phase === 'generating') return t('document.hub.loading.generatingHint');
    if (phase === 'ready') return t('document.hub.readyHint');
    if (extractionStatus !== 'complete') return t('document.hub.states.waitingForExtraction');
    return t('document.hub.readyToGenerateHint');
  }

  function buildFeatureCard(featureKey) {
    const phase = getFeaturePhase(featureKey);
    const generationStatus = normalizeGenerationStatus(documentData?.generationState?.[featureKey]?.status);
    const errorMessage = text(generationErrors?.[featureKey]) || text(documentData?.generationState?.[featureKey]?.errorMessage);
    const progress = getFeatureProgress(phase, generationJobs[featureKey], extractionStatus !== 'complete');
    return {
      key: featureKey,
      title: t(FEATURE_CONFIG[featureKey].titleKey),
      description: t(FEATURE_CONFIG[featureKey].descriptionKey),
      phase,
      stateLabel: getFeatureStatusLabel(phase),
      stateTone: getFeatureTone(phase),
      primaryLabel: getFeaturePrimaryLabel(featureKey, phase),
      canPrimaryAction: phase !== 'queued' && phase !== 'generating',
      shouldRegenerate: hasFeatureContent(featureKey) || generationStatus === 'complete',
      statusCopy: getFeatureStatusCopy(phase, errorMessage),
      errorMessage: phase === 'failed' ? errorMessage : '',
      progressVisible: progress.visible,
      progressValue: progress.value,
      progressIndeterminate: progress.indeterminate,
      progressText: progress.text,
      loadingLabel: getFeatureLoadingLabel(featureKey, phase),
    };
  }

  function buildCompactProgress() {
    const inactive = { active: false, title: '', helper: '', progressValue: 0, indeterminate: true, progressText: '', selectedFeatures: [] };
    if (!documentData || extractionStatus === 'failed') return inactive;

    const selectedFeatures = FEATURE_KEYS
      .filter((featureKey) => plannedGeneration[featureKey] || isLoadingPhase(getFeaturePhase(featureKey)))
      .map((featureKey) => ({
        key: featureKey,
        title: t(FEATURE_CONFIG[featureKey].titleKey),
        phase: getFeaturePhase(featureKey),
      }));

    if (extractionStatus === 'queued' || extractionStatus === 'processing') {
      const progressPct = clampProgress(extractionJob?.progressPct);
      const finalizing = isFinalizingJob(extractionJob) && extractionStatus !== 'complete';
      return {
        active: true,
        title: finalizing ? t('document.hub.loading.finalizing') : t('document.hub.loading.extractingDocument'),
        helper: selectedFeatures.length > 0
          ? t('document.hub.loading.selectedFeatures', { features: selectedFeatures.map((feature) => feature.title).join(' / ') })
          : t('document.hub.processing.extractingBody'),
        progressValue: progressPct || 14,
        indeterminate: progressPct === 0,
        progressText: formatProgressText(progressPct),
        selectedFeatures,
      };
    }

    const activeFeatures = featureCards.filter((card) => isLoadingPhase(card.phase));
    if (activeFeatures.length === 0) return inactive;

    const leadFeature = activeFeatures.find((card) => card.phase === 'generating') || activeFeatures[0];
    return {
      active: true,
      title: activeFeatures.length === 1
        ? getFeatureLoadingLabel(leadFeature.key, leadFeature.phase, { compact: true })
        : t('document.hub.loading.generatingSelected'),
      helper: t('document.hub.loading.selectedFeatures', { features: activeFeatures.map((card) => card.title).join(' / ') }),
      progressValue: leadFeature.progressValue,
      indeterminate: leadFeature.progressIndeterminate,
      progressText: leadFeature.progressText,
      selectedFeatures: activeFeatures.map((card) => ({ key: card.key, title: card.title, phase: card.phase })),
    };
  }

  function getUploadedMeta(document) {
    const uploadDate = document?.uploadDate || document?.createdAt;
    const parsed = uploadDate ? new Date(uploadDate) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? { label: t('document.uploaded'), value: formatDate(parsed) } : null;
  }

  function getLanguageMeta(document) {
    const language = text(document?.language).toLowerCase();
    if (!language) return null;
    return { label: t('documentsPage.labels.language'), value: language === 'arabic' ? t('language.arabic') : t('language.english') };
  }

  function featureIcon(featureKey) {
    if (featureKey === 'summary') return FileText;
    if (featureKey === 'flashcards') return Layers3;
    return ClipboardCheck;
  }

  function clearPollTimer() {
    if (pollTimer) clearTimeout(pollTimer);
    pollTimer = null;
  }

  function schedulePoll() {
    clearPollTimer();
    pollTimer = setTimeout(() => void fetchDocumentState({ background: true }), POLL_INTERVAL_MS);
  }

  function shouldPollDocument(document) {
    if (!document) return false;
    if (['queued', 'processing'].includes(normalizeDocumentStatus(document?.processingStatus))) return true;
    if (FEATURE_KEYS.some((featureKey) => ['queued', 'running'].includes(normalizeGenerationStatus(document?.generationState?.[featureKey]?.status)))) return true;
    return FEATURE_KEYS.some((featureKey) => pendingGeneration[featureKey] || plannedGeneration[featureKey]);
  }

  function syncPendingState(nextDocument) {
    const nextPending = { ...pendingGeneration };
    const nextErrors = { ...generationErrors };
    let nextPlanned = plannedGeneration;

    for (const featureKey of FEATURE_KEYS) {
      const generationStatus = normalizeGenerationStatus(nextDocument?.generationState?.[featureKey]?.status);
      const hasContent = hasFeatureContent(featureKey, nextDocument);
      if (nextPending[featureKey] && (generationStatus !== 'not_requested' || hasContent)) {
        nextPending[featureKey] = false;
        nextErrors[featureKey] = '';
      }
      if (nextPlanned[featureKey] && (generationStatus !== 'not_requested' || hasContent)) {
        nextPlanned = { ...nextPlanned, [featureKey]: null };
      }
    }

    pendingGeneration = nextPending;
    generationErrors = nextErrors;
    plannedGeneration = nextPlanned;
    persistGenerationPlan();
  }

  function resetState() {
    clearPollTimer();
    lastRouteKey = '';
    documentData = null;
    loading = true;
    error = '';
    planSyncBusy = false;
    extractionJob = null;
    pendingGeneration = featureMap(false);
    generationErrors = featureMap('');
    generationJobs = featureMap(null);
    plannedGeneration = featureMap(null);
  }

  function getCachedDocumentState(documentId) {
    const cached = readPageCache(DOCUMENT_CACHE_KEY(documentId));
    if (!cached?.loaded || !cached?.documentData) return null;
    const cachedAt = Number(cached.cachedAt || 0);
    if (!Number.isFinite(cachedAt) || (Date.now() - cachedAt) > DOCUMENT_CACHE_TTL_MS) {
      return null;
    }
    return cached;
  }

  async function refreshLiveJobs(nextDocument) {
    const jobs = [];
    const keys = [];
    const extractionJobId = text(nextDocument?.processingJobId);
    if (extractionJobId) {
      jobs.push(getJob(extractionJobId).catch(() => null));
      keys.push('extraction');
    } else {
      extractionJob = null;
    }

    let nextGenerationJobs = { ...generationJobs };
    for (const featureKey of FEATURE_KEYS) {
      const jobId = text(nextDocument?.generationState?.[featureKey]?.jobId);
      if (!jobId) {
        nextGenerationJobs[featureKey] = null;
        continue;
      }
      jobs.push(getJob(jobId).catch(() => null));
      keys.push(featureKey);
    }

    if (jobs.length === 0) {
      generationJobs = nextGenerationJobs;
      return;
    }

    const results = await Promise.all(jobs);
    results.forEach((job, index) => {
      const normalizedJob = normalizeJob(job);
      const key = keys[index];
      if (key === 'extraction') {
        extractionJob = normalizedJob;
      } else {
        nextGenerationJobs[key] = normalizedJob;
      }
    });
    generationJobs = nextGenerationJobs;
  }

  async function fetchDocumentState({ background = false } = {}) {
    if (!currentDocumentId) return;
    if (!background) {
      loading = true;
      error = '';
    }

    clearPollTimer();

    try {
      const requestedId = currentDocumentId;
      const response = await getDocument(requestedId);
      if (requestedId !== currentDocumentId) return;

      documentData = response?.document ?? null;
      syncPendingState(documentData);
      if (documentData) {
        await refreshLiveJobs(documentData);
        writePageCache(DOCUMENT_CACHE_KEY(requestedId), { loaded: true, documentData, pendingGeneration, generationErrors, generationJobs, extractionJob });
      }

      if (!documentData) {
        error = t('document.notFound');
        return;
      }

      if (shouldPollDocument(documentData)) schedulePoll();
    } catch (err) {
      const message = text(err?.message) || t('document.loadingError');
      if (!background) {
        error = message;
      } else if (documentData && shouldPollDocument(documentData)) {
        schedulePoll();
      }
    } finally {
      if (!background) loading = false;
    }
  }

  async function generateFeature(featureKey, { regenerate = false, options = null } = {}) {
    if (!currentDocumentId || normalizeDocumentStatus(documentData?.processingStatus) !== 'complete') return false;

    setFeatureError(featureKey, '');
    setFeaturePending(featureKey, true);

    try {
      const response = await requestGeneration(currentDocumentId, {
        type: featureKey,
        options: options ?? FEATURE_CONFIG[featureKey].options,
        regenerate,
      });
      setGenerationJob(featureKey, normalizeJob({ id: response?.jobId || response?.generation?.jobId, status: response?.generationStatus || response?.generation?.status || 'queued', progressPct: 0 }));
      await fetchDocumentState({ background: true });
      return true;
    } catch (err) {
      setFeaturePending(featureKey, false);
      setFeatureError(featureKey, text(err?.message) || t('document.generation.requestFailed'));
      return false;
    }
  }

  async function maybeStartPlannedGeneration() {
    if (planSyncBusy || extractionStatus !== 'complete' || plannedFeatureKeys.length === 0) return;
    planSyncBusy = true;
    try {
      for (const featureKey of FEATURE_KEYS) {
        const plan = plannedGeneration[featureKey];
        if (!plan) continue;
        if (normalizeGenerationStatus(documentData?.generationState?.[featureKey]?.status) !== 'not_requested' || hasFeatureContent(featureKey)) {
          setPlannedFeature(featureKey, null);
          continue;
        }
        await generateFeature(featureKey, { options: plan.options ?? FEATURE_CONFIG[featureKey].options });
        setPlannedFeature(featureKey, null);
      }
    } finally {
      planSyncBusy = false;
    }
  }

  function openFeature(featureKey) {
    window.location.hash = `/study/${currentDocumentId}/${FEATURE_CONFIG[featureKey].openSection}`;
  }

  async function runPrimaryAction(card) {
    if (!card?.canPrimaryAction) return;
    if (card.phase === 'ready') {
      openFeature(card.key);
      return;
    }
    if (card.phase === 'not_requested' || card.phase === 'failed') {
      if (normalizeDocumentStatus(documentData?.processingStatus) !== 'complete') {
        await fetchDocumentState({ background: Boolean(documentData) });
        if (normalizeDocumentStatus(documentData?.processingStatus) !== 'complete') {
          setFeatureError(
            card.key,
            normalizeDocumentStatus(documentData?.processingStatus) === 'failed'
              ? text(documentData?.processingError) || t('document.processingFailed')
              : t('document.hub.states.waitingForExtraction'),
          );
          return;
        }
      }
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
  <PageLayout class="document-hub" width="wide">
    <Button type="button" className="back-link" variant="ghost" size="sm" on:click={goBackToLibrary}>
      <span slot="icon" aria-hidden="true"><ArrowLeft class="rtl-flip" /></span>
      {t('document.hub.backToStudyHub')}
    </Button>

    <PageHeader className="document-header" eyebrow={t('nav.study')} title={documentTitle} subtitle={documentSubtitle}>
      <div slot="meta" class="document-meta">
        {#if fileTypeBadge}<Badge tone="destructive" variant="outline" size="sm" className="document-meta-badge">{fileTypeBadge}</Badge>{/if}
        {#if languageMeta}<span class="document-meta-pill">{languageMeta.value}</span>{/if}
        {#if uploadedMeta}<span class="document-meta-pill">{uploadedMeta.label} {uploadedMeta.value}</span>{/if}
      </div>
    </PageHeader>

    {#if loading && !documentData}
      <DocumentDetailSkeleton />
    {:else if !documentData}
      <Card as="section" class="state-panel state-panel-error" variant="base" padding="md" border="strong">
        <h2>{t('document.processingFailedTitle')}</h2>
        <p>{error || t('document.notFound')}</p>
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
          <p>{text(documentData?.processingError) || t('document.processingFailed')}</p>
          <p>{t('document.hub.processing.continues')}</p>
        </Card>
      {:else if compactProgress.active}
        <Card as="section" class="generation-strip" variant="standard" padding="md" border="default">
          <div class="generation-strip__summary" aria-live="polite">
            <p class="generation-strip__eyebrow">{t('document.hub.statusTitle')}</p>
            <div class="generation-strip__headline">
              <h2>{compactProgress.title}</h2>
              {#if compactProgress.progressText}
                <span class="generation-strip__percent">{compactProgress.progressText}</span>
              {/if}
            </div>
            {#if compactProgress.helper}
              <p class="generation-strip__helper">{compactProgress.helper}</p>
            {/if}
          </div>

          <ProgressBar
            value={compactProgress.progressValue}
            max={100}
            indeterminate={compactProgress.indeterminate}
            ariaLabel={compactProgress.title}
            className="generation-strip__bar"
          />

          {#if compactProgress.selectedFeatures.length > 0}
            <div class="generation-strip__chips" aria-label={t('document.hub.featuresTitle')}>
              {#each compactProgress.selectedFeatures as feature (feature.key)}
                <span class={`generation-strip__chip generation-strip__chip--${feature.phase}`.trim()}>{feature.title}</span>
              {/each}
            </div>
          {/if}
        </Card>
      {/if}

      <section class="features-grid" aria-label={t('document.hub.featuresTitle')}>
        {#each featureCards as card (card.key)}
          {@const Icon = featureIcon(card.key)}
          <StudyActionCard class="feature-card" title={card.title} status={card.stateTone} statusLabel={card.stateLabel}>
            <div slot="icon"><Icon /></div>

            <svelte:fragment slot="description">
              <p>{card.description}</p>
              <p class="feature-support-copy">{card.statusCopy}</p>
              {#if card.errorMessage}<p class="feature-inline-error">{card.errorMessage}</p>{/if}
            </svelte:fragment>

            <div slot="actions" class="feature-actions">
              {#if card.progressVisible}
                <div
                  class={`feature-action-loading feature-action-loading--${card.phase}`.trim()}
                  role="status"
                  aria-live="polite"
                  aria-label={`${card.title} ${card.loadingLabel}`}
                >
                  <div class="feature-action-loading__meta">
                    <span class="feature-action-loading__label">{card.loadingLabel}</span>
                    {#if card.progressText}
                      <span class="feature-action-loading__value">{card.progressText}</span>
                    {/if}
                  </div>
                  <ProgressBar
                    value={card.progressValue}
                    max={100}
                    indeterminate={card.progressIndeterminate}
                    ariaLabel={`${card.title} ${card.loadingLabel}`}
                    className="feature-action-loading__bar"
                  />
                </div>
              {:else}
                <Button type="button" variant={card.phase === 'ready' ? 'primary' : 'secondary'} className="feature-action-button" on:click={() => runPrimaryAction(card)} disabled={!card.canPrimaryAction}>
                  <span slot="icon" aria-hidden="true"><Sparkles /></span>
                  {card.primaryLabel}
                </Button>
              {/if}
            </div>
          </StudyActionCard>
        {/each}
      </section>
    {/if}
  </PageLayout>
{/if}

<style>
  :global(.document-hub){display:grid;gap:var(--study-flow-page-gap)}
  :global(.document-hub .back-link){justify-self:start;width:fit-content;padding-inline:0;min-height:0;border:0;background:transparent;box-shadow:none;color:var(--ui-text-secondary);font-size:.875rem;font-weight:500}
  :global(.document-hub .back-link svg){width:1.15rem;height:1.15rem;fill:none;stroke:currentColor;stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round}
  :global(.document-hub .back-link:hover){color:var(--ui-text-primary);transform:none}
  .document-meta{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center}
  :global(.document-meta-badge){min-height:var(--study-flow-chip-min-height);padding-inline:var(--study-flow-chip-padding-inline);border-radius:var(--study-flow-chip-radius);font-size:.75rem;letter-spacing:0}
  .document-meta-pill{display:inline-flex;align-items:center;min-height:var(--study-flow-chip-min-height);padding:0 var(--study-flow-chip-padding-inline);border-radius:var(--study-flow-chip-radius);border:1px solid var(--ui-border-default);background:color-mix(in srgb,var(--ui-surface-secondary) 50%,transparent);color:var(--ui-text-secondary);font-size:.75rem;font-weight:500}
  h2{margin:0;color:var(--ui-text-primary);font-size:1rem;font-weight:600;line-height:1.2;letter-spacing:-.02em}
  :global(.document-hub .state-panel){display:grid;gap:var(--space-2)}
  :global(.document-hub .state-panel h2),:global(.document-hub .state-panel p){margin:0}
  :global(.document-hub .state-panel p){color:var(--muted-foreground);line-height:1.45;font-size:var(--font-size-sm)}
  :global(.document-hub .state-panel-error){border-color:color-mix(in srgb,var(--destructive) 35%,var(--ui-border-default) 65%)}
  .row{display:flex;justify-content:space-between;align-items:flex-start;gap:var(--space-3);flex-wrap:wrap}
  .generation-strip{
    display:grid;
    gap:.8rem;
    border-color:color-mix(in srgb,var(--ui-text-primary) 10%,var(--ui-border-default) 90%);
    background:linear-gradient(180deg,color-mix(in srgb,var(--ui-surface-card) 94%,transparent),color-mix(in srgb,var(--ui-surface-secondary) 78%,transparent));
    box-shadow:none;
    --ui-progress-track:color-mix(in srgb,var(--ui-surface-secondary) 78%,black 22%);
    --ui-progress-fill:linear-gradient(90deg,rgba(255,255,255,.96),rgba(209,213,219,.84),rgba(255,255,255,.96));
  }
  .generation-strip__summary{display:grid;gap:.35rem;min-width:0}
  .generation-strip__eyebrow{margin:0;color:var(--ui-text-muted);font-size:.72rem;font-weight:650;letter-spacing:.1em;text-transform:uppercase}
  .generation-strip__headline{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;flex-wrap:wrap}
  .generation-strip__headline h2{font-size:1rem}
  .generation-strip__helper,.feature-support-copy{margin:0;color:var(--ui-text-secondary);line-height:1.5;font-size:.88rem}
  .generation-strip__percent,
  .feature-action-loading__value{
    color:var(--ui-text-primary);
    font-size:.82rem;
    font-weight:700;
    font-variant-numeric:tabular-nums;
    direction:ltr;
    unicode-bidi:plaintext;
  }
  :global(.generation-strip__bar){height:.42rem}
  .generation-strip__chips{display:flex;flex-wrap:wrap;gap:.45rem}
  .generation-strip__chip{
    display:inline-flex;
    align-items:center;
    min-height:1.65rem;
    padding:0 .65rem;
    border-radius:999px;
    border:1px solid color-mix(in srgb,var(--ui-text-primary) 10%,var(--ui-border-default) 90%);
    background:color-mix(in srgb,var(--ui-surface-card) 90%,var(--ui-surface-secondary) 10%);
    color:var(--ui-text-secondary);
    font-size:.75rem;
    font-weight:600;
    letter-spacing:.01em;
  }
  .generation-strip__chip--generating,
  .generation-strip__chip--queued{color:var(--ui-text-primary);border-color:color-mix(in srgb,var(--ui-text-primary) 14%,var(--ui-border-default) 86%)}
  .features-grid{display:grid;gap:var(--study-flow-card-gap);grid-template-columns:repeat(3,minmax(0,1fr));align-items:stretch}
  :global(.feature-card){min-height:0}
  .feature-inline-error,:global(.inline-error){color:var(--destructive)}
  .feature-inline-error,.feature-support-copy{margin-top:.35rem;font-size:.8125rem;line-height:1.5}
  .feature-actions{position:relative;z-index:1}
  .feature-action-loading{
    display:grid;
    gap:.5rem;
    min-height:var(--ui-control-height-md);
    padding:.8rem .9rem;
    border-radius:var(--ui-radius-sm);
    border:1px solid color-mix(in srgb,var(--ui-text-primary) 12%,var(--ui-border-default) 88%);
    background:color-mix(in srgb,var(--ui-surface-secondary) 82%,black 18%);
    color:var(--ui-text-primary);
    box-shadow:none;
    --ui-progress-track:color-mix(in srgb,var(--ui-surface-secondary) 74%,black 26%);
    --ui-progress-fill:linear-gradient(90deg,rgba(255,255,255,.96),rgba(209,213,219,.82),rgba(255,255,255,.96));
    animation:feature-action-pulse 1.4s ease-in-out infinite;
  }
  .feature-action-loading__meta{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:.75rem;
    min-width:0;
  }
  .feature-action-loading__label{
    min-width:0;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    color:var(--ui-text-primary);
    font-size:.82rem;
    font-weight:650;
  }
  :global(.feature-action-loading__bar){height:.36rem}
  :global(.feature-action-button.ui-button){--button-shadow:none}
  :global(.feature-action-button .ui-button__icon svg){fill:none;stroke:currentColor;stroke-width:2}
  @keyframes feature-action-pulse{
    0%,100%{border-color:color-mix(in srgb,var(--ui-text-primary) 10%,var(--ui-border-default) 90%);background:color-mix(in srgb,var(--ui-surface-secondary) 82%,black 18%)}
    50%{border-color:color-mix(in srgb,var(--ui-text-primary) 16%,var(--ui-border-default) 84%);background:color-mix(in srgb,var(--ui-surface-secondary) 88%,black 12%)}
  }
  :global(html[dir='rtl']) .generation-strip__headline,
  :global(html[dir='rtl']) .feature-action-loading__meta{align-items:flex-start}
  @media (max-width:1024px){.features-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media (max-width:640px){
    .features-grid{grid-template-columns:1fr}
    .document-meta{align-items:stretch}
    .generation-strip__headline,
    .feature-action-loading__meta{flex-direction:column;align-items:flex-start}
  }
</style>
