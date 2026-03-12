<script>
  import { onMount } from "svelte";
  import { API_BASE } from "../config.js";
  import { t } from "../lib/i18n/t.js";
  import { language as languageStore } from "../lib/stores/language.js";
  import Button from "../lib/components/ui/Button.svelte";
  import Card from "../lib/components/ui/Card.svelte";
  import DashboardCardSkeleton from "../lib/components/ui/DashboardCardSkeleton.svelte";
  import UploadModal from "../lib/components/ui/UploadModal.svelte";
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
  let uploadModalOpen = false;
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
    uploadModalOpen = false;
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

  function openUploadModal() {
    if (!canUploadDocuments || uploading) return;
    uploadModalOpen = true;
    clearUploadError();
  }

  function closeUploadModal() {
    if (uploading) return;
    uploadModalOpen = false;
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

      uploadModalOpen = false;
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

<div class="study-assistant-container">
  <header class="study-header">
    <h1>{t('home.heroTitle')}</h1>
    <p>{t('home.heroSubtitle')}</p>
    {#if isRefreshingDashboard}
      <p class="refresh-indicator">{t('common.loading')}</p>
    {/if}
  </header>

  {#if isLoadingDashboard}
    <div class="usage-stats">
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
    </div>
  {:else if user}
    <div class="usage-stats">
      <Card class="home-stat-card" variant="raised" padding="md">
        <div class="stat-value" style={normalizedRole === 'admin' ? "font-size:1.8rem" : ""}>
          {normalizedRole === 'admin' ? t('home.stats.unlimited') : remainingDocumentsValue}
        </div>
        <div class="stat-label">{t('home.stats.documentsRemaining')}</div>
      </Card>
      <Card class="home-stat-card" variant="raised" padding="md">
        <div class="stat-value">{usedThisMonthValue}/{monthlyLimitValue}</div>
        <div class="stat-label">{t('home.stats.usedThisMonth')}</div>
      </Card>
      <Card class="home-stat-card" variant="raised" padding="md">
        <div class="stat-value">{totalDocumentsValue}</div>
        <div class="stat-label">{t('home.stats.totalDocuments')}</div>
      </Card>
    </div>
  {/if}

  {#if error}
    <Card class="home-alert home-alert-error" variant="soft" border="strong" padding="sm">{error}</Card>
  {/if}

  {#if showQuotaReachedMessage}
    <Card class="quota-message" variant="raised" border="accent" padding="lg" role="status" aria-live="polite">
      <h2>{t("home.quotaReached.title")}</h2>
      <p>{t("home.quotaReached.body")}</p>
      <p class="quota-message-secondary">{t("home.quotaReached.upgradeHint")}</p>
    </Card>
  {/if}

  {#if showUploadSection}
    <Card class="upload-launcher" variant="raised" padding="lg">
      <div>
        <h2>{t('home.uploadSection.title')}</h2>
        <p>{t('home.uploadSection.modalDescription')}</p>
      </div>
      <Button variant="primary" size="lg" on:click={openUploadModal} disabled={uploading || !canUploadDocuments}>
        {t('home.uploadSection.openModalCta')}
      </Button>
    </Card>

    <UploadModal
      open={uploadModalOpen}
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
      closeLabel={t('common.close')}
      errorMessage={uploadError}
      on:close={closeUploadModal}
      on:submit={handleUpload}
      on:filesSelected={handleFilesSelected}
      on:removeFile={handleRemoveSelectedFile}
    />
  {/if}
</div>

<style>
  .study-assistant-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-5);
    display: grid;
    gap: var(--space-4);
  }

  .study-header {
    text-align: center;
    margin-bottom: var(--space-4);
  }

  .study-header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    background: var(--gradient-accent-strong);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .study-header p {
    color: var(--color-text-secondary);
    font-size: 1.1rem;
  }

  .refresh-indicator {
    font-size: 0.9rem;
    margin: 0.35rem 0 0;
    color: var(--color-text-muted);
  }

  .usage-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-4);
  }

  .usage-stats :global(.home-stat-card) {
    text-align: center;
    min-height: 128px;
  }

  .stat-value {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--color-text-primary);
    -webkit-text-fill-color: var(--color-text-primary);
    margin-bottom: 0.5rem;
    opacity: 1;
  }

  .stat-label {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }

  :global(.home-alert) {
    margin-bottom: var(--space-4);
    font-weight: 500;
  }

  :global(.home-alert-error) {
    color: var(--color-danger);
    border-color: var(--color-danger-border);
    background: var(--color-danger-surface);
  }

  :global(.quota-message) {
    margin-bottom: var(--space-4);
    box-shadow: var(--ui-shadow-md);
  }

  :global(.quota-message h2) {
    margin: 0 0 0.75rem;
    font-size: 1.35rem;
    color: var(--color-text-primary);
  }

  :global(.quota-message p) {
    margin: 0;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .quota-message-secondary {
    margin-top: 0.75rem;
    color: var(--color-text-muted);
    font-size: 0.95rem;
  }

  :global(.upload-launcher.ui-card) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
  }

  :global(.upload-launcher) h2,
  :global(.upload-launcher) p {
    margin: 0;
  }

  :global(.upload-launcher) h2 {
    color: var(--color-text-primary);
    font-size: 1.55rem;
  }

  :global(.upload-launcher) p {
    color: var(--color-text-secondary);
    margin-top: var(--space-1);
  }

  @media (max-width: 768px) {
    .study-assistant-container {
      padding: var(--space-3);
    }

    .study-header h1 {
      font-size: 1.75rem;
    }

    :global(.upload-launcher.ui-card) {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
