<script>
  import { onMount } from 'svelte';
  import { API_BASE } from '../config.js';
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';

  const statusToneMap = {
    queued: 'processing',
    processing: 'processing',
    running: 'processing',
    complete: 'ready',
    failed: 'failed'
  };

  let documents = [];
  let loading = true;
  let error = '';

  $: readyCount = documents.filter((doc) => doc?.processingStatus === 'complete').length;
  $: processingCount = documents.filter((doc) => {
    const status = doc?.processingStatus;
    return status === 'queued' || status === 'processing' || status === 'running';
  }).length;
  $: failedCount = documents.filter((doc) => doc?.processingStatus === 'failed').length;

  onMount(() => {
    void loadDocuments();
  });

  async function loadDocuments() {
    loading = true;
    error = '';

    try {
      const response = await fetch(`${API_BASE}/api/user/me`, {
        credentials: 'include'
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load documents');
      }

      documents = Array.isArray(data?.documents) ? data.documents : [];
    } catch (err) {
      error = err?.message || 'Failed to load documents';
    } finally {
      loading = false;
    }
  }

  function openStudyHub(documentId) {
    window.location.hash = `/study/${documentId}`;
  }

  function resolveStatusTone(status) {
    return statusToneMap[status] ?? 'info';
  }

  function formatDate(value) {
    return value ? new Date(value).toLocaleDateString() : 'Unknown';
  }

  function flashcardCount(doc) {
    const value = Number(doc?.flashcardCount);
    if (Number.isFinite(value)) {
      return value;
    }
    return Array.isArray(doc?.flashcards) ? doc.flashcards.length : 0;
  }

  function examQuestionCount(doc) {
    const value = Number(doc?.questionCount);
    if (Number.isFinite(value)) {
      return value;
    }
    return Array.isArray(doc?.examQuestions) ? doc.examQuestions.length : 0;
  }

  function readinessLabel(doc) {
    const status = doc?.processingStatus;
    if (status !== 'complete') {
      return 'Extraction in progress';
    }

    const hasSummary = typeof doc?.summary === 'string' && doc.summary.trim().length > 0;
    if (hasSummary || flashcardCount(doc) > 0 || examQuestionCount(doc) > 0) {
      return 'Study materials available';
    }

    return 'Ready for generation';
  }
</script>

<div class="study-index">
  <header class="page-header">
    <div>
      <p class="eyebrow">Study Hub</p>
      <h1>Choose a document</h1>
      <p class="subtitle">Open any document to continue summary, flashcard, exam, and export workflows.</p>
    </div>
    <button type="button" class="refresh-btn" on:click={loadDocuments} disabled={loading}>
      {loading ? 'Refreshing...' : 'Refresh'}
    </button>
  </header>

  {#if loading}
    <section class="panel">
      <p>Loading documents...</p>
    </section>
  {:else if error}
    <section class="panel error">
      <p>{error}</p>
    </section>
  {:else if documents.length === 0}
    <section class="panel">
      <h2>No study documents yet</h2>
      <p>Upload a document from the dashboard to start using Study Hub.</p>
      <button type="button" class="primary-btn" on:click={() => (window.location.hash = '/dashboard')}>
        Go to dashboard
      </button>
    </section>
  {:else}
    <section class="health-strip">
      <article class="health-card">
        <p class="health-label">Total</p>
        <p class="health-value">{documents.length}</p>
      </article>
      <article class="health-card health-card--ready">
        <p class="health-label">Ready</p>
        <p class="health-value">{readyCount}</p>
      </article>
      <article class="health-card health-card--processing">
        <p class="health-label">Processing</p>
        <p class="health-value">{processingCount}</p>
      </article>
      <article class="health-card health-card--failed">
        <p class="health-label">Needs attention</p>
        <p class="health-value">{failedCount}</p>
      </article>
    </section>

    <section class="documents-grid">
      {#each documents as doc}
        <article class="document-card">
          <div class="card-head">
            <h3>{doc.originalName}</h3>
            <StatusBadge status={resolveStatusTone(doc.processingStatus)} label={doc.processingStatus ?? 'unknown'} />
          </div>
          <p class="readiness">{readinessLabel(doc)}</p>
          <div class="meta-grid">
            <p class="meta"><span>Uploaded</span>{formatDate(doc.uploadDate)}</p>
            <p class="meta"><span>Language</span>{doc.language ?? 'unknown'}</p>
            <p class="meta"><span>Flashcards</span>{flashcardCount(doc)}</p>
            <p class="meta"><span>Exam questions</span>{examQuestionCount(doc)}</p>
          </div>
          <button type="button" class="primary-btn" on:click={() => openStudyHub(doc.id)}>
            Open Study Hub
          </button>
        </article>
      {/each}
    </section>
  {/if}
</div>

<style>
  .study-index {
    display: grid;
    gap: var(--space-5);
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  h1 {
    margin: 0.25rem 0;
    color: var(--color-text-primary);
    font-size: 1.9rem;
  }

  .subtitle {
    margin: 0;
    color: var(--color-text-secondary);
    max-width: 70ch;
  }

  .refresh-btn,
  .primary-btn {
    min-height: 42px;
    padding: 0.65rem 1rem;
    border-radius: var(--radius-1);
    border: 1px solid var(--color-border);
    background: var(--color-surface-2);
    color: var(--color-text-primary);
    font-weight: 600;
    cursor: pointer;
    transition: border-color var(--motion-fast) var(--ease-standard), transform var(--motion-fast) var(--ease-standard);
  }

  .refresh-btn:hover:not(:disabled),
  .primary-btn:hover:not(:disabled) {
    border-color: color-mix(in srgb, var(--color-accent-primary) 60%, var(--color-border) 40%);
    transform: translateY(-1px);
  }

  .primary-btn {
    border: none;
    background: var(--gradient-accent-strong);
    color: var(--color-bg);
  }

  .panel {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    background: var(--color-surface-1);
    padding: var(--space-4);
  }

  .panel.error {
    border-color: var(--color-danger);
    color: var(--color-danger);
    background: var(--color-danger-surface);
  }

  .health-strip {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .health-card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    background: var(--color-surface-1);
    padding: var(--space-3);
    display: grid;
    gap: 0.35rem;
  }

  .health-card--ready {
    border-color: color-mix(in srgb, var(--color-success) 45%, var(--color-border) 55%);
  }

  .health-card--processing {
    border-color: color-mix(in srgb, var(--color-info) 45%, var(--color-border) 55%);
  }

  .health-card--failed {
    border-color: color-mix(in srgb, var(--color-danger) 45%, var(--color-border) 55%);
  }

  .health-label {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  .health-value {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 1.5rem;
    font-weight: 700;
  }

  .documents-grid {
    display: grid;
    gap: var(--space-3);
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .document-card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    background: linear-gradient(160deg, color-mix(in srgb, var(--color-surface-1) 92%, white 8%) 0%, var(--color-surface-1) 100%);
    padding: var(--space-4);
    display: grid;
    gap: var(--space-2);
    box-shadow: var(--shadow-soft);
  }

  .card-head {
    display: flex;
    justify-content: space-between;
    gap: var(--space-2);
    align-items: flex-start;
  }

  .document-card h3 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 1rem;
    line-height: 1.45;
    word-break: break-word;
  }

  .readiness {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.92rem;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
    padding: var(--space-2);
    border-radius: var(--radius-1);
    background: color-mix(in srgb, var(--color-surface-2) 86%, transparent);
  }

  .meta {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.85rem;
    display: grid;
    gap: 0.25rem;
  }

  .meta span {
    color: var(--color-text-muted);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 600;
  }

  @media (max-width: 1100px) {
    .documents-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .health-strip {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .health-strip {
      grid-template-columns: 1fr;
    }

    .documents-grid {
      grid-template-columns: 1fr;
    }

    .meta-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
