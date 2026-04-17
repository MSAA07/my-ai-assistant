<script>
  import { onDestroy, onMount } from "svelte";
  import {
    Check,
    ClipboardCheck,
    FileText,
    FolderOpen,
    Infinity as InfinityIcon,
    Layers3,
  } from "@lucide/svelte";
  import { formatNumber, t } from "../lib/i18n/t.js";
  import { language as languageStore } from "../lib/stores/language.js";
  import PageLayout from "../lib/components/layout/PageLayout.svelte";
  import Badge from "../lib/components/ui/Badge.svelte";
  import Button from "../lib/components/ui/Button.svelte";
  import Card from "../lib/components/ui/Card.svelte";
  import DashboardCardSkeleton from "../lib/components/ui/DashboardCardSkeleton.svelte";
  import PageHeader from "../lib/components/ui/PageHeader.svelte";
  import ProgressBar from "../lib/components/ui/ProgressBar.svelte";
  import StudyActionCard from "../lib/components/ui/StudyActionCard.svelte";
  import UploadPanel from "../lib/components/ui/UploadPanel.svelte";
  import { getDocument, getJob } from "../lib/api/studyHub.js";
  import { getDocumentDisplayName } from "../lib/utils/documentName.js";
  import { writeStudyGenerationPlan } from "../lib/utils/studyGenerationPlan.js";
  import { readPageCache, writePageCache } from "../stores/pageCache.js";
  import { API_BASE } from "../config.js";

  const UPLOAD_ERROR_KEYS = new Set([
    "home.uploadSection.errors.selectFile",
    "home.uploadSection.errors.invalidType",
    "home.uploadSection.errors.fileTooLarge",
    "home.uploadSection.errors.maxFiles",
    "home.uploadSection.errors.limitReached",
    "home.uploadSection.errors.uploadFailed",
    "home.uploadSection.errors.network",
  ]);
  const HOME_CACHE_KEY = "page:home";
  const FLOW_STAGE = Object.freeze({
    upload: "upload",
    select: "select",
  });
  const FEATURE_ORDER = ["summary", "flashcards", "exam"];
  const MAX_UPLOAD_FILES = 1;
  const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
  const VALID_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];
  const VALID_EXTENSIONS = [".pdf", ".docx", ".pptx"];
  const POLL_INTERVAL_MS = 1500;
  const MAX_EXTRACTION_POLLS = 80;
  const MAX_GENERATION_POLLS = 8;
  const FEATURE_CONFIG = {
    summary: {
      titleKey: "document.hub.features.summary",
      descriptionKey: "home.guided.features.summary",
      icon: FileText,
      options: { length: "medium" },
    },
    flashcards: {
      titleKey: "document.hub.features.flashcards",
      descriptionKey: "home.guided.features.flashcards",
      icon: Layers3,
      options: { includeExplanations: false },
    },
    exam: {
      titleKey: "document.hub.features.exam",
      descriptionKey: "home.guided.features.exam",
      icon: ClipboardCheck,
      options: { questionCount: 10 },
    },
  };

  let user = null;
  let documents = [];
  let selectedFiles = [];
  let errorKey = "";
  let errorArgs = {};
  let uploading = false;
  let isLoadingDashboard = true;
  let isRefreshingDashboard = false;
  let error = "";
  let uploadError = "";
  let flowStage = FLOW_STAGE.upload;
  let uploadedDocument = null;
  let latestDocument = null;
  let selectedFeatures = createFeatureMap(false);
  let generationJobs = createFeatureMap(null);
  let generationErrors = createFeatureMap("");
  let extractionJob = null;
  let orchestrationBusy = false;
  let postUploadError = "";
  let progressError = "";
  let handoffPending = false;
  let displayedGuidedProgress = 0;
  let guidedProgressFrame = null;
  let guidedProgressLastTime = 0;
  $: _lang = $languageStore;

  $: translatedError = errorKey ? t(errorKey, errorArgs) : "";
  $: uploadError = UPLOAD_ERROR_KEYS.has(errorKey) ? translatedError : "";
  $: error = UPLOAD_ERROR_KEYS.has(errorKey) ? "" : translatedError;
  $: normalizedRole = (user?.role || "").toLowerCase();
  $: remainingDocumentsValue = user?.remainingDocuments ?? user?.documentsRemaining ?? 0;
  $: canUploadDocuments = normalizedRole === "admin" || remainingDocumentsValue > 0;
  $: showQuotaReachedMessage = !isLoadingDashboard && !!user && !canUploadDocuments;
  $: showUploadSection = !isLoadingDashboard && !!user && canUploadDocuments && flowStage === FLOW_STAGE.upload;
  $: showGuidedSelection = flowStage === FLOW_STAGE.select && !!uploadedDocument;
  $: showGuidedProgress = false;
  $: usedThisMonthValue = user?.documentsUsed ?? user?.usedThisMonth ?? 0;
  $: monthlyLimitValue = user?.monthlyLimit ?? 0;
  $: totalDocumentsValue = Array.isArray(documents) ? documents.length : 0;
  $: homeStats = [
    {
      key: "remaining",
      value: normalizedRole === "admin" ? t("home.stats.unlimited") : formatNumber(remainingDocumentsValue),
      subtitle: t("home.stats.documentsRemaining"),
      icon: InfinityIcon,
    },
    {
      key: "used",
      value: `${formatNumber(usedThisMonthValue)}/${formatNumber(monthlyLimitValue)}`,
      subtitle: t("home.stats.usedThisMonth"),
      icon: FileText,
    },
    {
      key: "total",
      value: formatNumber(totalDocumentsValue),
      subtitle: t("home.stats.totalDocuments"),
      icon: FolderOpen,
    },
  ];
  $: selectedFeatureKeys = FEATURE_ORDER.filter((featureKey) => selectedFeatures[featureKey]);
  $: selectedFeatureLabels = selectedFeatureKeys.map((featureKey) => t(FEATURE_CONFIG[featureKey].titleKey));
  $: extractionStatus = normalizeDocumentStatus(latestDocument?.processingStatus || uploadedDocument?.processingStatus);
  $: uploadedDocumentName = getDocumentDisplayName(latestDocument || uploadedDocument);
  $: showDashboardChrome = !showGuidedSelection;
  $: selectionStatusLabel = getSelectionStatusLabel();
  $: selectionStatusTone = getSelectionStatusTone();
  $: featureSelectionCards = FEATURE_ORDER.map((featureKey) => ({
    key: featureKey,
    title: t(FEATURE_CONFIG[featureKey].titleKey),
    description: t(FEATURE_CONFIG[featureKey].descriptionKey),
    supportLabel: t(`home.guided.supportLabels.${featureKey}`),
    selected: Boolean(selectedFeatures[featureKey]),
    error: generationErrors[featureKey],
    icon: FEATURE_CONFIG[featureKey].icon,
  }));
  $: generationKickoffObserved = selectedFeatureKeys.length > 0
    && selectedFeatureKeys.every((featureKey) => {
      if (generationErrors[featureKey]) return true;
      const status = getGenerationStatus(latestDocument, featureKey);
      return status !== "not_requested";
    });
  $: progressHeadline = getProgressHeadline();
  $: progressBody = getProgressBody();
  $: rawProgressValue = getProgressValue();
  $: progressValue = Math.round(displayedGuidedProgress);
  $: progressSteps = buildProgressSteps();
  $: {
    showGuidedProgress;
    rawProgressValue;
    syncGuidedProgressDisplay();
  }

  $: if (!canUploadDocuments) {
    selectedFiles = [];
    clearUploadError();
    if (!showGuidedSelection && !showGuidedProgress) {
      resetGuidedFlow();
    }
  }

  onMount(() => {
    const cached = readPageCache(HOME_CACHE_KEY);
    const hasCachedData = Boolean(cached?.user);
    if (hasCachedData) {
      user = cached.user;
      documents = Array.isArray(cached.documents) ? cached.documents : [];
      isLoadingDashboard = false;
    }

    void fetchUserData({ background: hasCachedData });
  });

  onDestroy(() => {
    stopGuidedProgressAnimation();
  });

  function createFeatureMap(initialValue) {
    return {
      summary: initialValue,
      flashcards: initialValue,
      exam: initialValue,
    };
  }

  function normalizeString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function normalizeDocumentStatus(status) {
    const normalized = normalizeString(status).toLowerCase();
    if (normalized === "queued" || normalized === "processing" || normalized === "complete" || normalized === "failed") {
      return normalized;
    }
    return "queued";
  }

  function normalizeGenerationStatus(status) {
    const normalized = normalizeString(status).toLowerCase();
    if (
      normalized === "not_requested"
      || normalized === "queued"
      || normalized === "running"
      || normalized === "complete"
      || normalized === "failed"
    ) {
      return normalized;
    }
    return "not_requested";
  }

  function normalizeJobStatus(status) {
    const normalized = normalizeString(status).toLowerCase();
    if (normalized === "queued" || normalized === "running" || normalized === "succeeded" || normalized === "failed") {
      return normalized;
    }
    return "";
  }

  function stopGuidedProgressAnimation() {
    if (guidedProgressFrame && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(guidedProgressFrame);
    }
    guidedProgressFrame = null;
    guidedProgressLastTime = 0;
  }

  function runGuidedProgressAnimation(timestamp) {
    guidedProgressFrame = null;
    const target = Math.max(0, Math.min(Number(rawProgressValue) || 0, 100));
    const deltaMs = guidedProgressLastTime ? Math.min(timestamp - guidedProgressLastTime, 64) : 16;
    guidedProgressLastTime = timestamp;

    if (!showGuidedProgress) {
      displayedGuidedProgress = 0;
      guidedProgressLastTime = 0;
      return;
    }

    if (displayedGuidedProgress >= target - 0.2) {
      displayedGuidedProgress = target;
      guidedProgressLastTime = 0;
      return;
    }

    const scaledFrame = deltaMs / 16.67;
    const distance = target - displayedGuidedProgress;
    const step = Math.min(Math.max(distance * 0.14 * scaledFrame, 0.45 * scaledFrame), 2.8 * scaledFrame);
    displayedGuidedProgress = Math.min(displayedGuidedProgress + step, target);

    if (typeof requestAnimationFrame === "function") {
      guidedProgressFrame = requestAnimationFrame(runGuidedProgressAnimation);
    }
  }

  function startGuidedProgressAnimation() {
    if (guidedProgressFrame || typeof requestAnimationFrame !== "function") return;
    guidedProgressFrame = requestAnimationFrame(runGuidedProgressAnimation);
  }

  function syncGuidedProgressDisplay() {
    const target = Math.max(0, Math.min(Number(rawProgressValue) || 0, 100));
    if (!showGuidedProgress) {
      displayedGuidedProgress = 0;
      stopGuidedProgressAnimation();
      return;
    }
    if (displayedGuidedProgress > target || target <= 0) {
      displayedGuidedProgress = target;
    }
    if (Math.abs(target - displayedGuidedProgress) <= 0.2) {
      displayedGuidedProgress = target;
      stopGuidedProgressAnimation();
      return;
    }
    startGuidedProgressAnimation();
  }

  function getGenerationStatus(document, featureKey) {
    return normalizeGenerationStatus(document?.generationState?.[featureKey]?.status);
  }

  function getSelectionStatusLabel() {
    if (extractionStatus === "failed") {
      return t("home.guided.statusFailed");
    }
    if (extractionStatus === "queued" || extractionStatus === "processing") {
      return t("home.guided.statusPreparing");
    }
    return t("home.guided.statusReady");
  }

  function getSelectionStatusTone() {
    if (extractionStatus === "failed") return "destructive";
    if (extractionStatus === "queued" || extractionStatus === "processing") return "warning";
    return "info";
  }

  function clearPostUploadMessages() {
    postUploadError = "";
    progressError = "";
  }

  function resetGuidedFlow() {
    flowStage = FLOW_STAGE.upload;
    uploadedDocument = null;
    latestDocument = null;
    selectedFeatures = createFeatureMap(false);
    generationJobs = createFeatureMap(null);
    generationErrors = createFeatureMap("");
    extractionJob = null;
    orchestrationBusy = false;
    postUploadError = "";
    progressError = "";
    handoffPending = false;
  }

  async function fetchUserData({ background = false } = {}) {
    if (background) {
      isRefreshingDashboard = true;
    } else {
      isLoadingDashboard = true;
    }

    try {
      const response = await fetch(`${API_BASE}/api/user/me`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      const payload = data?.data ?? data;
      user = payload?.user ?? null;
      documents = Array.isArray(payload?.documents) ? payload.documents : [];
      writePageCache(HOME_CACHE_KEY, { user, documents });
      errorKey = "";
      errorArgs = {};
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      errorKey = "home.alerts.error";
      errorArgs = {};
    } finally {
      if (background) {
        isRefreshingDashboard = false;
      } else {
        isLoadingDashboard = false;
      }
    }
  }

  function clearUploadError() {
    if (!UPLOAD_ERROR_KEYS.has(errorKey)) return;
    errorKey = "";
    errorArgs = {};
  }

  function setUploadError(key, args = {}) {
    errorKey = key;
    errorArgs = args;
  }

  function clearSelectedFiles() {
    if (uploading || orchestrationBusy || flowStage !== FLOW_STAGE.upload) return;
    selectedFiles = [];
    clearUploadError();
  }

  function isValidFileType(file) {
    const lowerName = file.name.toLowerCase();
    const hasValidExtension = VALID_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    return VALID_TYPES.includes(file.type) || hasValidExtension;
  }

  function addSelectedFiles(candidates) {
    if (!canUploadDocuments || uploading || flowStage !== FLOW_STAGE.upload || !Array.isArray(candidates) || candidates.length === 0) {
      return;
    }

    if (candidates.length > MAX_UPLOAD_FILES) {
      setUploadError("home.uploadSection.errors.maxFiles", { max: MAX_UPLOAD_FILES });
      return;
    }

    const [file] = candidates;
    if (!file) return;

    if (!isValidFileType(file)) {
      setUploadError("home.uploadSection.errors.invalidType");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError("home.uploadSection.errors.fileTooLarge");
      return;
    }

    selectedFiles = [file];
    clearUploadError();
  }

  function handleFilesSelected(event) {
    addSelectedFiles(event?.detail?.files ?? []);
  }

  function handleRemoveSelectedFile(event) {
    const index = event?.detail?.index;
    if (!Number.isInteger(index) || index < 0 || index >= selectedFiles.length) return;
    selectedFiles = [];
    clearUploadError();
  }

  async function uploadSingleFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;

      xhr.addEventListener("load", () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response);
          } else {
            const message = response.error || "Failed to upload document";
            const details = response.details ? ` (${response.details})` : "";
            reject(new Error(`${message}${details}`));
          }
        } catch {
          reject(new Error("Invalid server response"));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("NETWORK_ERROR"));
      });

      xhr.open("POST", `${API_BASE}/api/upload`);
      xhr.send(formData);
    });
  }

  function setFeatureSelected(featureKey, selected) {
    if (orchestrationBusy) return;
    selectedFeatures = {
      ...selectedFeatures,
      [featureKey]: selected,
    };

    if (generationErrors[featureKey]) {
      generationErrors = {
        ...generationErrors,
        [featureKey]: "",
      };
    }
  }

  function toggleFeature(featureKey) {
    setFeatureSelected(featureKey, !selectedFeatures[featureKey]);
  }

  async function handleUpload() {
    if (!user || !canUploadDocuments) {
      setUploadError("home.uploadSection.errors.limitReached");
      return;
    }

    if (selectedFiles.length === 0) {
      setUploadError("home.uploadSection.errors.selectFile");
      return;
    }

    uploading = true;
    clearUploadError();
    clearPostUploadMessages();
    generationErrors = createFeatureMap("");

    try {
      const file = selectedFiles[0];
      const data = await uploadSingleFile(file);
      const documentId = data?.documentId ?? data?.document?.id;
      if (!documentId) {
        throw new Error("Upload succeeded without document context");
      }

      latestDocument = data?.document ?? null;
      uploadedDocument = {
        id: documentId,
        name: getDocumentDisplayName(data?.document, file.name),
        jobId: normalizeString(data?.jobId || data?.document?.processingJobId),
        processingStatus: normalizeDocumentStatus(data?.document?.processingStatus),
      };
      extractionJob = uploadedDocument.jobId
        ? {
          id: uploadedDocument.jobId,
          status: "queued",
          progressPct: 0,
        }
        : null;
      selectedFeatures = createFeatureMap(false);
      generationJobs = createFeatureMap(null);
      generationErrors = createFeatureMap("");
      selectedFiles = [];
      flowStage = FLOW_STAGE.select;

      await fetchUserData({ background: true });
    } catch (err) {
      console.error("Upload error:", err);
      const message = (err?.message || "").toUpperCase();
      if (message === "NETWORK_ERROR") {
        setUploadError("home.uploadSection.errors.network");
      } else {
        setUploadError("home.uploadSection.errors.uploadFailed");
      }
    } finally {
      uploading = false;
    }
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function refreshDocument(documentId) {
    const response = await getDocument(documentId);
    latestDocument = response?.document ?? null;
    return latestDocument;
  }

  async function refreshJob(jobId) {
    if (!normalizeString(jobId)) {
      return null;
    }

    return getJob(jobId);
  }

  async function waitForExtractionReady(documentId, extractionJobId) {
    for (let attempt = 0; attempt < MAX_EXTRACTION_POLLS; attempt += 1) {
      const [document, job] = await Promise.all([
        refreshDocument(documentId),
        extractionJobId ? refreshJob(extractionJobId) : Promise.resolve(null),
      ]);

      if (job) {
        extractionJob = {
          id: job.id,
          status: normalizeJobStatus(job.status),
          progressPct: Number(job.progressPct) || 0,
        };
      }

      const nextStatus = normalizeDocumentStatus(document?.processingStatus);
      if (nextStatus === "complete") {
        return document;
      }

      if (nextStatus === "failed") {
        throw new Error(normalizeString(document?.processingError) || t("document.processingFailed"));
      }

      if (job && normalizeJobStatus(job.status) === "failed") {
        throw new Error(normalizeString(job.errorMessage) || t("document.processingFailed"));
      }

      await wait(POLL_INTERVAL_MS);
    }

    throw new Error(t("document.jobStatusError"));
  }

  async function waitForGenerationKickoff(documentId, features) {
    for (let attempt = 0; attempt < MAX_GENERATION_POLLS; attempt += 1) {
      const document = await refreshDocument(documentId);
      const jobResults = await Promise.all(
        features.map((featureKey) => {
          const jobId = normalizeString(generationJobs[featureKey]?.id);
          return jobId ? refreshJob(jobId) : Promise.resolve(null);
        }),
      );

      jobResults.forEach((job, index) => {
        if (!job) return;
        const featureKey = features[index];
        generationJobs = {
          ...generationJobs,
          [featureKey]: {
            id: job.id,
            status: normalizeJobStatus(job.status),
            progressPct: Number(job.progressPct) || 0,
          },
        };
      });

      const allObserved = features.every((featureKey) => getGenerationStatus(document, featureKey) !== "not_requested");
      if (allObserved) {
        return document;
      }

      await wait(POLL_INTERVAL_MS);
    }

    return latestDocument;
  }

  async function handleSkipForNow() {
    if (!uploadedDocument?.id || orchestrationBusy) return;
    window.location.hash = `/study/${encodeURIComponent(uploadedDocument.id)}`;
  }

  async function handleGenerateSelected() {
    if (!uploadedDocument?.id || orchestrationBusy || selectedFeatureKeys.length === 0) {
      return;
    }

    orchestrationBusy = true;
    postUploadError = "";

    try {
      const documentId = uploadedDocument.id;
      writeStudyGenerationPlan(documentId, {
        features: selectedFeatureKeys.reduce((accumulator, featureKey) => {
          accumulator[featureKey] = {
            type: featureKey,
            options: FEATURE_CONFIG[featureKey].options,
          };
          return accumulator;
        }, {}),
      });
      await fetchUserData({ background: true });
      window.location.hash = `/study/${encodeURIComponent(documentId)}`;
    } catch (err) {
      console.error("Failed to hand off document generation:", err);
      const message = normalizeString(err?.message) || t("home.guided.errors.generationRequest");
      postUploadError = message;
    } finally {
      orchestrationBusy = false;
    }
  }

  function buildProgressSteps() {
    if (!showGuidedProgress) {
      return [];
    }

    const steps = [
      {
        key: "upload",
        label: t("home.guided.progress.steps.uploadComplete"),
        state: "complete",
      },
      {
        key: "preparing",
        label: t("home.guided.progress.steps.preparingDocument"),
        state: getExtractionStepState(),
      },
    ];

    for (const featureKey of selectedFeatureKeys) {
      steps.push({
        key: featureKey,
        label: t(`home.guided.progress.steps.${featureKey}`),
        state: getFeatureStepState(featureKey),
      });
    }

    steps.push({
      key: "finishing",
      label: t("home.guided.progress.steps.finishing"),
      state: getFinishingStepState(),
    });

    return steps;
  }

  function getExtractionStepState() {
    if (progressError || extractionStatus === "failed") return "failed";
    if (extractionStatus === "complete") return "complete";
    return "current";
  }

  function getFeatureStepState(featureKey) {
    if (generationErrors[featureKey]) return "failed";

    const status = getGenerationStatus(latestDocument, featureKey);
    if (status === "failed") return "failed";
    if (status === "complete") return "complete";
    if (status === "queued" || status === "running") return "current";
    if (extractionStatus === "queued" || extractionStatus === "processing") return "pending";
    return "pending";
  }

  function getFinishingStepState() {
    if (progressError) return "failed";
    if (handoffPending) return "current";
    if (generationKickoffObserved && extractionStatus === "complete") return "current";
    return "pending";
  }

  function getProgressHeadline() {
    if (progressError) {
      return t("home.guided.errors.progressTitle");
    }

    if (extractionStatus === "queued" || extractionStatus === "processing") {
      return t("home.guided.progress.preparingTitle");
    }

    if (handoffPending) {
      return t("home.guided.progress.finishingTitle");
    }

    if (selectedFeatureKeys.length === 1) {
      const featureKey = selectedFeatureKeys[0];
      return t(`home.guided.progress.activeFeatureTitle.${featureKey}`);
    }

    return t("home.guided.progress.generatingTitle");
  }

  function getProgressBody() {
    if (progressError) {
      return progressError;
    }

    if (extractionStatus === "queued" || extractionStatus === "processing") {
      return t("home.guided.progress.preparingBody");
    }

    if (handoffPending) {
      return t("home.guided.progress.finishingBody");
    }

    return t("home.guided.progress.generatingBody");
  }

  function getProgressValue() {
    if (!showGuidedProgress) return 0;

    const uploadPct = 10;
    const extractionPct = extractionStatus === "complete"
      ? 100
      : Math.max(0, Math.min(Number(extractionJob?.progressPct) || 0, 100));
    const featureProgressValues = selectedFeatureKeys.map((featureKey) => {
      const status = getGenerationStatus(latestDocument, featureKey);
      if (status === "complete" || status === "failed") return 100;
      if (status === "running") {
        return Math.max(30, Math.min(Number(generationJobs[featureKey]?.progressPct) || 30, 100));
      }
      if (status === "queued") return 12;
      return 0;
    });
    const generationPct = featureProgressValues.length > 0
      ? featureProgressValues.reduce((sum, value) => sum + value, 0) / featureProgressValues.length
      : 0;
    const finishingPct = handoffPending ? 100 : generationKickoffObserved ? 65 : 0;

    return Math.round((uploadPct * 0.1) + (extractionPct * 0.35) + (generationPct * 0.45) + (finishingPct * 0.1));
  }
</script>

<PageLayout class={`home-page ${showGuidedSelection ? "home-page--selection-mode" : ""}`.trim()} width="wide" gap="compact">
  {#if showDashboardChrome}
    <PageHeader
      className="home-header"
      eyebrow={t("nav.home")}
      title={t("home.heroTitle")}
      subtitle={t("home.heroSubtitle")}
      aria-busy={isRefreshingDashboard}
    />
  {/if}

  {#if showDashboardChrome && isLoadingDashboard}
    <section class="stats-grid" aria-label={t("nav.home")}>
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
    </section>
  {:else if showDashboardChrome && user}
    <section class="stats-grid" aria-label={t("nav.home")}>
      {#each homeStats as stat (stat.key)}
        {@const Icon = stat.icon}
        <Card as="article" class="home-stat-card" variant="base" padding="sm" border="subtle">
          <div class="home-stat-card__content">
            <div class="home-stat-card__copy">
              <p class={`home-stat-card__value ${stat.key === "remaining" && normalizedRole === "admin" ? "home-stat-card__value--compact" : ""}`.trim()}>
                {stat.value}
              </p>
              <p class="home-stat-card__subtitle">{stat.subtitle}</p>
            </div>
            <div class="home-stat-card__icon" aria-hidden="true">
              <Icon />
            </div>
          </div>
        </Card>
      {/each}
    </section>
  {/if}

  {#if error}
    <Card class="home-alert home-alert-error" variant="soft" border="strong" padding="sm">{error}</Card>
  {/if}

  {#if showQuotaReachedMessage}
    <Card class="quota-message" variant="soft" border="accent" padding="md" role="status" aria-live="polite">
      <h2>{t("home.quotaReached.title")}</h2>
      <p>{t("home.quotaReached.body")}</p>
      <p class="quota-message-secondary">{t("home.quotaReached.upgradeHint")}</p>
    </Card>
  {/if}

  {#if showUploadSection}
    <section class="upload-stack" aria-label={t("home.uploadSection.modalTitle")}>
      <UploadPanel
        busy={uploading}
        maxFiles={MAX_UPLOAD_FILES}
        files={selectedFiles}
        accept={VALID_EXTENSIONS.join(",")}
        multiple={false}
        variant="compact"
        title=""
        description=""
        supportTitle={t("home.uploadSection.heroSupport")}
        benefitLabel={t("home.uploadSection.heroBenefitsLabel")}
        benefitItems={[
          t("home.uploadSection.heroBenefits.summary"),
          t("home.uploadSection.heroBenefits.flashcards"),
          t("home.uploadSection.heroBenefits.exams"),
        ]}
        detailsSummary={t("home.uploadSection.heroBenefitsLabel")}
        dropzoneTitle={t("home.uploadSection.title")}
        dropzoneDescription=""
        dropzoneOr={t("home.uploadSection.dropzoneOr")}
        browseLabel={t("home.uploadSection.browseFile")}
        supportLabel={t("home.uploadSection.constraints")}
        showCounter={false}
        cancelLabel={t("home.uploadSection.cancel")}
        submitLabel={t("home.uploadSection.submitUpload")}
        submitBusyLabel={t("home.uploadSection.submitUploading")}
        removeFileLabel={t("home.uploadSection.removeFile")}
        errorMessage={uploadError}
        on:cancel={clearSelectedFiles}
        on:submit={handleUpload}
        on:filesSelected={handleFilesSelected}
        on:removeFile={handleRemoveSelectedFile}
      />
    </section>
  {/if}

  {#if showGuidedSelection}
    <section class="guided-panel" aria-label={t("home.guided.title")}>
      <Card class="guided-shell" variant="standard" padding="lg" border="default">
        <div class="guided-step-header">
          <div class="guided-step-header__copy">
            <p class="guided-step-header__eyebrow">{t("home.guided.eyebrow")}</p>
            <div class="guided-step-header__title-row">
              <h2>{t("home.guided.title")}</h2>
              <Badge tone={selectionStatusTone} variant="outline" size="sm" className="guided-step-header__badge">
                {selectionStatusLabel}
              </Badge>
            </div>
            <p class="guided-step-header__helper">
              {#if extractionStatus === "queued" || extractionStatus === "processing"}
                {t("home.guided.processingHint")}
              {:else}
                {t("home.guided.readyHint")}
              {/if}
            </p>
          </div>
        </div>

        <div class="guided-file-header">
          <div class="guided-file-header__meta">
            <span class="guided-file-header__label">{t("home.guided.fileLabel")}</span>
            <span class="guided-file-header__name">{uploadedDocumentName}</span>
          </div>
          <span class="guided-file-header__caption">{t("home.guided.subtitle", { name: uploadedDocumentName })}</span>
        </div>

        {#if postUploadError}
          <Card class="home-alert home-alert-error" variant="soft" border="strong" padding="sm">{postUploadError}</Card>
        {/if}

        <div class="guided-feature-grid">
          {#each featureSelectionCards as card (card.key)}
            {@const Icon = card.icon}
            <StudyActionCard
              class={`guided-feature-card ${card.selected ? "guided-feature-card--selected" : ""}`.trim()}
              title={card.title}
              status={card.selected ? "ready" : "info"}
              statusLabel={card.supportLabel}
              role="button"
              tabindex="0"
              aria-pressed={card.selected}
              on:click={() => toggleFeature(card.key)}
              on:keydown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleFeature(card.key);
                }
              }}
            >
              <div slot="icon">
                <Icon />
              </div>

              <svelte:fragment slot="description">
                <p>{card.description}</p>
                {#if card.error}
                  <p class="guided-feature-card__error">{card.error}</p>
                {/if}
              </svelte:fragment>

              <div class="guided-feature-card__footer">
                <span class={`guided-feature-card__state ${card.selected ? "guided-feature-card__state--selected" : ""}`.trim()}>
                  {#if card.selected}
                    {t("home.guided.featureSelected")}
                  {:else}
                    {t("home.guided.featureOptional")}
                  {/if}
                </span>
                <span class={`guided-feature-card__check ${card.selected ? "guided-feature-card__check--selected" : ""}`.trim()} aria-hidden="true">
                  {#if card.selected}
                    <Check />
                  {/if}
                </span>
              </div>
            </StudyActionCard>
          {/each}
        </div>

        <div class="guided-action-bar">
          <div class="guided-action-bar__copy">
            <p class="guided-action-bar__count">
              {#if selectedFeatureKeys.length > 0}
                {t("home.guided.selectionCount", { count: selectedFeatureKeys.length })}
              {:else}
                {t("home.guided.emptyTitle")}
              {/if}
            </p>
            <p class="guided-action-bar__hint">
              {#if selectedFeatureKeys.length > 0}
                {t("home.guided.selectedBody")}
              {:else}
                {t("home.guided.emptyBody")}
              {/if}
            </p>
          </div>

          <div class="guided-action-bar__actions">
            <Button type="button" variant="outline" on:click={handleSkipForNow} disabled={orchestrationBusy}>
              {t("home.guided.skip")}
            </Button>
            <Button type="button" variant="primary" on:click={handleGenerateSelected} disabled={selectedFeatureKeys.length === 0} loading={orchestrationBusy}>
              {t("home.guided.generateSelected")}
            </Button>
          </div>
        </div>
      </Card>
    </section>
  {/if}

  {#if showGuidedProgress}
    <section class="progress-panel" aria-label={t("home.guided.progress.title")}>
      <Card class="progress-hero" variant="standard" padding="lg" border="default">
        <div class="progress-hero__copy">
          <p class="guided-hero__eyebrow">{t("home.guided.progress.eyebrow")}</p>
          <h2>{progressHeadline}</h2>
          <p>{progressBody}</p>
        </div>

        <div class="progress-hero__meta">
          <span class="progress-hero__document">{uploadedDocumentName}</span>
          <div class="progress-hero__features">
            {#each selectedFeatureLabels as label}
              <Badge tone="info" variant="outline" size="sm">{label}</Badge>
            {/each}
          </div>
        </div>

        <div class="progress-rail">
          <ProgressBar value={progressValue} max={100} ariaLabel={t("home.guided.progress.ariaLabel")} className="progress-rail__bar" />
          <span class="progress-rail__value">{formatNumber(progressValue)}%</span>
        </div>
      </Card>

      <Card class="progress-steps" variant="secondary" padding="md" border="default">
        {#each progressSteps as step (step.key)}
          <div class={`progress-step progress-step--${step.state}`.trim()}>
            <div class="progress-step__marker" aria-hidden="true">
              {#if step.state === "complete"}
                <Check />
              {:else if step.state === "current"}
                <span class="progress-step__pulse"></span>
              {:else if step.state === "failed"}
                <span class="progress-step__cross"></span>
              {/if}
            </div>
            <div class="progress-step__copy">
              <p>{step.label}</p>
            </div>
          </div>
        {/each}
      </Card>
    </section>
  {/if}
</PageLayout>

<style>
  :global(.home-page) {
    display: grid;
    gap: var(--study-flow-page-gap);
    min-width: 0;
  }

  :global(.home-page .home-header) {
    padding-top: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--study-flow-card-gap);
    min-width: 0;
  }

  :global(.home-page .home-stat-card) {
    min-height: 0;
    border-radius: var(--study-flow-card-radius);
    background: var(--study-flow-card-surface);
    border-color: var(--ui-border-default);
    box-shadow: none;
  }

  .home-stat-card__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-space-3);
  }

  .home-stat-card__copy {
    display: grid;
    gap: var(--ui-space-1);
    min-width: 0;
  }

  :global(.home-stat-card__value) {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: clamp(1.45rem, 1.28rem + 0.45vw, 1.75rem);
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  :global(.home-stat-card__value--compact) {
    font-size: clamp(1.35rem, 1.2rem + 0.35vw, 1.55rem);
  }

  .home-stat-card__subtitle {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--font-size-sm);
    line-height: 1.35;
  }

  .home-stat-card__icon {
    display: inline-flex;
    width: var(--study-flow-icon-box-size);
    height: var(--study-flow-icon-box-size);
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border-radius: var(--study-flow-icon-box-radius);
    background: color-mix(in srgb, var(--ui-surface-secondary) 92%, transparent);
    color: var(--ui-text-muted);
  }

  .home-stat-card__icon :global(svg) {
    width: 1.25rem;
    height: 1.25rem;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
  }

  :global(.home-alert) {
    font-weight: 500;
  }

  :global(.home-alert-error) {
    color: var(--color-danger);
    border-color: var(--color-danger-border);
    background: var(--color-danger-surface);
  }

  :global(.quota-message) {
    display: grid;
    gap: var(--space-2);
  }

  :global(.quota-message h2) {
    margin: 0;
    font-size: 0.98rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  :global(.quota-message p) {
    margin: 0;
    color: var(--color-text-secondary);
    line-height: 1.45;
    font-size: var(--font-size-sm);
  }

  .quota-message-secondary {
    margin-top: 0;
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
  }

  .upload-stack,
  .guided-panel,
  .progress-panel {
    display: grid;
    gap: var(--study-flow-card-gap);
    min-width: 0;
  }

  .upload-stack {
    width: min(100%, 680px);
    margin-inline: auto;
  }

  :global(.home-page .upload-panel-shell .upload-panel__titles p) {
    max-width: 48ch;
  }

  .guided-panel {
    width: 100%;
    max-width: 1040px;
    margin-inline: auto;
  }

  .guided-shell,
  .progress-hero {
    gap: var(--study-flow-card-gap);
  }

  .guided-step-header__title-row,
  .progress-hero__meta,
  .guided-action-bar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--study-flow-card-gap);
    flex-wrap: wrap;
  }

  .guided-step-header__copy,
  .progress-hero__copy,
  .guided-action-bar__copy {
    display: grid;
    gap: 0.35rem;
    min-width: 0;
  }

  .guided-step-header__eyebrow,
  .guided-hero__eyebrow {
    margin: 0;
    color: var(--ui-text-muted);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .guided-step-header__copy h2,
  .progress-hero__copy h2,
  .guided-action-bar__count {
    margin: 0;
    color: var(--ui-text-primary);
    letter-spacing: -0.03em;
  }

  .guided-step-header__copy h2,
  .progress-hero__copy h2 {
    font-size: clamp(1.4rem, 1.18rem + 0.55vw, 1.8rem);
    line-height: 1.08;
  }

  .guided-step-header__helper,
  .guided-file-header__caption,
  .guided-action-bar__hint,
  .progress-hero__copy p:last-child,
  .progress-hero__meta p {
    margin: 0;
    color: var(--ui-text-secondary);
    line-height: 1.55;
    font-size: 0.9rem;
  }

  .guided-step-header__badge {
    min-height: 1.75rem;
  }

  .guided-file-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.9rem;
    flex-wrap: wrap;
    padding: 0.9rem 1rem;
    border: 1px solid color-mix(in srgb, var(--ui-border-default) 82%, var(--ui-text-primary) 18%);
    border-radius: calc(var(--study-flow-card-radius) - 0.2rem);
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--ui-surface-card) 92%, transparent) 0%, color-mix(in srgb, var(--ui-surface-secondary) 88%, transparent) 100%);
  }

  .guided-file-header__meta {
    display: grid;
    gap: 0.2rem;
    min-width: 0;
  }

  .guided-file-header__label {
    color: var(--ui-text-muted);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .guided-file-header__name,
  .progress-hero__document {
    color: var(--ui-text-primary);
    font-size: 0.95rem;
    font-weight: 650;
    line-height: 1.4;
    word-break: break-word;
  }

  .guided-file-header__caption {
    max-width: 28rem;
  }

  .progress-hero__meta {
    align-items: center;
  }

  .guided-feature-grid {
    display: grid;
    gap: 0.95rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  :global(.guided-feature-card) {
    min-height: 0;
    box-shadow: none;
    cursor: pointer;
    gap: 0.9rem;
    border-width: 1px;
    border-color: color-mix(in srgb, var(--ui-border-default) 84%, var(--ui-surface-secondary) 16%);
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-surface-card) 96%, transparent) 0%, color-mix(in srgb, var(--ui-surface-secondary) 82%, transparent) 100%);
    transition: border-color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard),
      transform var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard);
  }

  :global(.guided-feature-card:hover),
  :global(.guided-feature-card:focus-visible) {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--ui-text-primary) 20%, var(--ui-border-default) 80%);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  }

  :global(.guided-feature-card--selected) {
    border-color: color-mix(in srgb, var(--ui-text-primary) 34%, var(--ui-border-default) 66%);
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-surface-card) 92%, transparent) 0%, color-mix(in srgb, var(--ui-surface-secondary) 72%, transparent) 100%);
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--ui-text-primary) 16%, transparent),
      0 16px 32px rgba(0, 0, 0, 0.14);
  }

  :global(.guided-feature-card .ui-study-action-card__header) {
    align-items: flex-start;
    gap: 0.65rem;
  }

  :global(.guided-feature-card .ui-study-action-card__hero) {
    gap: 0.75rem;
  }

  :global(.guided-feature-card .ui-study-action-card__copy h2) {
    font-size: 1.02rem;
    font-weight: 600;
  }

  :global(.guided-feature-card .ui-study-action-card__description) {
    color: var(--ui-text-secondary);
    font-size: 0.88rem;
    line-height: 1.55;
  }

  :global(.guided-feature-card .ui-study-action-card__status) {
    background: color-mix(in srgb, var(--ui-surface-secondary) 78%, transparent);
  }

  .guided-feature-card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: auto;
  }

  .guided-feature-card__state {
    color: var(--ui-text-muted);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .guided-feature-card__state--selected {
    color: var(--ui-text-primary);
  }

  .guided-feature-card__check {
    width: 1.7rem;
    height: 1.7rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid var(--ui-border-default);
    color: transparent;
    background: color-mix(in srgb, var(--ui-surface-secondary) 76%, transparent);
    transition: border-color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .guided-feature-card__check--selected {
    border-color: color-mix(in srgb, var(--ui-text-primary) 28%, var(--ui-border-default) 72%);
    background: color-mix(in srgb, var(--ui-text-primary) 12%, var(--ui-surface-card) 88%);
    color: var(--ui-text-primary);
  }

  .guided-feature-card__check :global(svg) {
    width: 0.9rem;
    height: 0.9rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

  .guided-feature-card__error {
    margin-top: 0.45rem;
    color: var(--ui-accent-danger);
    font-size: 0.8125rem;
  }

  .guided-action-bar {
    align-items: center;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid color-mix(in srgb, var(--ui-border-default) 84%, transparent);
  }

  .guided-action-bar__count {
    font-size: 1rem;
    line-height: 1.25;
    font-weight: 600;
  }

  .guided-action-bar__actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    flex: 0 0 auto;
  }

  .progress-hero__features {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .progress-rail {
    display: grid;
    gap: 0.55rem;
  }

  .progress-rail__value {
    justify-self: end;
    color: var(--ui-text-secondary);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  :global(.progress-rail__bar) {
    height: 0.6rem;
  }

  .progress-steps {
    gap: 0.65rem;
  }

  .progress-step {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    min-height: 3rem;
    padding: 0.85rem 0.95rem;
    border-radius: calc(var(--ui-radius-md) - 0.05rem);
    border: 1px solid var(--ui-border-default);
    background: color-mix(in srgb, var(--ui-surface-card) 86%, var(--ui-surface-secondary) 14%);
  }

  .progress-step--complete {
    border-color: color-mix(in srgb, var(--ui-accent-success) 28%, var(--ui-border-default) 72%);
    background: color-mix(in srgb, var(--ui-accent-success) 8%, var(--ui-surface-card) 92%);
  }

  .progress-step--current {
    border-color: color-mix(in srgb, var(--ui-text-primary) 16%, var(--ui-border-default) 84%);
    background: color-mix(in srgb, var(--ui-surface-secondary) 72%, var(--ui-surface-card) 28%);
  }

  .progress-step--failed {
    border-color: color-mix(in srgb, var(--ui-accent-danger) 28%, var(--ui-border-default) 72%);
    background: color-mix(in srgb, var(--ui-accent-danger) 8%, var(--ui-surface-card) 92%);
  }

  .progress-step__marker {
    width: 1.4rem;
    height: 1.4rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    border-radius: 999px;
    border: 1px solid var(--ui-border-default);
    color: var(--ui-text-secondary);
  }

  .progress-step--complete .progress-step__marker {
    border-color: color-mix(in srgb, var(--ui-accent-success) 28%, var(--ui-border-default) 72%);
    color: var(--ui-accent-success);
  }

  .progress-step--failed .progress-step__marker {
    border-color: color-mix(in srgb, var(--ui-accent-danger) 28%, var(--ui-border-default) 72%);
    color: var(--ui-accent-danger);
  }

  .progress-step__marker :global(svg) {
    width: 0.85rem;
    height: 0.85rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.15;
  }

  .progress-step__pulse {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 999px;
    background: var(--ui-text-primary);
    animation: guided-pulse 1.25s ease-in-out infinite;
  }

  .progress-step__cross {
    position: relative;
    width: 0.65rem;
    height: 0.65rem;
  }

  .progress-step__cross::before,
  .progress-step__cross::after {
    content: "";
    position: absolute;
    inset: 0.3rem;
    background: currentColor;
    transform-origin: center;
  }

  .progress-step__cross::before {
    transform: rotate(45deg);
  }

  .progress-step__cross::after {
    transform: rotate(-45deg);
  }

  .progress-step__copy p {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: 0.92rem;
    line-height: 1.5;
    font-weight: 500;
  }

  @keyframes guided-pulse {
    0%, 100% {
      transform: scale(0.82);
      opacity: 0.42;
    }

    50% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @media (max-width: 1024px) {
    .guided-feature-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .guided-feature-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    :global(.home-page) {
      gap: var(--study-flow-page-gap-mobile);
    }
  }

  @media (max-width: 640px) {
    .guided-step-header__title-row,
    .guided-action-bar,
    .guided-action-bar__actions,
    .progress-hero__features {
      width: 100%;
    }

    .guided-action-bar__actions :global(.ui-button) {
      flex: 1 1 0;
      min-width: 0;
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    :global(.home-page .home-stat-card) {
      min-height: 128px;
    }
  }
</style>
