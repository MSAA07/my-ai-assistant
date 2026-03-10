<script>
  import { onDestroy, onMount } from 'svelte';
  import { API_BASE } from '../config.js';
  import { routeParams } from '../stores/router.js';
  import { t } from '../lib/i18n/t.js';
  import StatusBadge from '../lib/components/ui/StatusBadge.svelte';
  import ConfirmModal from '../lib/components/ui/ConfirmModal.svelte';

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
  let actionError = '';
  let actionBusyId = '';
  let openMenuId = '';
  let confirmOpen = false;
  let pendingDeleteDoc = null;

  $: highlightDocumentId = typeof $routeParams?.highlight === 'string' ? $routeParams.highlight : '';
  $: deleteTitle = t('documentsPage.deleteConfirmTitle');
  $: deleteDescription = t('documentsPage.deleteConfirmDescription', {
    name: pendingDeleteDoc?.originalName ?? t('documentsPage.deleteUnknown')
  });
  $: deleteLabel = t('documentsPage.actions.delete');
  $: cancelLabel = t('confirmModal.cancel');

  onMount(() => {
    void loadDocuments();
    window.addEventListener('click', closeMenu);
  });

  onDestroy(() => {
    window.removeEventListener('click', closeMenu);
  });

  async function loadDocuments() {
    loading = true;
    error = '';
    actionError = '';

    try {
      const response = await fetch(`${API_BASE}/api/user/me`, {
        credentials: 'include'
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || t('documentsPage.errors.load'));
      }

      const nextDocuments = Array.isArray(data?.documents) ? data.documents : [];
      documents = nextDocuments.sort((a, b) => {
        const left = new Date(b?.uploadDate ?? 0).getTime();
        const right = new Date(a?.uploadDate ?? 0).getTime();
        return left - right;
      });
    } catch (err) {
      error = err?.message || t('documentsPage.errors.load');
    } finally {
      loading = false;
    }
  }

  function closeMenu() {
    openMenuId = '';
  }

  function goToHome() {
    window.location.hash = '/home';
  }

  function toggleMenu(event, docId) {
    event.stopPropagation();
    openMenuId = openMenuId === docId ? '' : docId;
  }

  function getStatusKey(doc) {
    const status = typeof doc?.processingStatus === 'string' ? doc.processingStatus.toLowerCase() : 'unknown';
    return statusToneMap[status] ? status : 'unknown';
  }

  function getStatusTone(doc) {
    return statusToneMap[getStatusKey(doc)] ?? 'info';
  }

  function formatDate(value) {
    if (!value) {
      return 'Unknown';
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 'Unknown' : parsed.toLocaleDateString();
  }

  function getFileType(doc) {
    const originalName = typeof doc?.originalName === 'string' ? doc.originalName : '';
    const extension = originalName.includes('.') ? originalName.split('.').pop() : '';
    if (!extension) {
      return 'FILE';
    }
    return extension.slice(0, 5).toUpperCase();
  }

  async function renameDocument(doc) {
    openMenuId = '';
    const currentName = typeof doc?.originalName === 'string' ? doc.originalName.trim() : '';
    if (!currentName) return;

    const nextNameInput = window.prompt(t('documentsPage.actions.renamePrompt'), currentName);
    if (nextNameInput === null) {
      return;
    }

    const nextName = nextNameInput.trim();
    if (!nextName || nextName === currentName) {
      return;
    }

    actionBusyId = doc.id;
    actionError = '';
    try {
      const response = await fetch(`${API_BASE}/api/document/${doc.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalName: nextName })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || t('documentsPage.errors.rename'));
      }

      await loadDocuments();
    } catch (err) {
      actionError = err?.message || t('documentsPage.errors.rename');
    } finally {
      actionBusyId = '';
    }
  }

  function openDeleteModal(event, doc) {
    event.stopPropagation();
    pendingDeleteDoc = doc;
    confirmOpen = true;
    openMenuId = '';
  }

  function closeDeleteModal() {
    confirmOpen = false;
    pendingDeleteDoc = null;
  }

  async function handleDelete() {
    if (!pendingDeleteDoc?.id) return;

    actionBusyId = pendingDeleteDoc.id;
    actionError = '';

    try {
      const response = await fetch(`${API_BASE}/api/document/${pendingDeleteDoc.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || t('documentsPage.errors.delete'));
      }

      closeDeleteModal();
      await loadDocuments();
    } catch (err) {
      actionError = err?.message || t('documentsPage.errors.delete');
    } finally {
      actionBusyId = '';
    }
  }
</script>

<div class="library-page">
  <header class="page-header">
    <div>
      <p class="eyebrow">{t('documentsPage.eyebrow')}</p>
      <h1>{t('documentsPage.title')}</h1>
      <p class="subtitle">{t('documentsPage.description')}</p>
    </div>
    <button type="button" class="upload-btn" on:click={goToHome}>
      {t('documentsPage.actions.uploadCta')}
    </button>
  </header>

  {#if loading}
    <section class="state-panel">
      <p>{t('common.loading')}</p>
    </section>
  {:else}
    {#if error}
      <p class="inline-error">{error}</p>
    {/if}
    {#if actionError}
      <p class="inline-error">{actionError}</p>
    {/if}

    {#if documents.length === 0}
      <section class="state-panel">
        <h2>{t('documentsPage.emptyTitle')}</h2>
        <p>{t('documentsPage.emptyDescription')}</p>
        <button type="button" class="upload-btn" on:click={goToHome}>
          {t('documentsPage.actions.uploadCta')}
        </button>
      </section>
    {:else}
      <section class="documents-grid">
        {#each documents as doc}
          <article class={`document-card ${highlightDocumentId === doc.id ? 'highlight' : ''}`}>
            <div class="card-top">
              <p class="file-type">{getFileType(doc)}</p>
              <div class="menu-wrap">
                <button
                  type="button"
                  class="menu-trigger"
                  aria-label={t('documentsPage.actions.more')}
                  aria-expanded={openMenuId === doc.id}
                  on:click={(event) => toggleMenu(event, doc.id)}
                >
                  ...
                </button>
                {#if openMenuId === doc.id}
                  <div class="menu">
                    <button
                      type="button"
                      on:click={() => renameDocument(doc)}
                      disabled={actionBusyId === doc.id}
                    >
                      {t('documentsPage.actions.rename')}
                    </button>
                    <button
                      type="button"
                      on:click={(event) => openDeleteModal(event, doc)}
                      disabled={actionBusyId === doc.id}
                    >
                      {t('documentsPage.actions.delete')}
                    </button>
                  </div>
                {/if}
              </div>
            </div>

            <a class="card-link" href={`#/study/${doc.id}`}>
              <h2>{doc.originalName}</h2>
              <p class="meta">
                {t('documentsPage.labels.uploaded')}: {formatDate(doc.uploadDate)}
              </p>
              <StatusBadge
                status={getStatusTone(doc)}
                label={t(`documentsPage.statuses.${getStatusKey(doc)}`)}
              />
            </a>
          </article>
        {/each}
      </section>
    {/if}
  {/if}

  <ConfirmModal
    open={confirmOpen}
    title={deleteTitle}
    description={deleteDescription}
    confirmLabel={actionBusyId === pendingDeleteDoc?.id ? t('documentsPage.actions.deleting') : deleteLabel}
    cancelLabel={cancelLabel}
    on:confirm={handleDelete}
    on:cancel={closeDeleteModal}
  />
</div>

<style>
  .library-page {
    display: grid;
    gap: var(--space-4);
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: var(--space-3);
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

  .state-panel {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    padding: var(--space-4);
    background: var(--color-surface-1);
    display: grid;
    gap: var(--space-2);
  }

  .documents-grid {
    display: grid;
    gap: var(--space-3);
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .document-card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    padding: var(--space-3);
    background: var(--color-surface-1);
    display: grid;
    gap: var(--space-2);
    cursor: pointer;
    transition: border-color var(--motion-fast) var(--ease-standard), transform var(--motion-fast) var(--ease-standard);
  }

  .document-card:hover {
    border-color: var(--color-accent-primary);
    transform: translateY(-1px);
  }

  .document-card.highlight {
    border-color: var(--color-accent-primary);
    box-shadow: 0 0 0 1px var(--color-accent-primary);
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .file-type {
    margin: 0;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    font-weight: 700;
  }

  .menu-wrap {
    position: relative;
  }

  .menu-trigger {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--color-border);
    background: var(--color-surface-2);
    color: var(--color-text-secondary);
    cursor: pointer;
    line-height: 1;
  }

  .menu {
    position: absolute;
    top: 36px;
    inset-inline-end: 0;
    min-width: 132px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-1);
    background: var(--color-surface-1);
    box-shadow: 0 12px 24px var(--color-shadow);
    padding: 0.35rem;
    display: grid;
    gap: 0.25rem;
    z-index: 5;
  }

  .menu button {
    min-height: 36px;
    border: 1px solid transparent;
    border-radius: var(--radius-1);
    background: transparent;
    color: var(--color-text-primary);
    text-align: start;
    cursor: pointer;
    font-size: 0.88rem;
  }

  .menu button:hover:not(:disabled) {
    border-color: var(--color-border);
    background: var(--color-surface-2);
  }

  .menu button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  h2 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 1rem;
    line-height: 1.45;
    word-break: break-word;
  }

  .meta {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.88rem;
  }

  .card-link {
    color: inherit;
    text-decoration: none;
    display: grid;
    gap: var(--space-2);
  }

  .upload-btn {
    min-height: 42px;
    border-radius: var(--radius-1);
    border: none;
    padding: 0.65rem 1rem;
    background: var(--gradient-accent-strong);
    color: var(--color-bg);
    font-weight: 600;
    cursor: pointer;
  }

  .inline-error {
    margin: 0;
    border: 1px solid color-mix(in srgb, var(--color-danger) 36%, transparent);
    border-radius: var(--radius-1);
    background: var(--color-danger-surface);
    color: var(--color-danger);
    padding: 0.7rem 0.85rem;
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
