<script>
  import { onMount } from 'svelte';
  import { API_BASE } from '../config.js';
  import { formatDate, t } from '../lib/i18n/t.js';
  import Button from '../lib/components/ui/Button.svelte';
  import Card from '../lib/components/ui/Card.svelte';
  import EmptyState from '../lib/components/ui/EmptyState.svelte';
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';
  import ConfirmModal from '../lib/components/ui/ConfirmModal.svelte';
  import DocumentListSkeleton from '../lib/components/ui/DocumentListSkeleton.svelte';
  import { readPageCache, writePageCache } from '../stores/pageCache.js';

  const statusToneMap = {
    queued: 'processing',
    processing: 'processing',
    running: 'processing',
    complete: 'ready',
    failed: 'failed'
  };
  const DOCUMENTS_CACHE_KEY = 'page:documents-legacy';

  let documents = [];
  let loading = true;
  let refreshing = false;
  let errorKey = '';
  let errorArgs = {};
  let confirmOpen = false;
  let deleting = false;
  let pendingDoc = null;

  onMount(() => {
    const cached = readPageCache(DOCUMENTS_CACHE_KEY);
    const cachedDocuments = Array.isArray(cached?.documents) ? cached.documents : [];
    if (cached?.loaded) {
      documents = cachedDocuments;
      loading = false;
    }
    void fetchDocuments({ background: Boolean(cached?.loaded) });
  });

  async function fetchDocuments({ background = false } = {}) {
    if (background) {
      refreshing = true;
    } else {
      loading = true;
    }
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
      writePageCache(DOCUMENTS_CACHE_KEY, { loaded: true, documents });
    } catch (error) {
      console.error('Failed to load documents', error);
      errorKey = 'documentsPage.errors.load';
    } finally {
      if (background) {
        refreshing = false;
      } else {
        loading = false;
      }
    }
  }

  function viewDocument(docId) {
    window.location.hash = `/documents/${docId}`;
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

      documents = documents.filter((doc) => doc.id !== pendingDoc.id);
      writePageCache(DOCUMENTS_CACHE_KEY, { loaded: true, documents });
      closeDeleteModal();
      await fetchDocuments({ background: true });
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
    <div class="heading">
      <p class="eyebrow">{t('documentsPage.eyebrow')}</p>
      <h1>{t('documentsPage.title')}</h1>
      <p class="subtitle">{t('documentsPage.description')}</p>
    </div>
    <Button type="button" variant="secondary" on:click={() => fetchDocuments({ background: documents.length > 0 })} disabled={loading || refreshing}>
      {refreshing ? t('common.loading') : t('documentsPage.actions.refresh')}
    </Button>
  </header>

  {#if loading}
    <DocumentListSkeleton />
  {:else if errorMessage}
    <Card class="alert alert-error" variant="soft" border="strong" padding="md">{errorMessage}</Card>
  {:else if documents.length === 0}
    <EmptyState
      title={t('documentsPage.emptyTitle')}
      description={t('documentsPage.emptyDescription')}
    >
      <Button type="button" variant="primary" on:click={() => (window.location.hash = '/home')}>
        {t('documentsPage.actions.uploadCta')}
      </Button>
    </EmptyState>
  {:else}
    <section class="documents-grid">
      {#each documents as doc}
        <Card as="article" class="document-card" variant="base" padding="md" border="subtle">
          <div class="card-head">
            <div class="title-row">
              <h3>{doc.originalName}</h3>
              <StatusBadge
                status={resolveStatusTone(doc.processingStatus)}
                label={t(`documentsPage.statuses.${doc.processingStatus ?? 'queued'}`)}
              />
            </div>
            <p class="meta">
              {t('documentsPage.labels.uploaded')}: {formatDate(doc.uploadDate)}
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
            <Button type="button" variant="secondary" on:click={() => viewDocument(doc.id)}>
              {t('documentsPage.actions.view')}
            </Button>
            <Button type="button" variant="danger" on:click={() => openDeleteModal(doc)}>
              {t('documentsPage.actions.delete')}
            </Button>
          </div>
        </Card>
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
    display: grid;
    width: min(100%, var(--size-page-wide));
    margin-inline: auto;
    gap: var(--study-flow-page-gap);
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--study-flow-header-gap);
    flex-wrap: wrap;
  }

  .heading {
    display: grid;
    gap: var(--ui-space-1);
  }

  .eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  h1 {
    margin: 0;
    font-size: var(--study-flow-title-size);
    font-weight: 600;
    letter-spacing: -0.03em;
    color: var(--color-text-primary);
  }

  .subtitle {
    margin: 0;
    font-size: var(--study-flow-subtitle-size);
    color: var(--color-text-secondary);
  }

  .documents-page :global(.alert) {
    text-align: center;
  }

  .documents-page :global(.alert-error) {
    color: var(--color-danger);
    border-color: var(--color-danger);
    background: var(--color-danger-surface);
  }

  .documents-grid {
    display: grid;
    gap: var(--study-flow-card-gap);
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
  }

  .documents-page :global(.document-card) {
    display: flex;
    flex-direction: column;
    gap: var(--study-flow-card-gap);
    height: 100%;
    min-height: 228px;
    border-radius: var(--study-flow-card-radius);
    background: var(--study-flow-card-surface);
    box-shadow: none;
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
    margin: 0;
    font-size: 0.96rem;
    font-weight: 600;
    color: var(--color-text-primary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: calc(1.35em * 2);
  }

  .meta {
    margin: 0;
    font-size: var(--font-size-xs);
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
    font-size: 0.67rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .stats dd {
    margin: 0.18rem 0 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .card-actions {
    display: flex;
    gap: var(--space-2);
    margin-top: auto;
  }

  .card-actions :global(.ui-button) {
    flex: 1;
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

    .card-actions {
      flex-direction: column;
    }
  }
</style>
