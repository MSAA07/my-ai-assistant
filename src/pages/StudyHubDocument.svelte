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
  const VISUAL_PROGRESS_PHASES = {
    queued: { seed: 2, cap: 9, velocity: 1.35, easing: 0.1, minStep: 0.08 },
    preparing: { seed: 6, cap: 24, velocity: 1.2, easing: 0.09, minStep: 0.1 },
    generating: { seed: 18, cap: 92, velocity: 1.45, easing: 0.07, minStep: 0.12 },
    finalizing: { seed: 90, cap: 96, velocity: 0.85, easing: 0.14, minStep: 0.08 },
    completed: { seed: 100, cap: 100, velocity: 0, easing: 0.3, minStep: 0.7 },
  };

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
  let displayedProgress = featureMap(0);
  let progressRuntime = createProgressRuntimeMap();
  let completionFlashUntil = featureMap(0);
  let previousFeaturePhases = featureMap('not_requested');
  let progressAnimationFrame = null;
  let progressAnimationLastTime = 0;
  let lastRouteKey = '';
  let normalizedStudyTab = '';
  let isActivityRoute = false;
  let routeKey = '';
  let extractionStatus = 'failed';
  let plannedFeatureKeys = [];
  let featureCards = [];
  let hasRequestedGeneration = false;
  let hasActiveGeneration = false;
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
    displayedProgress;
    completionFlashUntil;
    featureCards = FEATURE_KEYS.map((featureKey) => buildFeatureCard(featureKey));
  }
  $: {
    documentData;
    plannedFeatureKeys;
    hasRequestedGeneration = FEATURE_KEYS.some((featureKey) => normalizeGenerationStatus(documentData?.generationState?.[featureKey]?.status) !== 'not_requested') || plannedFeatureKeys.length > 0;
  }
  $: hasActiveGeneration = featureCards.some((card) => card.phase === 'queued' || card.phase === 'generating');
  $: hasFailedGeneration = featureCards.some((card) => card.phase === 'failed' && card.errorMessage);
  $: if (!isActivityRoute) {
    documentData;
    extractionStatus;
    pendingGeneration;
    generationJobs;
    plannedGeneration;
    syncFeatureProgressVisuals();
  }
  $: documentTitle = getDocumentDisplayName(documentData, t('document.hub.untitled'));
  $: fileTypeBadge = getDocumentFileTypeLabel(documentData);
  $: languageMeta = getLanguageMeta(documentData);
  $: uploadedMeta = getUploadedMeta(documentData);
  $: documentSubtitle = extractionStatus === 'failed'
    ? text(documentData?.processingError) || t('document.processingFailed')
    : isExtractionActive(extractionStatus)
      ? t('document.hub.processing.extractingBody')
      : hasActiveGeneration
        ? t('document.hub.generationRunning')
        : hasFailedGeneration
          ? t('document.hub.generationFailed')
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

  onDestroy(() => {
    clearPollTimer();
    stopProgressAnimation();
  });

  function featureMap(initialValue) {
    return { summary: initialValue, flashcards: initialValue, exam: initialValue };
  }

  function createProgressRuntimeMap() {
    return FEATURE_KEYS.reduce((acc, featureKey) => {
      acc[featureKey] = createProgressRuntimeState();
      return acc;
    }, {});
  }

  function createProgressRuntimeState(overrides = {}) {
    return {
      runKey: '',
      visualPhase: 'idle',
      startedAt: 0,
      phaseEnteredAt: 0,
      lastActualProgress: 0,
      lastActualProgressAt: 0,
      ...overrides,
    };
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
    return Number.isFinite(parsed) ? Math.max(0, Math.min(parsed, 100)) : 0;
  }

  function formatProgressText(value) {
    const pct = Math.round(clampProgress(value));
    return pct > 0 ? `${formatNumber(pct)}%` : '';
  }

  function normalizeJob(job) {
    return job?.id ? { id: job.id, status: normalizeJobStatus(job.status), progressPct: clampProgress(job.progressPct), errorMessage: text(job.errorMessage) } : null;
  }

  function nowMs() {
    return Date.now();
  }

  function isLoadingPhase(phase) {
    return phase === 'queued' || phase === 'generating';
  }

  function isFinalizingJob(job) {
    return clampProgress(job?.progressPct) >= 92 || normalizeJobStatus(job?.status) === 'succeeded';
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

  function isExtractionActive(status) {
    return status === 'queued' || status === 'processing';
  }

  function getFeatureStatusLabel(featureKey, phase) {
    if (phase === 'ready') return t('status.ready');
    if (phase === 'queued') {
      return extractionStatus === 'complete' && normalizeGenerationStatus(documentData?.generationState?.[featureKey]?.status) === 'queued'
        ? t('status.queued')
        : t('document.hub.states.preparing');
    }
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

  function getFeatureVisualPhase(featureKey, phase = getFeaturePhase(featureKey), { extractionBlocked = extractionStatus !== 'complete', job = generationJobs[featureKey] } = {}) {
    if (phase === 'ready') return 'completed';
    if (!isLoadingPhase(phase)) return 'idle';
    if (extractionBlocked) return 'preparing';
    if (isFinalizingJob(job)) return 'finalizing';
    if (phase === 'queued') return 'queued';
    return 'generating';
  }

  function getFeatureRunKey(featureKey, { phase, generationStatus, job, extractionBlocked }) {
    if (!isLoadingPhase(phase)) return '';
    const jobId = text(job?.id);
    if (jobId) return `${featureKey}:${jobId}`;
    if (plannedGeneration[featureKey]) return `${featureKey}:planned`;
    if (pendingGeneration[featureKey]) return `${featureKey}:pending`;
    if (generationStatus === 'running' || generationStatus === 'queued') return `${featureKey}:generation`;
    if (extractionBlocked) return `${featureKey}:preparing:${currentDocumentId || documentId || 'unknown'}`;
    return `${featureKey}:active`;
  }

  function getFeatureProgressState(featureKey) {
    const phase = getFeaturePhase(featureKey);
    const extractionBlocked = extractionStatus !== 'complete';
    const generationStatus = normalizeGenerationStatus(documentData?.generationState?.[featureKey]?.status);
    const job = generationJobs[featureKey];
    const visualPhase = getFeatureVisualPhase(featureKey, phase, { extractionBlocked, job });
    const actualProgressPct = isLoadingPhase(phase) ? clampProgress(job?.progressPct) : phase === 'ready' ? 100 : 0;
    const hasReliableProgress = actualProgressPct > 0 || visualPhase === 'preparing' || visualPhase === 'generating' || visualPhase === 'finalizing';
    const safeVisualCapByPhase = (VISUAL_PROGRESS_PHASES[visualPhase] ?? VISUAL_PROGRESS_PHASES.queued).cap;
    return {
      phase,
      visible: isLoadingPhase(phase),
      indeterminate: isLoadingPhase(phase) && !hasReliableProgress,
      actualProgressPct,
      displayedProgressPct: clampProgress(displayedProgress[featureKey]),
      extractionBlocked,
      generationStatus,
      job,
      visualPhase,
      safeVisualCapByPhase,
      runKey: getFeatureRunKey(featureKey, { phase, generationStatus, job, extractionBlocked }),
    };
  }

  function getFeatureProgressSeed(progressState) {
    const phaseConfig = VISUAL_PROGRESS_PHASES[progressState.visualPhase] ?? VISUAL_PROGRESS_PHASES.queued;
    if (progressState.actualProgressPct > 0) {
      const safeActualFloor = progressState.phase === 'ready'
        ? 100
        : Math.min(progressState.actualProgressPct, progressState.safeVisualCapByPhase);
      return safeActualFloor;
    }
    return Math.min(phaseConfig.seed, progressState.safeVisualCapByPhase);
  }

  function getFeatureVisualProgressTarget(featureKey, timestamp = nowMs()) {
    const progressState = getFeatureProgressState(featureKey);
    if (!progressState.visible || progressState.indeterminate) return null;
    if (progressState.phase === 'ready') return 100;

    const phaseConfig = VISUAL_PROGRESS_PHASES[progressState.visualPhase] ?? VISUAL_PROGRESS_PHASES.queued;
    const runtime = progressRuntime[featureKey] ?? createProgressRuntimeState();
    const runElapsedSeconds = runtime.startedAt > 0 ? Math.max(0, (timestamp - runtime.startedAt) / 1000) : 0;
    const phaseElapsedSeconds = runtime.phaseEnteredAt > 0 ? Math.max(0, (timestamp - runtime.phaseEnteredAt) / 1000) : runElapsedSeconds;
    const safeActualFloor = progressState.phase === 'ready'
      ? 100
      : Math.min(progressState.actualProgressPct, progressState.safeVisualCapByPhase);

    let target = Math.max(safeActualFloor, phaseConfig.seed + runElapsedSeconds * phaseConfig.velocity);
    if (progressState.visualPhase === 'finalizing') {
      target = Math.max(target, phaseConfig.seed + phaseElapsedSeconds * phaseConfig.velocity);
    }

    return Math.min(Math.max(target, safeActualFloor), progressState.safeVisualCapByPhase);
  }

  function getFeatureLoadingLabel(featureKey, phase, { compact = false, extractionBlocked = extractionStatus !== 'complete', job = generationJobs[featureKey] } = {}) {
    if (!isLoadingPhase(phase)) return '';
    if (extractionBlocked) return compact ? t('document.hub.loading.preparingDocument') : t('document.hub.states.preparing');
    if (isFinalizingJob(job)) {
      return compact
        ? t('document.hub.loading.finalizingFeature', { feature: t(FEATURE_CONFIG[featureKey].titleKey) })
        : t('document.hub.loading.finalizing');
    }
    if (phase === 'queued') {
      return compact
        ? t('document.hub.loading.preparingFeature', { feature: t(FEATURE_CONFIG[featureKey].titleKey) })
        : t('status.queued');
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
    const progress = getFeatureProgressState(featureKey);
    const completionVisible = (completionFlashUntil[featureKey] || 0) > nowMs();
    const visualProgressValue = completionVisible ? 100 : clampProgress(displayedProgress[featureKey]);
    const progressVisible = completionVisible || progress.visible;
    const progressIndeterminate = completionVisible ? false : progress.indeterminate;
    const progressText = completionVisible ? formatProgressText(100) : progressIndeterminate ? '' : formatProgressText(visualProgressValue);
    return {
      key: featureKey,
      title: t(FEATURE_CONFIG[featureKey].titleKey),
      description: t(FEATURE_CONFIG[featureKey].descriptionKey),
      phase,
      stateLabel: getFeatureStatusLabel(featureKey, phase),
      stateTone: getFeatureTone(phase),
      primaryLabel: getFeaturePrimaryLabel(featureKey, phase),
      canPrimaryAction: !progressVisible && phase !== 'queued' && phase !== 'generating',
      shouldRegenerate: hasFeatureContent(featureKey) || generationStatus === 'complete',
      statusCopy: getFeatureStatusCopy(phase, errorMessage),
      errorMessage: phase === 'failed' ? errorMessage : '',
      actualProgressPct: progress.actualProgressPct,
      displayedProgressPct: visualProgressValue,
      safeVisualCapByPhase: progress.safeVisualCapByPhase,
      progressVisible,
      progressValue: progressIndeterminate ? 0 : visualProgressValue,
      progressIndeterminate,
      progressText,
      loadingLabel: completionVisible ? t('status.ready') : getFeatureLoadingLabel(featureKey, phase, { extractionBlocked: progress.extractionBlocked, job: progress.job }),
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

  function stopProgressAnimation() {
    if (progressAnimationFrame && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(progressAnimationFrame);
    }
    progressAnimationFrame = null;
    progressAnimationLastTime = 0;
  }

  function updateFeatureMapValue(source, featureKey, value) {
    if (source[featureKey] === value) return source;
    return { ...source, [featureKey]: value };
  }

  function shouldAnimateFeatureProgress() {
    const now = nowMs();
    return FEATURE_KEYS.some((featureKey) => {
      if ((completionFlashUntil[featureKey] || 0) > now) return true;
      const target = getFeatureVisualProgressTarget(featureKey, now);
      if (target === null) return false;
      return Math.abs((displayedProgress[featureKey] || 0) - target) > 0.2;
    });
  }

  function runProgressAnimationFrame(timestamp) {
    progressAnimationFrame = null;
    const frameDelta = progressAnimationLastTime ? Math.min(timestamp - progressAnimationLastTime, 64) : 16;
    progressAnimationLastTime = timestamp;
    const frameNow = nowMs();

    let nextProgress = displayedProgress;
    let nextCompletion = completionFlashUntil;
    let active = false;

    for (const featureKey of FEATURE_KEYS) {
      const holdUntil = completionFlashUntil[featureKey] || 0;
      if (holdUntil > 0) {
        if (holdUntil > nowMs()) {
          active = true;
          continue;
        }
        nextCompletion = updateFeatureMapValue(nextCompletion, featureKey, 0);
        continue;
      }

      const progressState = getFeatureProgressState(featureKey);
      const target = getFeatureVisualProgressTarget(featureKey, frameNow);
      if (target === null) continue;

      const current = displayedProgress[featureKey] || 0;
      if (Math.abs(target - current) <= 0.2) {
        nextProgress = updateFeatureMapValue(nextProgress, featureKey, target);
        continue;
      }

      const phaseConfig = VISUAL_PROGRESS_PHASES[progressState.visualPhase] ?? VISUAL_PROGRESS_PHASES.generating;
      const scaledFrame = frameDelta / 16.67;
      const distance = target - current;
      const step = Math.max(distance * phaseConfig.easing * scaledFrame, phaseConfig.minStep * scaledFrame);
      const nextValue = Math.min(current + step, target);
      nextProgress = updateFeatureMapValue(nextProgress, featureKey, clampProgress(nextValue));
      active = true;
    }

    displayedProgress = nextProgress;
    completionFlashUntil = nextCompletion;

    if (active && typeof requestAnimationFrame === 'function') {
      progressAnimationFrame = requestAnimationFrame(runProgressAnimationFrame);
    } else {
      progressAnimationLastTime = 0;
    }
  }

  function startProgressAnimation() {
    if (progressAnimationFrame || typeof requestAnimationFrame !== 'function' || !shouldAnimateFeatureProgress()) return;
    progressAnimationFrame = requestAnimationFrame(runProgressAnimationFrame);
  }

  function syncFeatureProgressVisuals() {
    const now = nowMs();
    let nextProgress = displayedProgress;
    let nextCompletion = completionFlashUntil;
    let nextPreviousPhases = previousFeaturePhases;
    let nextRuntime = progressRuntime;

    for (const featureKey of FEATURE_KEYS) {
      const progressState = getFeatureProgressState(featureKey);
      const { phase } = progressState;
      const previousPhase = previousFeaturePhases[featureKey];
      const current = displayedProgress[featureKey] || 0;
      const holdUntil = completionFlashUntil[featureKey] || 0;
      const currentRuntime = progressRuntime[featureKey] ?? createProgressRuntimeState();
      let nextFeatureRuntime = currentRuntime;

      if (phase === 'ready' && isLoadingPhase(previousPhase) && current > 0 && holdUntil === 0) {
        nextProgress = updateFeatureMapValue(nextProgress, featureKey, 100);
        nextCompletion = updateFeatureMapValue(nextCompletion, featureKey, now + 320);
        nextFeatureRuntime = createProgressRuntimeState();
      } else if ((phase === 'failed' || phase === 'not_requested') && (current > 0 || holdUntil > 0)) {
        nextProgress = updateFeatureMapValue(nextProgress, featureKey, 0);
        nextCompletion = updateFeatureMapValue(nextCompletion, featureKey, 0);
        nextFeatureRuntime = createProgressRuntimeState();
      } else if (progressState.visible) {
        const isRestart = !isLoadingPhase(previousPhase) || (currentRuntime.runKey && progressState.runKey && currentRuntime.runKey !== progressState.runKey);
        if (isRestart) {
          nextFeatureRuntime = createProgressRuntimeState({
            runKey: progressState.runKey,
            visualPhase: progressState.visualPhase,
            startedAt: now,
            phaseEnteredAt: now,
            lastActualProgress: progressState.actualProgressPct,
            lastActualProgressAt: progressState.actualProgressPct > 0 ? now : 0,
          });
          nextProgress = updateFeatureMapValue(nextProgress, featureKey, getFeatureProgressSeed(progressState));
          nextCompletion = updateFeatureMapValue(nextCompletion, featureKey, 0);
        } else {
          if (currentRuntime.visualPhase !== progressState.visualPhase) {
            nextFeatureRuntime = {
              ...nextFeatureRuntime,
              visualPhase: progressState.visualPhase,
              phaseEnteredAt: now,
            };
          }
          if (currentRuntime.runKey !== progressState.runKey && progressState.runKey) {
            nextFeatureRuntime = { ...nextFeatureRuntime, runKey: progressState.runKey };
          }
          if (progressState.actualProgressPct > currentRuntime.lastActualProgress) {
            nextFeatureRuntime = {
              ...nextFeatureRuntime,
              lastActualProgress: progressState.actualProgressPct,
              lastActualProgressAt: now,
            };
          }
          if (progressState.actualProgressPct > current) {
            const safeActualFloor = progressState.phase === 'ready'
              ? 100
              : Math.min(progressState.actualProgressPct, progressState.safeVisualCapByPhase);
            nextProgress = updateFeatureMapValue(nextProgress, featureKey, safeActualFloor);
          }
        }
      }

      if (holdUntil > 0 && holdUntil <= now) {
        nextCompletion = updateFeatureMapValue(nextCompletion, featureKey, 0);
      }

      if (nextPreviousPhases[featureKey] !== phase) {
        nextPreviousPhases = updateFeatureMapValue(nextPreviousPhases, featureKey, phase);
      }

      if (nextRuntime[featureKey] !== nextFeatureRuntime) {
        nextRuntime = updateFeatureMapValue(nextRuntime, featureKey, nextFeatureRuntime);
      }
    }

    displayedProgress = nextProgress;
    completionFlashUntil = nextCompletion;
    previousFeaturePhases = nextPreviousPhases;
    progressRuntime = nextRuntime;

    if (shouldAnimateFeatureProgress()) {
      startProgressAnimation();
    } else {
      stopProgressAnimation();
    }
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
    stopProgressAnimation();
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
    displayedProgress = featureMap(0);
    progressRuntime = createProgressRuntimeMap();
    completionFlashUntil = featureMap(0);
    previousFeaturePhases = featureMap('not_requested');
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
  .feature-support-copy{margin:0;color:var(--ui-text-secondary);line-height:1.5;font-size:.88rem}
  .feature-action-loading__value{
    color:var(--ui-text-primary);
    font-size:.82rem;
    font-weight:700;
    font-variant-numeric:tabular-nums;
    direction:ltr;
    unicode-bidi:plaintext;
  }
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
  :global(html[dir='rtl']) .feature-action-loading__meta{align-items:flex-start}
  @media (max-width:1024px){.features-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media (max-width:640px){
    .features-grid{grid-template-columns:1fr}
    .document-meta{align-items:stretch}
    .feature-action-loading__meta{flex-direction:column;align-items:flex-start}
  }
</style>
