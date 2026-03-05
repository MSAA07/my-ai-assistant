<script>
  import { onMount } from "svelte";
  import { API_BASE } from "../config.js";
  import { session } from "../stores/auth.js";
  import { t } from "../lib/i18n/t.js";
  import { language as languageStore } from "../lib/stores/language.js";

  let user = null;
  let documents = [];
  let selectedFile = null;
  let responseLanguage = "english";
  let errorKey = "";
  let errorArgs = {};
  let successKey = "";
  let successArgs = {};
  let uploading = false;
  let isLoadingDashboard = true;
  let isDragActive = false;
  let error = "";
  let success = "";
  $: _lang = $languageStore;
  $: error = errorKey ? t(errorKey, errorArgs) : "";
  $: success = successKey ? t(successKey, successArgs) : "";

  // Progress tracking
  let uploadProgress = 0;
  let uploadStageKey = "";
  let uploadStage = "";
  $: uploadStage = uploadStageKey ? t(uploadStageKey) : "";
  let progressInterval = null;

  $: normalizedRole = (user?.role || "").toLowerCase();
  $: remainingDocumentsValue = user?.remainingDocuments ?? user?.documentsRemaining ?? 0;
  $: usedThisMonthValue = user?.documentsUsed ?? user?.usedThisMonth ?? 0;
  $: monthlyLimitValue = user?.monthlyLimit ?? 0;
  $: totalDocumentsValue = Array.isArray(documents) ? documents.length : 0;

  onMount(async () => {
    await fetchUserData();
  });

  async function fetchUserData() {
    isLoadingDashboard = true;
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
      errorKey = "";
      errorArgs = {};
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      errorKey = "home.alerts.error";
      errorArgs = {};
    } finally {
      isLoadingDashboard = false;
    }
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];
    validateAndSelectFile(file);
  }

  function handleDragOver(event) {
    event.preventDefault();
    if (!uploading) isDragActive = true;
  }

  function handleDragLeave(event) {
    event.preventDefault();
    isDragActive = false;
  }

  function handleDrop(event) {
    event.preventDefault();
    isDragActive = false;
    if (uploading) return;

    const file = event.dataTransfer.files[0];
    validateAndSelectFile(file);
  }

  function validateAndSelectFile(file) {
    if (!file) return;
    
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
    successKey = "";
    successArgs = {};
  }

  function clearProgress() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    uploadProgress = 0;
    uploadStageKey = "";
  }

  async function handleUpload() {
    if (!selectedFile) {
      errorKey = "home.uploadSection.errors.selectFile";
      errorArgs = {};
      return;
    }

    if (!user || (normalizedRole !== 'admin' && user.plan !== 'premium' && remainingDocumentsValue <= 0)) {
      errorKey = "home.uploadSection.errors.limitReached";
      errorArgs = {};
      return;
    }

    uploading = true;
    errorKey = "";
    errorArgs = {};
    successKey = "";
    successArgs = {};
    uploadProgress = 0;
    uploadStageKey = "home.processing.stages.upload";

    const formData = new FormData();
    formData.append("file", selectedFile);
    // clerkId removed
    formData.append("language", responseLanguage);

    try {
      const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true; // Crucial for Better Auth cookies

        // Track real upload progress (0-30%)
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            uploadProgress = Math.round((e.loaded / e.total) * 30);
            uploadStageKey = "home.processing.stages.upload";
          }
        });

        xhr.upload.addEventListener("load", () => {
          // Upload done, now server is processing
          uploadProgress = 30;
          uploadStageKey = "home.processing.stages.extract";

          // Simulate server-side progress stages
          let simProgress = 30;
          progressInterval = setInterval(() => {
            if (simProgress < 50) {
              simProgress += 2;
              uploadStageKey = "home.processing.stages.extract";
            } else if (simProgress < 85) {
              simProgress += 1;
              uploadStageKey = "home.processing.stages.generate";
            } else if (simProgress < 95) {
              simProgress += 0.5;
              uploadStageKey = "home.processing.stages.save";
            }
            uploadProgress = Math.min(Math.round(simProgress), 95);
          }, 500);
        });

        xhr.addEventListener("load", () => {
          clearProgress();
          try {
            const response = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              uploadProgress = 100;
              uploadStageKey = "home.processing.complete";
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
          clearProgress();
          reject(new Error("NETWORK_ERROR"));
        });

        xhr.open("POST", `${API_BASE}/api/upload`);
        xhr.send(formData);
      });

      uploadProgress = 100;
      uploadStageKey = "home.processing.complete";

      successKey = "home.uploadSection.success";
      successArgs = {
        flashcards: data.document.flashcards.length,
        questions: data.document.examQuestions.length,
      };
      selectedFile = null;
      document.getElementById("file-input").value = "";
      await fetchUserData();

      // Navigate to the document view
      setTimeout(() => {
        window.location.hash = `/document/${data.document.id}`;
      }, 1500);
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
      clearProgress();
      uploading = false;
    }
  }

  function viewDocument(docId) {
    window.location.hash = `/document/${docId}`;
  }

  async function deleteDocument(docId) {
    if (!confirm(t("home.documents.deleteConfirm"))) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/document/${docId}`,
        {
          method: "DELETE",
          credentials: 'include'
        },
      );

      if (response.ok) {
        await fetchUserData();
        successKey = "home.documents.deleteSuccess";
        successArgs = {};
      } else {
        errorKey = "home.documents.deleteError";
        errorArgs = {};
      }
    } catch (err) {
      errorKey = "home.documents.deleteError";
      errorArgs = {};
    }
  }
</script>

{#if uploading}
  <div class="upload-overlay">
    <div class="overlay-content">
      <div class="overlay-icon">
        {#if uploadProgress < 100}
          <div class="overlay-spinner"></div>
        {:else}
          <div class="overlay-check">&#10003;</div>
        {/if}
      </div>
      <h2>{t('home.processing.title')}</h2>
      <div class="overlay-progress-bar">
        <div class="overlay-progress-fill" style="width: {uploadProgress}%"></div>
      </div>
      <div class="overlay-stats">
        <span class="overlay-stage">{uploadStage}</span>
        <span class="overlay-percent">{uploadProgress}%</span>
      </div>
      <div class="overlay-steps">
        <div class="step" class:step-active={uploadProgress > 0} class:step-done={uploadProgress >= 30}>
          <span class="step-dot"></span>
          <span>{t('home.processing.stages.upload')}</span>
        </div>
        <div class="step" class:step-active={uploadProgress >= 30} class:step-done={uploadProgress >= 50}>
          <span class="step-dot"></span>
          <span>{t('home.processing.stages.extract')}</span>
        </div>
        <div class="step" class:step-active={uploadProgress >= 50} class:step-done={uploadProgress >= 90}>
          <span class="step-dot"></span>
          <span>{t('home.processing.stages.generate')}</span>
        </div>
        <div class="step" class:step-active={uploadProgress >= 90} class:step-done={uploadProgress >= 100}>
          <span class="step-dot"></span>
          <span>{t('home.processing.stages.save')}</span>
        </div>
      </div>
    </div>
  </div>
{/if}

<div class="study-assistant-container">
  <header class="study-header">
    <h1>{t('home.heroTitle')}</h1>
    <p>{t('home.heroSubtitle')}</p>
  </header>

  {#if isLoadingDashboard}
    <div class="usage-stats">
      <div class="stat-card skeleton">
        <div class="stat-value skeleton-text"></div>
        <div class="stat-label skeleton-text-sm"></div>
      </div>
      <div class="stat-card skeleton">
        <div class="stat-value skeleton-text"></div>
        <div class="stat-label skeleton-text-sm"></div>
      </div>
      <div class="stat-card skeleton">
        <div class="stat-value skeleton-text"></div>
        <div class="stat-label skeleton-text-sm"></div>
      </div>
    </div>
  {:else if user}
    <div class="usage-stats">
      <div class="stat-card">
        <div class="stat-value" style={normalizedRole === 'admin' ? "font-size:1.8rem" : ""}>
          {normalizedRole === 'admin' ? t('home.stats.unlimited') : remainingDocumentsValue}
        </div>
        <div class="stat-label">{t('home.stats.documentsRemaining')}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{usedThisMonthValue}/{monthlyLimitValue}</div>
        <div class="stat-label">{t('home.stats.usedThisMonth')}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{totalDocumentsValue}</div>
        <div class="stat-label">{t('home.stats.totalDocuments')}</div>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="alert alert-error">{error}</div>
  {/if}

  {#if success}
    <div class="alert alert-success">{success}</div>
  {/if}

  <div class="upload-section">
    <h2>{t('home.uploadSection.title')}</h2>

    <div 
      class="upload-card" 
      class:drag-active={isDragActive}
      on:dragover={handleDragOver}
      on:dragleave={handleDragLeave}
      on:drop={handleDrop}
      role="region"
      aria-label={t('home.uploadSection.title')}
    >
      <div class="language-selector">
        <span class="lang-label">{t('home.uploadSection.languageLabel')}:</span>
        <div class="lang-toggle">
          <button
            class="lang-btn"
            class:lang-active={responseLanguage === 'english'}
            on:click={() => responseLanguage = 'english'}
          >
            {t('home.uploadSection.englishOption')}
          </button>
          <button
            class="lang-btn"
            class:lang-active={responseLanguage === 'arabic'}
            on:click={() => responseLanguage = 'arabic'}
          >
            {t('home.uploadSection.arabicOption')}
          </button>
        </div>
      </div>

      <div class="file-input-wrapper">
        <input
          type="file"
          id="file-input"
          accept=".pdf,.docx,.pptx"
          on:change={handleFileSelect}
          disabled={uploading}
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

      <button
        class="upload-btn"
        on:click={handleUpload}
        disabled={!selectedFile || uploading || (user && normalizedRole !== 'admin' && remainingDocumentsValue <= 0)}
      >
        {#if uploading}
          {t('home.uploadSection.submitProcessing')}
        {:else}
          {t('home.uploadSection.submit')}
        {/if}
      </button>
    </div>
  </div>

  {#if documents.length > 0}
    <div class="documents-section">
      <h2>{t('home.documents.title', { count: documents.length })}</h2>

      <div class="documents-grid">
        {#each documents as doc}
          <div class="document-card">
            <div class="doc-icon"></div>
            <div class="doc-info">
              <h3>{doc.originalName}</h3>
              <p class="doc-meta">
                {t('document.uploaded')}: {new Date(doc.uploadDate).toLocaleDateString()}
              </p>
              <p class="doc-meta">
                {t('document.language')}: {doc.language === "arabic" ? t('home.documents.languageArabic') : t('home.documents.languageEnglish')}
              </p>
              <div class="doc-stats">
                <span>{t('home.documents.flashcardCount', { count: doc.flashcardCount ?? (doc.flashcards ? doc.flashcards.length : 0) })}</span>
                <span>{t('home.documents.questionCount', { count: doc.questionCount ?? (doc.examQuestions ? doc.examQuestions.length : 0) })}</span>
              </div>
            </div>
            <div class="doc-actions">
              <button class="btn-primary" on:click={() => viewDocument(doc.id)}>
                {t('home.documents.viewCta')}
              </button>
              <button
                class="btn-secondary"
                on:click={() => deleteDocument(doc.id)}
              >
                {t('home.documents.deleteCta')}
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  /* Skeletons */
  .skeleton {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  .skeleton-text {
    height: 2.5rem;
    width: 60%;
    background: var(--color-surface-2);
    border-radius: 4px;
    margin: 0 auto 0.5rem;
  }
  .skeleton-text-sm {
    height: 1rem;
    width: 80%;
    background: var(--color-surface-2);
    border-radius: 4px;
    margin: 0 auto;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
  }

  .upload-overlay {
    position: fixed;
    inset: 0;
    background: var(--color-backdrop-strong);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(6px);
  }

  .overlay-content {
    text-align: center;
    color: var(--color-text-primary);
    width: 90%;
    max-width: 420px;
  }

  .overlay-icon {
    margin-bottom: 1.5rem;
  }

  .overlay-spinner {
    width: 56px;
    height: 56px;
    border: 4px solid var(--color-accent-surface);
    border-top-color: var(--color-accent-primary);
    border-radius: 50%;
    animation: overlay-spin 0.8s linear infinite;
    margin: 0 auto;
  }

  .overlay-check {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--gradient-success);
    color: var(--color-bg);
    font-size: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    animation: check-pop 0.3s ease;
  }

  @keyframes check-pop {
    0% { transform: scale(0); }
    70% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }

  @keyframes overlay-spin {
    to { transform: rotate(360deg); }
  }

  .overlay-content h2 {
    font-size: 1.35rem;
    margin-bottom: 1.5rem;
    color: var(--color-text-primary);
  }

  .overlay-progress-bar {
    width: 100%;
    height: 8px;
    background: var(--color-border);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }

  .overlay-progress-fill {
    height: 100%;
    background: var(--gradient-accent-strong);
    border-radius: 4px;
    transition: width 0.4s ease;
  }

  .overlay-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .overlay-stage {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .overlay-percent {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--color-accent-primary);
  }

  .overlay-steps {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    text-align: start;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.85rem;
    color: var(--color-text-muted);
    transition: color 0.3s ease;
  }

  .step.step-active {
    color: var(--color-text-secondary);
  }

  .step.step-done {
    color: var(--color-success);
  }

  .step-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-border);
    transition: all 0.3s ease;
  }

  .step-active .step-dot {
    background: var(--color-accent-primary);
    box-shadow: 0 0 8px var(--color-glow);
  }

  .step-done .step-dot {
    background: var(--color-success);
  }

  .study-assistant-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .study-header {
    text-align: center;
    margin-bottom: 3rem;
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

  .usage-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    padding: 1.5rem;
    text-align: center;
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

  .alert {
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    font-weight: 500;
  }

  .alert-error {
    background: var(--color-danger-surface);
    color: var(--color-danger);
    border: 1px solid var(--color-danger-border);
  }

  .alert-success {
    background: var(--color-success-surface);
    color: var(--color-success);
    border: 1px solid var(--color-success-border);
  }

  .upload-section {
    margin-bottom: 3rem;
  }

  .upload-section h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: var(--color-text-primary);
  }

  .upload-card {
    background: var(--color-surface);
    border: 2px dashed var(--color-border);
    border-radius: 1rem;
    padding: 2rem;
    transition: all 0.2s ease;
  }
  
  .upload-card.drag-active {
    border-color: var(--color-accent-primary);
    background: var(--color-surface-2);
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

  .lang-toggle {
    display: inline-flex;
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
    overflow: hidden;
    background: var(--color-bg);
  }

  .lang-btn {
    padding: 0.6rem 1.5rem;
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .lang-btn:hover:not(.lang-active) {
    color: var(--color-text-primary);
    background: var(--color-surface-2);
  }

  .lang-btn.lang-active {
    background: var(--color-accent-surface);
    color: var(--color-accent-primary);
    font-weight: 600;
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
    background: rgba(30, 36, 51, 0.4);
    color: var(--color-text-secondary);
    position: relative;
    overflow: hidden;
  }

  .file-label:hover, .file-label.active {
    border-color: var(--color-accent-outline-strong);
    background: rgba(30, 36, 51, 0.6);
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

  .upload-btn {
    width: 100%;
    padding: 1rem 2rem;
    background: var(--color-accent-primary);
    color: var(--color-text-primary);
    border: 1px solid color-mix(in srgb, var(--color-accent-primary) 70%, white 30%);
    border-radius: 0.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .upload-btn:hover:not(:disabled) {
    background: var(--color-accent-light);
    transform: translateY(-2px);
    box-shadow: 0 6px 24px var(--color-glow);
  }

  .upload-btn:disabled {
    background: color-mix(in srgb, var(--color-surface-2) 85%, var(--color-bg) 15%);
    color: var(--color-text-secondary);
    border-color: var(--color-border);
    opacity: 1;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  .documents-section h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: var(--color-text-primary);
  }

  .documents-grid {
    display: grid;
    gap: 1.5rem;
  }

  .document-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    gap: 1.5rem;
    align-items: center;
    transition: border-color 0.2s ease;
  }

  .document-card:hover {
    border-color: var(--color-border-light);
  }

  .doc-icon {
    font-size: 3rem;
  }

  .doc-info {
    flex: 1;
  }

  .doc-info h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: var(--color-text-primary);
  }

  .doc-meta {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    margin: 0.25rem 0;
  }

  .doc-stats {
    display: flex;
    gap: 1.5rem;
    margin-top: 0.75rem;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
  }

  .doc-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 152px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.6rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    width: 100%;
  }

  .btn-primary {
    border: none;
    background: var(--color-accent-primary);
    color: var(--color-text-primary);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-accent-primary) 75%, white 25%);
  }

  .btn-primary:hover {
    background: var(--color-accent-light);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px var(--color-glow);
  }

  .btn-secondary {
    background: transparent;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
  }

  .btn-secondary:hover {
    border-color: var(--color-danger);
    color: var(--color-danger);
    background: var(--color-danger-surface);
  }

  @media (max-width: 768px) {
    .study-assistant-container {
      padding: 1rem;
    }

    .study-header h1 {
      font-size: 1.75rem;
    }

    .document-card {
      flex-direction: column;
      text-align: center;
    }

    .doc-actions {
      width: 100%;
    }

    .overlay-content {
      width: 92%;
    }

    .lang-toggle {
      display: flex;
    }

    .lang-btn {
      flex: 1;
    }
  }
</style>
