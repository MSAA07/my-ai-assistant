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
</script>

<div class="study-index">
  <header class="page-header">
    <div>
      <p class="eyebrow">Study Hub</p>
      <h1>Choose a document</h1>
      <p class="subtitle">Open any document to work with summary, flashcards, exams, and exports.</p>
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
    <section class="documents-grid">
      {#each documents as doc}
        <article class="document-card">
          <div class="card-head">
            <h3>{doc.originalName}</h3>
            <StatusBadge status={resolveStatusTone(doc.processingStatus)} label={doc.processingStatus ?? 'unknown'} />
          </div>
          <p class="meta">Uploaded: {formatDate(doc.uploadDate)}</p>
          <p class="meta">Language: {doc.language ?? 'unknown'}</p>
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
  }

  .subtitle {
    margin: 0;
    color: var(--color-text-secondary);
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
  }

  .primary-btn {
    border: none;
    background: var(--gradient-accent);
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

  .documents-grid {
    display: grid;
    gap: var(--space-3);
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .document-card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    background: var(--color-surface-1);
    padding: var(--space-4);
    display: grid;
    gap: var(--space-2);
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
  }

  .meta {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }

  @media (max-width: 1024px) {
    .documents-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .documents-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
