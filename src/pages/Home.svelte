<script>
  import { onMount } from "svelte";
  import { API_BASE } from "../config.js";
  import { t } from "../lib/i18n/t.js";
  import { language as languageStore } from "../lib/stores/language.js";
  import Button from "../lib/components/ui/Button.svelte";
  import Card from "../lib/components/ui/Card.svelte";
  import Tabs from "../lib/components/ui/Tabs.svelte";
  import DashboardCardSkeleton from "../lib/components/ui/DashboardCardSkeleton.svelte";
  import { readPageCache, writePageCache } from "../stores/pageCache.js";

  const UPLOAD_ERROR_KEYS = new Set([
    "home.uploadSection.errors.selectFile",
    "home.uploadSection.errors.invalidType",
    "home.uploadSection.errors.fileTooLarge",
    "home.uploadSection.errors.limitReached",
    "home.uploadSection.errors.uploadFailed",
    "home.uploadSection.errors.network",
  ]);
  const HOME_CACHE_KEY = "page:home";

  let user = null;
  let documents = [];
  let selectedFile = null;
  let responseLanguage = "english";
  let errorKey = "";
  let errorArgs = {};
  let uploading = false;
  let isLoadingDashboard = true;
  let isRefreshingDashboard = false;
  let isDragActive = false;
  let error = "";
  $: _lang = $languageStore;
  $: error = errorKey ? t(errorKey, errorArgs) : "";
  $: languageOptions = [
    {
      value: "english",
      label: t("home.uploadSection.englishOption"),
    },
    {
      value: "arabic",
      label: t("home.uploadSection.arabicOption"),
    },
  ];

  $: normalizedRole = (user?.role || "").toLowerCase();
  $: remainingDocumentsValue = user?.remainingDocuments ?? user?.documentsRemaining ?? 0;
  $: canUploadDocuments = normalizedRole === "admin" || remainingDocumentsValue > 0;
  $: showQuotaReachedMessage = !isLoadingDashboard && !!user && !canUploadDocuments;
  $: showUploadSection = !isLoadingDashboard && !!user && canUploadDocuments;
  $: usedThisMonthValue = user?.documentsUsed ?? user?.usedThisMonth ?? 0;
  $: monthlyLimitValue = user?.monthlyLimit ?? 0;
  $: totalDocumentsValue = Array.isArray(documents) ? documents.length : 0;
  $: if (!canUploadDocuments) {
    selectedFile = null;
    isDragActive = false;
    if (UPLOAD_ERROR_KEYS.has(errorKey)) {
      errorKey = "";
      errorArgs = {};
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

  async function fetchUserData({ background = false } = {}) {
    if (background) {
      isRefreshingDashboard = true;
    } else {
      isLoadingDashboard = true;
    }

    try {
      // Use the new /api/user/me endpoint with credentials
      const response = await fetch(
        `${API_BASE}/api/user/me`,
        {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' // Important for sending cookies
        }
      );
      if (!response.ok) throw new Error('Failed to fetch data');
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

  function handleFileSelect(event) {
    if (!canUploadDocuments) {
      event.target.value = "";
      return;
    }

    const file = event.target.files[0];
    validateAndSelectFile(file);
  }

  function handleDragOver(event) {
    event.preventDefault();
    if (!canUploadDocuments || uploading) {
      isDragActive = false;
      return;
    }

    isDragActive = true;
  }

  function handleDragLeave(event) {
    event.preventDefault();
    isDragActive = false;
  }

  function handleDrop(event) {
    event.preventDefault();
    isDragActive = false;
    if (!canUploadDocuments || uploading) return;

    const file = event.dataTransfer.files[0];
    validateAndSelectFile(file);
  }

  function validateAndSelectFile(file) {
    if (!canUploadDocuments || !file) return;

    // Check file type
    const validTypes = [
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ];
    
    // Simple extension check fallback
    const validExtensions = ['.pdf', '.docx', '.pptx'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExt) {
       errorKey = "home.uploadSection.errors.invalidType";
       errorArgs = {};
       return;
    }

    if (file.size > 25 * 1024 * 1024) { // 25MB limit
       errorKey = "home.uploadSection.errors.fileTooLarge";
       errorArgs = {}; 
       return;
    }

    selectedFile = file;
    errorKey = "";
    errorArgs = {};
  }

  async function handleUpload() {
    if (!user || !canUploadDocuments) {
      errorKey = "home.uploadSection.errors.limitReached";
      errorArgs = {};
      return;
    }

    if (!selectedFile) {
      errorKey = "home.uploadSection.errors.selectFile";
      errorArgs = {};
      return;
    }

    uploading = true;
    errorKey = "";
    errorArgs = {};

    const formData = new FormData();
    formData.append("file", selectedFile);
    // clerkId removed
    formData.append("language", responseLanguage);

    try {
      const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true; // Crucial for Better Auth cookies

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

      const documentId = data?.documentId ?? data?.document?.id;
      if (!documentId) {
        throw new Error("Upload succeeded without document context");
      }

      if (typeof window !== "undefined") {
        window.location.hash = `/study?highlight=${encodeURIComponent(documentId)}`;
      }
    } catch (err) {
      console.error("Upload error:", err);
      const message = (err?.message || "").toUpperCase();
      if (message === "NETWORK_ERROR") {
        errorKey = "home.uploadSection.errors.network";
        errorArgs = {};
      } else {
        errorKey = "home.uploadSection.errors.uploadFailed";
        errorArgs = {};
      }
    } finally {
      uploading = false;
    }
  }

  function handleLanguageChange(event) {
    const nextLanguage = event?.detail?.value;
    if (nextLanguage === "english" || nextLanguage === "arabic") {
      responseLanguage = nextLanguage;
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
    <div class="upload-section">
      <h2>{t('home.uploadSection.title')}</h2>

      <Card
        class={`upload-card ${isDragActive ? "drag-active" : ""}`}
        variant="soft"
        border="dashed"
        padding="lg"
        on:dragover={handleDragOver}
        on:dragleave={handleDragLeave}
        on:drop={handleDrop}
        role="region"
        aria-label={t('home.uploadSection.title')}
      >
        <div class="language-selector">
          <span class="lang-label">{t('home.uploadSection.languageLabel')}:</span>
          <Tabs
            class="lang-toggle"
            ariaLabel={t("home.uploadSection.languageLabel")}
            items={languageOptions}
            value={responseLanguage}
            on:change={handleLanguageChange}
          />
        </div>

        <div class="file-input-wrapper">
          <input
            type="file"
            id="file-input"
            accept=".pdf,.docx,.pptx"
            on:change={handleFileSelect}
            disabled={uploading || !canUploadDocuments}
          />
          <label for="file-input" class="file-label" class:active={isDragActive}>
            {#if isDragActive}
              <div class="drag-overlay">
                <svg class="upload-icon bounce" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" x2="12" y1="3" y2="15"/>
                </svg>
                <span class="file-label-text">{t('home.uploadSection.dragActive')}</span>
              </div>
            {:else if selectedFile}
              <svg class="upload-icon success" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span class="file-label-text highlight">{selectedFile.name}</span>
              <span class="file-status-text">{t('home.uploadSection.fileSelected')}</span>
            {:else}
              <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" x2="12" y1="3" y2="15"/>
              </svg>
              <span class="file-label-text">{t('home.uploadSection.filePlaceholder')}</span>
              <span class="file-constraints">{t('home.uploadSection.constraints')}</span>
            {/if}
          </label>
        </div>

        <!-- Removed separate file-info p since it's now integrated in the drop zone -->

        <Button
          class="upload-submit"
          variant="primary"
          block
          on:click={handleUpload}
          disabled={!selectedFile || uploading || !canUploadDocuments}
          loading={uploading}
        >
          {#if uploading}
            {t('home.uploadSection.submitProcessing')}
          {:else}
            {t('home.uploadSection.submit')}
          {/if}
        </Button>
      </Card>
    </div>
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

  .upload-section {
    margin-bottom: var(--space-4);
  }

  .upload-section h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: var(--color-text-primary);
  }

  :global(.upload-card) {
    transition: border-color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard);
  }
  
  :global(.upload-card.drag-active) {
    border-color: var(--color-accent-primary);
    background: color-mix(in srgb, var(--color-accent-primary) 12%, var(--ui-surface-base) 88%);
    box-shadow: var(--ui-focus-ring);
  }

  .language-selector {
    margin-bottom: 2rem;
  }

  .lang-label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--color-text-primary);
    font-size: 0.95rem;
  }

  :global(.lang-toggle) {
    display: inline-grid;
  }

  .file-input-wrapper {
    margin-bottom: 1rem;
    cursor: pointer;
  }

  #file-input {
    display: none;
  }

  .file-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    padding: 48px 24px;
    border: 2px dashed var(--color-accent-outline);
    border-radius: 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: color-mix(in srgb, var(--color-surface-1) 65%, transparent);
    color: var(--color-text-secondary);
    position: relative;
    overflow: hidden;
  }

  .file-label:hover, .file-label.active {
    border-color: var(--color-accent-outline-strong);
    background: color-mix(in srgb, var(--color-surface-1) 82%, transparent);
    color: var(--color-text-primary);
  }

  .drag-overlay {
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--color-accent-primary);
  }

  .upload-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    color: var(--color-accent-primary);
    transition: all 0.3s ease;
  }
  
  .upload-icon.bounce {
    animation: bounce 1s infinite;
  }
  
  .upload-icon.success {
    color: var(--color-success);
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .file-label:hover .upload-icon {
    color: var(--color-accent-primary);
    transform: translateY(-2px);
  }

  .file-label-text {
    font-size: 1rem;
    font-weight: 500;
  }
  
  .file-label-text.highlight {
    color: var(--color-accent-primary);
    font-weight: 600;
  }

  .file-constraints {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }
  
  .file-status-text {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: var(--color-success);
    font-weight: 500;
  }

  :global(.upload-submit) {
    min-height: var(--ui-control-height-lg);
    font-size: 1.1rem;
    font-weight: 700;
  }

  @media (max-width: 768px) {
    .study-assistant-container {
      padding: var(--space-3);
    }

    .study-header h1 {
      font-size: 1.75rem;
    }

    :global(.lang-toggle) {
      display: flex;
      width: 100%;
    }
  }
</style>
