<script>
  import { onMount } from "svelte";
  import { API_BASE } from "../config.js";
  import { t } from "../lib/i18n/t.js";
  import { language as languageStore } from "../lib/stores/language.js";
  import Badge from "../lib/components/ui/Badge.svelte";
  import Card from "../lib/components/ui/Card.svelte";
  import StatCard from "../lib/components/ui/StatCard.svelte";
  import DashboardCardSkeleton from "../lib/components/ui/DashboardCardSkeleton.svelte";
  import UploadPanel from "../lib/components/ui/UploadPanel.svelte";
  import { readPageCache, writePageCache } from "../stores/pageCache.js";

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
  const MAX_UPLOAD_FILES = 5;
  const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
  const VALID_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];
  const VALID_EXTENSIONS = [".pdf", ".docx", ".pptx"];

  let user = null;
  let documents = [];
  let selectedFiles = [];
  let responseLanguage = "english";
  let errorKey = "";
  let errorArgs = {};
  let uploading = false;
  let isLoadingDashboard = true;
  let isRefreshingDashboard = false;
  let error = "";
  let uploadError = "";
  $: _lang = $languageStore;

  $: translatedError = errorKey ? t(errorKey, errorArgs) : "";
  $: uploadError = UPLOAD_ERROR_KEYS.has(errorKey) ? translatedError : "";
  $: error = UPLOAD_ERROR_KEYS.has(errorKey) ? "" : translatedError;

  $: normalizedRole = (user?.role || "").toLowerCase();
  $: remainingDocumentsValue = user?.remainingDocuments ?? user?.documentsRemaining ?? 0;
  $: canUploadDocuments = normalizedRole === "admin" || remainingDocumentsValue > 0;
  $: showQuotaReachedMessage = !isLoadingDashboard && !!user && !canUploadDocuments;
  $: showUploadSection = !isLoadingDashboard && !!user && canUploadDocuments;
  $: usedThisMonthValue = user?.documentsUsed ?? user?.usedThisMonth ?? 0;
  $: monthlyLimitValue = user?.monthlyLimit ?? 0;
  $: totalDocumentsValue = Array.isArray(documents) ? documents.length : 0;

  $: if (!canUploadDocuments) {
    selectedFiles = [];
    clearUploadError();
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
    if (uploading) return;
    selectedFiles = [];
    clearUploadError();
  }

  function isValidFileType(file) {
    const lowerName = file.name.toLowerCase();
    const hasValidExtension = VALID_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    return VALID_TYPES.includes(file.type) || hasValidExtension;
  }

  function addSelectedFiles(candidates) {
    if (!canUploadDocuments || uploading || !Array.isArray(candidates) || candidates.length === 0) return;

    if (selectedFiles.length >= MAX_UPLOAD_FILES) {
      setUploadError("home.uploadSection.errors.maxFiles", { max: MAX_UPLOAD_FILES });
      return;
    }

    const uniqueIncoming = [];
    for (const file of candidates) {
      const duplicate = selectedFiles.some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified
      );

      if (!duplicate) {
        uniqueIncoming.push(file);
      }
    }

    if (uniqueIncoming.length === 0) return;

    for (const file of uniqueIncoming) {
      if (!isValidFileType(file)) {
        setUploadError("home.uploadSection.errors.invalidType");
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError("home.uploadSection.errors.fileTooLarge");
        return;
      }
    }

    const remainingSlots = MAX_UPLOAD_FILES - selectedFiles.length;
    const filesToAdd = uniqueIncoming.slice(0, remainingSlots);
    selectedFiles = [...selectedFiles, ...filesToAdd];

    if (uniqueIncoming.length > filesToAdd.length) {
      setUploadError("home.uploadSection.errors.maxFiles", { max: MAX_UPLOAD_FILES });
      return;
    }

    clearUploadError();
  }

  function handleFilesSelected(event) {
    addSelectedFiles(event?.detail?.files ?? []);
  }

  function handleRemoveSelectedFile(event) {
    const index = event?.detail?.index;
    if (!Number.isInteger(index) || index < 0 || index >= selectedFiles.length) return;
    selectedFiles = selectedFiles.filter((_, currentIndex) => currentIndex !== index);
    clearUploadError();
  }

  async function uploadSingleFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", responseLanguage);

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

    try {
      let firstDocumentId = "";

      for (const file of selectedFiles) {
        const data = await uploadSingleFile(file);
        const documentId = data?.documentId ?? data?.document?.id;
        if (!documentId) {
          throw new Error("Upload succeeded without document context");
        }
        if (!firstDocumentId) {
          firstDocumentId = documentId;
        }
      }

      selectedFiles = [];

      if (typeof window !== "undefined") {
        window.location.hash = `/study?highlight=${encodeURIComponent(firstDocumentId)}`;
      }
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
</script>

<div class="home-page">
  <Card as="section" class="page-hero" variant="base" padding="lg" border="strong" aria-labelledby="home-title">
    <div class="page-hero__copy">
      <div class="page-hero__badges">
        <Badge tone="neutral" variant="outline" size="sm" className="home-eyebrow">{t('nav.home')}</Badge>
        {#if isRefreshingDashboard}
          <Badge tone="neutral" size="sm" className="refresh-indicator">{t('common.loading')}</Badge>
        {/if}
      </div>

      <div class="page-hero__heading">
        <h1 id="home-title">{t('home.heroTitle')}</h1>
        <p class="subtitle">{t('home.heroSubtitle')}</p>
      </div>
    </div>
  </Card>

  {#if isLoadingDashboard}
    <section class="stats-grid" aria-label={t('nav.home')}>
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
    </section>
  {:else if user}
    <section class="stats-grid" aria-label={t('nav.home')}>
      <StatCard
        className="home-stat-card"
        label={t('home.stats.documentsRemaining')}
        value={normalizedRole === 'admin' ? t('home.stats.unlimited') : remainingDocumentsValue}
        valueClassName={normalizedRole === 'admin' ? 'stat-value-admin' : ''}
      />
      <StatCard
        className="home-stat-card"
        label={t('home.stats.usedThisMonth')}
        value={`${usedThisMonthValue}/${monthlyLimitValue}`}
      />
      <StatCard
        className="home-stat-card"
        label={t('home.stats.totalDocuments')}
        value={totalDocumentsValue}
      />
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
    <section class="upload-section" aria-label={t('home.uploadSection.modalTitle')}>
      <UploadPanel
        busy={uploading}
        maxFiles={MAX_UPLOAD_FILES}
        files={selectedFiles}
        accept={VALID_EXTENSIONS.join(',')}
        multiple={true}
        title={t('home.uploadSection.modalTitle')}
        description={t('home.uploadSection.modalDescription')}
        dropzoneTitle={t('home.uploadSection.dropzoneTitle')}
        dropzoneOr={t('home.uploadSection.dropzoneOr')}
        browseLabel={t('home.uploadSection.browse')}
        supportLabel={t('home.uploadSection.supportedFiles')}
        cancelLabel={t('home.uploadSection.cancel')}
        submitLabel={t('home.uploadSection.next')}
        submitBusyLabel={t('home.uploadSection.submitProcessing')}
        removeFileLabel={t('home.uploadSection.removeFile')}
        errorMessage={uploadError}
        on:cancel={clearSelectedFiles}
        on:submit={handleUpload}
        on:filesSelected={handleFilesSelected}
        on:removeFile={handleRemoveSelectedFile}
      />
    </section>
  {/if}
</div>

<style>
  .home-page {
    width: min(100%, 64rem);
    margin: 0 auto;
    display: grid;
    gap: 1.5rem;
    min-width: 0;
  }

  :global(.page-hero) {
    display: grid;
    gap: 1rem;
    min-width: 0;
    background:
      radial-gradient(circle at top right, color-mix(in srgb, var(--foreground) 7%, transparent) 0%, transparent 46%),
      linear-gradient(180deg, color-mix(in srgb, var(--card) 92%, var(--muted) 8%) 0%, var(--card) 100%);
  }

  .page-hero__copy {
    display: grid;
    gap: 0.875rem;
    min-width: 0;
  }

  .page-hero__badges {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  :global(.home-eyebrow) {
    min-height: 22px;
    border-color: color-mix(in srgb, var(--foreground) 10%, transparent);
    color: var(--muted-foreground);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  :global(.refresh-indicator) {
    min-height: 22px;
    background: color-mix(in srgb, var(--muted) 82%, transparent);
    color: var(--muted-foreground);
  }

  .page-hero__heading {
    display: grid;
    gap: 0.5rem;
    min-width: 0;
  }

  .page-hero__heading h1 {
    margin: 0;
    color: var(--foreground);
    font-size: clamp(1.7rem, 4vw, 2.1rem);
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.05;
  }

  .subtitle {
    margin: 0;
    max-width: 44rem;
    color: var(--muted-foreground);
    font-size: 0.98rem;
    line-height: 1.6;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    min-width: 0;
  }

  .home-page :global(.home-stat-card) {
    min-height: 118px;
  }

  .home-page :global(.home-stat-card .stat-value-admin),
  .home-page :global(.home-stat-card .ui-stat-card__value.stat-value-admin) {
    font-size: 1.2rem;
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

  .upload-section {
    min-width: 0;
  }

  .upload-section :global(.upload-panel) {
    gap: 1.5rem;
    padding: 1.5rem;
    border-color: var(--border);
    border-radius: 1rem;
    background: var(--card);
    box-shadow: var(--shadow-card);
  }

  .upload-section :global(.upload-panel__titles) {
    gap: 0.35rem;
  }

  .upload-section :global(.upload-panel__titles h2) {
    color: var(--foreground);
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .upload-section :global(.upload-panel__titles p) {
    max-width: 44rem;
    color: var(--muted-foreground);
    line-height: 1.55;
  }

  .upload-section :global(.upload-panel__support) {
    margin-top: -0.5rem;
  }

  .upload-section :global(.upload-dropzone) {
    gap: 0.875rem;
    padding: clamp(1.75rem, 5vw, 3rem) 1.25rem;
    border-color: color-mix(in srgb, var(--foreground) 10%, transparent);
    border-radius: 0.875rem;
    background: color-mix(in srgb, var(--card) 74%, var(--muted) 26%);
  }

  .upload-section :global(.upload-dropzone:hover:not(.upload-dropzone--disabled)),
  .upload-section :global(.upload-dropzone--active) {
    border-color: color-mix(in srgb, var(--foreground) 16%, transparent);
    background: color-mix(in srgb, var(--card) 60%, var(--muted) 40%);
  }

  .upload-section :global(.upload-dropzone__icon) {
    width: 48px;
    height: 48px;
    border-radius: 0.875rem;
    border-color: var(--border);
    background: var(--muted);
    color: var(--foreground);
  }

  .upload-section :global(.upload-dropzone__icon svg) {
    width: 22px;
    height: 22px;
  }

  .upload-section :global(.upload-dropzone__title) {
    max-width: 36rem;
    color: var(--foreground);
    font-size: 0.95rem;
    line-height: 1.45;
  }

  .upload-section :global(.upload-dropzone__divider) {
    width: min(520px, 100%);
  }

  .upload-section :global(.upload-dropzone__divider strong) {
    color: var(--muted-foreground);
  }

  .upload-section :global(.upload-dropzone__browse.ui-button) {
    --button-bg: var(--background);
    --button-bg-hover: color-mix(in srgb, var(--accent) 72%, transparent);
    --button-bg-active: color-mix(in srgb, var(--accent) 90%, transparent);
    --button-fg: var(--foreground);
    --button-fg-hover: var(--foreground);
    --button-border: var(--border);
    --button-border-hover: var(--border);
    --button-shadow: var(--shadow-inline-control);
    min-width: 148px;
  }

  .upload-section :global(.upload-panel__files) {
    gap: 0.75rem;
  }

  .upload-section :global(.upload-panel__footer) {
    padding-top: 1rem;
    margin-top: 0;
    border-top-color: var(--border);
  }

  .upload-section :global(.upload-panel__counter) {
    color: var(--muted-foreground);
  }

  @media (max-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 720px) {
    .page-hero__heading h1 {
      font-size: clamp(1.5rem, 7vw, 1.9rem);
    }
  }

  @media (max-width: 680px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
