<script>
  import { onMount } from "svelte";
  import { API_BASE } from "../config.js";
  import { session } from "../stores/auth.js"; // Import session

  let user = null;
  let documents = [];
  let selectedFile = null;
  let language = "english";
  let uploading = false;
  let error = "";
  let success = "";

  // Progress tracking
  let uploadProgress = 0;
  let uploadStage = "";
  let progressInterval = null;

  onMount(async () => {
    await fetchUserData();
  });

  async function fetchUserData() {
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
      user = data.user;
      documents = data.documents;
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      error = "Failed to load user data. Please refresh.";
    }
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      selectedFile = file;
      error = "";
      success = "";
    }
  }

  function clearProgress() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    uploadProgress = 0;
    uploadStage = "";
  }

  async function handleUpload() {
    if (!selectedFile) {
      error = "Please select a file first";
      return;
    }

    if (!user || (user.role !== 'admin' && user.plan !== 'premium' && user.remainingDocuments <= 0)) {
       // Check against plan/role if needed, but backend enforces it too
      error = "You have reached your monthly upload limit";
      return;
    }

    uploading = true;
    error = "";
    success = "";
    uploadProgress = 0;
    uploadStage = "Uploading file...";

    const formData = new FormData();
    formData.append("file", selectedFile);
    // clerkId removed
    formData.append("language", language);

    try {
      const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true; // Crucial for Better Auth cookies

        // Track real upload progress (0-30%)
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            uploadProgress = Math.round((e.loaded / e.total) * 30);
            uploadStage = "Uploading file...";
          }
        });

        xhr.upload.addEventListener("load", () => {
          // Upload done, now server is processing
          uploadProgress = 30;
          uploadStage = "Extracting text from document...";

          // Simulate server-side progress stages
          let simProgress = 30;
          progressInterval = setInterval(() => {
            if (simProgress < 50) {
              simProgress += 2;
              uploadStage = "Extracting text from document...";
            } else if (simProgress < 85) {
              simProgress += 1;
              uploadStage = "Generating AI study materials...";
            } else if (simProgress < 95) {
              simProgress += 0.5;
              uploadStage = "Saving to database...";
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
              uploadStage = "Complete!";
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
          reject(new Error("Network error. Please try again."));
        });

        xhr.open("POST", `${API_BASE}/api/upload`);
        xhr.send(formData);
      });

      uploadProgress = 100;
      uploadStage = "Complete!";

      success = `Document processed successfully! Generated ${data.document.flashcards.length} flashcards and ${data.document.examQuestions.length} exam questions.`;
      selectedFile = null;
      document.getElementById("file-input").value = "";
      await fetchUserData();

      // Navigate to the document view
      setTimeout(() => {
        window.location.hash = `/document/${data.document.id}`;
      }, 1500);
    } catch (err) {
      console.error("Upload error:", err);
      error = err.message || "Failed to upload document. Please try again.";
    } finally {
      clearProgress();
      uploading = false;
    }
  }

  function viewDocument(docId) {
    window.location.hash = `/document/${docId}`;
  }

  async function deleteDocument(docId) {
    if (!confirm("Are you sure you want to delete this document?")) return;

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
        success = "Document deleted successfully";
      } else {
        error = "Failed to delete document";
      }
    } catch (err) {
      error = "Failed to delete document";
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
      <h2>Processing Your Document</h2>
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
          <span>Upload file</span>
        </div>
        <div class="step" class:step-active={uploadProgress >= 30} class:step-done={uploadProgress >= 50}>
          <span class="step-dot"></span>
          <span>Extract text</span>
        </div>
        <div class="step" class:step-active={uploadProgress >= 50} class:step-done={uploadProgress >= 90}>
          <span class="step-dot"></span>
          <span>Generate AI content</span>
        </div>
        <div class="step" class:step-active={uploadProgress >= 90} class:step-done={uploadProgress >= 100}>
          <span class="step-dot"></span>
          <span>Save results</span>
        </div>
      </div>
    </div>
  </div>
{/if}

<div class="study-assistant-container">
  <header class="study-header">
    <h1>AI Study Assistant</h1>
    <p>
      Upload your study materials and get AI-powered summaries, flashcards, and
      practice exams
    </p>
  </header>

  {#if user}
    <div class="usage-stats">
      <div class="stat-card">
        <div class="stat-value" style={user.role === 'admin' ? "font-size:1.8rem" : ""}>{user.role === 'admin' ? "Unlimited" : user.remainingDocuments}</div>
        <div class="stat-label">Documents Remaining</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{user.documentsUsed}/{user.monthlyLimit}</div>
        <div class="stat-label">Used This Month</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{documents.length}</div>
        <div class="stat-label">Total Documents</div>
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
    <h2>Upload New Document</h2>

    <div class="upload-card">
      <div class="language-selector">
        <span class="lang-label">AI Response Language:</span>
        <div class="lang-toggle">
          <button
            class="lang-btn"
            class:lang-active={language === 'english'}
            on:click={() => language = 'english'}
          >
            English
          </button>
          <button
            class="lang-btn"
            class:lang-active={language === 'arabic'}
            on:click={() => language = 'arabic'}
          >
            العربية (Arabic)
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
        <label for="file-input" class="file-label">
          {#if selectedFile}
            <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" x2="12" y1="3" y2="15"/>
            </svg>
            <span class="file-label-text">{selectedFile.name}</span>
          {:else}
            <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" x2="12" y1="3" y2="15"/>
            </svg>
            <span class="file-label-text">Click to select a file (PDF, DOCX, PPTX)</span>
          {/if}
        </label>
      </div>

      <p class="file-info">Maximum file size: 25MB</p>

      <button
        class="upload-btn"
        on:click={handleUpload}
        disabled={!selectedFile ||
          uploading ||
          (user && user.role !== 'admin' && user.remainingDocuments <= 0)}
      >
        {#if uploading}
          Processing... (this may take 20-30 seconds)
        {:else}
          Upload & Generate Study Materials
        {/if}
      </button>
    </div>
  </div>

  {#if documents.length > 0}
    <div class="documents-section">
      <h2>My Documents ({documents.length})</h2>

      <div class="documents-grid">
        {#each documents as doc}
          <div class="document-card">
            <div class="doc-icon"></div>
            <div class="doc-info">
              <h3>{doc.originalName}</h3>
              <p class="doc-meta">
                Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
              </p>
              <p class="doc-meta">
                Language: {doc.language === "arabic" ? "العربية" : "English"}
              </p>
              <div class="doc-stats">
                <span>{doc.flashcards.length} flashcards</span>
                <span>{doc.examQuestions.length} questions</span>
              </div>
            </div>
            <div class="doc-actions">
              <button class="btn-view" on:click={() => viewDocument(doc.id)}>
                View & Study
              </button>
              <button
                class="btn-delete"
                on:click={() => deleteDocument(doc.id)}
              >
                Delete
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .upload-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 14, 39, 0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(6px);
  }

  .overlay-content {
    text-align: center;
    color: #f1f5f9;
    width: 90%;
    max-width: 420px;
  }

  .overlay-icon {
    margin-bottom: 1.5rem;
  }

  .overlay-spinner {
    width: 56px;
    height: 56px;
    border: 4px solid rgba(102, 126, 234, 0.15);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: overlay-spin 0.8s linear infinite;
    margin: 0 auto;
  }

  .overlay-check {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
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
    color: #f1f5f9;
  }

  .overlay-progress-bar {
    width: 100%;
    height: 8px;
    background: #1e2758;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }

  .overlay-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
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
    color: #94a3b8;
  }

  .overlay-percent {
    font-size: 0.95rem;
    font-weight: 700;
    color: #60a5fa;
  }

  .overlay-steps {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    text-align: left;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.85rem;
    color: #475569;
    transition: color 0.3s ease;
  }

  .step.step-active {
    color: #94a3b8;
  }

  .step.step-done {
    color: #22c55e;
  }

  .step-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #334155;
    transition: all 0.3s ease;
  }

  .step-active .step-dot {
    background: #60a5fa;
    box-shadow: 0 0 8px rgba(96, 165, 250, 0.4);
  }

  .step-done .step-dot {
    background: #22c55e;
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .study-header p {
    color: #cbd5e1;
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    color: #94a3b8;
    font-size: 0.9rem;
  }

  .alert {
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    font-weight: 500;
  }

  .alert-error {
    background: rgba(239, 68, 68, 0.1);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.25);
  }

  .alert-success {
    background: rgba(34, 197, 94, 0.1);
    color: #86efac;
    border: 1px solid rgba(34, 197, 94, 0.25);
  }

  .upload-section {
    margin-bottom: 3rem;
  }

  .upload-section h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #f1f5f9;
  }

  .upload-card {
    background: var(--color-surface);
    border: 2px dashed var(--color-border);
    border-radius: 1rem;
    padding: 2rem;
  }

  .language-selector {
    margin-bottom: 2rem;
  }

  .lang-label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: #e2e8f0;
    font-size: 0.95rem;
  }

  .lang-toggle {
    display: inline-flex;
    border-radius: 0.5rem;
    border: 1px solid #1e2758;
    overflow: hidden;
    background: #0a0e27;
  }

  .lang-btn {
    padding: 0.6rem 1.5rem;
    border: none;
    background: transparent;
    color: #94a3b8;
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .lang-btn:hover:not(.lang-active) {
    color: #cbd5e1;
    background: rgba(96, 165, 250, 0.05);
  }

  .lang-btn.lang-active {
    background: rgba(96, 165, 250, 0.15);
    color: #60a5fa;
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
    border: 2px dashed rgba(147, 197, 253, 0.4);
    border-radius: 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: rgba(30, 41, 59, 0.4);
    color: #94a3b8;
  }

  .file-label:hover {
    border-color: rgba(147, 197, 253, 0.7);
    background: rgba(30, 41, 59, 0.6);
    color: #cbd5e1;
  }

  .upload-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    color: rgba(147, 197, 253, 0.8);
    transition: all 0.3s ease;
  }

  .file-label:hover .upload-icon {
    color: rgba(147, 197, 253, 1);
    transform: translateY(-2px);
  }

  .file-label-text {
    font-size: 1rem;
    font-weight: 500;
  }

  .file-info {
    color: #64748b;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .upload-btn {
    width: 100%;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    border: none;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .upload-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(102, 126, 234, 0.35);
  }

  .upload-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  .documents-section h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #f1f5f9;
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
    border-color: #283170;
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
    color: #f1f5f9;
  }

  .doc-meta {
    color: #94a3b8;
    font-size: 0.9rem;
    margin: 0.25rem 0;
  }

  .doc-stats {
    display: flex;
    gap: 1.5rem;
    margin-top: 0.75rem;
    font-size: 0.9rem;
    color: #cbd5e1;
  }

  .doc-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-view,
  .btn-delete {
    padding: 0.6rem 1.5rem;
    border-radius: 0.5rem;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .btn-view {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
  }

  .btn-view:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  }

  .btn-delete {
    background: transparent;
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .btn-delete:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.5);
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

    .btn-view,
    .btn-delete {
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
