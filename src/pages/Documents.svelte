<script>
  import { onMount } from 'svelte';
  import { API_BASE } from '../config.js';
  import { t } from '../lib/i18n/t.js';
  import EmptyState from '../lib/components/ui/EmptyState.svelte';
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';
  import ConfirmModal from '../lib/components/ui/ConfirmModal.svelte';

  const statusToneMap = {
    queued: 'processing',
    running: 'processing',
    complete: 'ready',
    failed: 'failed'
  };

  let documents = [];
  let loading = true;
  let errorKey = '';
  let errorArgs = {};
  let confirmOpen = false;
  let deleting = false;
  let pendingDoc = null;

  onMount(fetchDocuments);

  async function fetchDocuments() {
    loading = true;
    errorKey = '';
    errorArgs = {};

    try {
      const response = await fetch(`${API_BASE}/api/user/me`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('FETCH_ERROR');
      }

      const data = await response.json();
      documents = data.documents ?? [];
    } catch (error) {
      console.error('Failed to load documents', error);
      errorKey = 'documentsPage.errors.load';
    } finally {
      loading = false;
    }
  }

  function viewDocument(docId) {
    window.location.hash = `/document/${docId}`;
  }

  function openDeleteModal(doc) {
    pendingDoc = doc;
    confirmOpen = true;
  }

  function closeDeleteModal() {
    confirmOpen = false;
    pendingDoc = null;
  }

  async function handleDelete() {
    if (!pendingDoc) return;
    deleting = true;

    try {
      const response = await fetch(`${API_BASE}/api/document/${pendingDoc.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('DELETE_ERROR');
      }

      await fetchDocuments();
      closeDeleteModal();
    } catch (error) {
      console.error('Failed to delete document', error);
      errorKey = 'documentsPage.errors.delete';
    } finally {
      deleting = false;
    }
  }

  function resolveStatusTone(status) {
    return statusToneMap[status] ?? 'info';
  }

  $: errorMessage = errorKey ? t(errorKey, errorArgs) : '';
  $: deleteTitle = t('documentsPage.deleteConfirmTitle');
  $: deleteDescription = t('documentsPage.deleteConfirmDescription', {
    name: pendingDoc?.originalName ?? t('documentsPage.deleteUnknown')
  });
  $: deleteLabel = t('documentsPage.actions.delete');
  $: cancelLabel = t('confirmModal.cancel');
</script>

<div class="documents-page">
  <header class="page-header">
    <div>
      <p class="eyebrow">{t('documentsPage.eyebrow')}</p>
      <h1>{t('documentsPage.title')}</h1>
      <p class="subtitle">{t('documentsPage.description')}</p>
    </div>
    <button class="refresh-btn" type="button" on:click={fetchDocuments} disabled={loading}>
      {t('documentsPage.actions.refresh')}
    </button>
  </header>

  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>{t('common.loading')}</p>
    </div>
  {:else if errorMessage}
    <div class="alert alert-error">{errorMessage}</div>
  {:else if documents.length === 0}
    <EmptyState
      title={t('documentsPage.emptyTitle')}
      description={t('documentsPage.emptyDescription')}
    >
      <button class="primary-btn" type="button" on:click={() => (window.location.hash = '/dashboard')}>
        {t('documentsPage.actions.uploadCta')}
      </button>
    </EmptyState>
  {:else}
    <section class="documents-grid">
      {#each documents as doc}
        <article class="document-card">
          <div class="card-head">
            <div class="title-row">
              <h3>{doc.originalName}</h3>
              <StatusBadge
                status={resolveStatusTone(doc.processingStatus)}
                label={t(`documentsPage.statuses.${doc.processingStatus ?? 'queued'}`)}
              />
            </div>
            <p class="meta">
              {t('documentsPage.labels.uploaded')}: {new Date(doc.uploadDate).toLocaleDateString()}
              · {t('documentsPage.labels.language')}:
              {doc.language === 'arabic' ? t('home.documents.languageArabic') : t('home.documents.languageEnglish')}
            </p>
          </div>

          <dl class="stats">
            <div>
              <dt>{t('documentsPage.columns.flashcards')}</dt>
              <dd>{doc.flashcardCount ?? doc.flashcards?.length ?? 0}</dd>
            </div>
            <div>
              <dt>{t('documentsPage.columns.exams')}</dt>
              <dd>{doc.questionCount ?? doc.examQuestions?.length ?? 0}</dd>
            </div>
          </dl>

          <div class="card-actions">
            <button type="button" class="secondary-btn" on:click={() => viewDocument(doc.id)}>
              {t('documentsPage.actions.view')}
            </button>
            <button type="button" class="danger-btn" on:click={() => openDeleteModal(doc)}>
              {t('documentsPage.actions.delete')}
            </button>
          </div>
        </article>
      {/each}
    </section>
  {/if}

  <ConfirmModal
    open={confirmOpen}
    title={deleteTitle}
    description={deleteDescription}
    confirmLabel={deleting ? t('documentsPage.actions.deleting') : deleteLabel}
    cancelLabel={cancelLabel}
    on:confirm={handleDelete}
    on:cancel={closeDeleteModal}
  />
</div>

<style>
  .documents-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
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
    font-size: 2rem;
    color: var(--color-text-primary);
  }

  .subtitle {
    margin: 0;
    color: var(--color-text-secondary);
  }

  .refresh-btn {
    align-self: flex-end;
    padding: 0.75rem 1.25rem;
    border-radius: var(--radius-1);
    border: 1px solid var(--color-border);
    background: var(--color-surface-1);
    color: var(--color-text-primary);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .refresh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .refresh-btn:not(:disabled):hover {
    border-color: var(--color-accent-primary);
  }

  .loading-state,
  .alert {
    border-radius: var(--radius-2);
    padding: var(--space-5);
    border: 1px solid var(--color-border);
    background: var(--color-surface-1);
    text-align: center;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-accent-primary);
    margin: 0 auto var(--space-3);
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .alert-error {
    color: var(--color-danger);
    border-color: var(--color-danger);
    background: var(--color-danger-surface);
  }

  .documents-grid {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
  }

  .document-card {
    padding: var(--space-4);
    border-radius: var(--radius-3);
    border: 1px solid var(--color-border);
    background: var(--color-surface-1);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    height: 100%;
    min-height: 272px;
  }

  .card-head {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .card-head h3 {
    margin: 0 0 0.35rem;
    font-size: 1.1rem;
    color: var(--color-text-primary);
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: calc(1.35em * 2);
  }

  .meta {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
    margin: 0;
  }

  .stats dt {
    margin: 0;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary);
    font-weight: 600;
  }

  .stats dd {
    margin: 0.25rem 0 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .card-actions {
    display: flex;
    gap: var(--space-2);
    margin-top: auto;
  }

  .card-actions button {
    flex: 1;
    min-height: 44px;
    border-radius: var(--radius-1);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .secondary-btn {
    border: 1px solid var(--color-border);
    background: var(--color-surface-2);
    color: var(--color-text-primary);
  }

  .secondary-btn:hover {
    border-color: var(--color-accent-primary);
  }

  .danger-btn {
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text-secondary);
  }

  .danger-btn:hover {
    border-color: var(--color-danger);
    background: var(--color-danger-surface);
    color: var(--color-danger);
  }

  .primary-btn {
    border: none;
    background: var(--gradient-accent);
    color: var(--color-bg);
    padding: 0 1.5rem;
    min-height: 44px;
    border-radius: var(--radius-1);
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 10px 30px var(--color-shadow);
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

    .page-header {
      align-items: flex-start;
    }

    .refresh-btn {
      align-self: flex-start;
    }

    .card-actions {
      flex-direction: column;
    }
  }
</style>
