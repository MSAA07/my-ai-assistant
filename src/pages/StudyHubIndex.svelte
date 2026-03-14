<script>
  import { onDestroy, onMount } from 'svelte';
  import { API_BASE } from '../config.js';
  import { routeParams } from '../stores/router.js';
  import { t } from '../lib/i18n/t.js';
  import Button from '../lib/components/ui/Button.svelte';
  import Card from '../lib/components/ui/Card.svelte';
  import DocumentCard from '../lib/components/ui/DocumentCard.svelte';
  import EmptyState from '../lib/components/ui/EmptyState.svelte';
  import MenuItem from '../lib/components/ui/MenuItem.svelte';
  import MenuSurface from '../lib/components/ui/MenuSurface.svelte';
  import PageHeader from '../lib/components/ui/PageHeader.svelte';
  import ConfirmModal from '../lib/components/ui/ConfirmModal.svelte';
  import PromptModal from '../lib/components/ui/PromptModal.svelte';
  import DocumentListSkeleton from '../lib/components/ui/DocumentListSkeleton.svelte';
  import { getDocumentFileTypeLabel } from '../lib/utils/fileType.js';
  import { readPageCache, writePageCache } from '../stores/pageCache.js';

  const statusToneMap = {
    queued: 'processing',
    processing: 'processing',
    running: 'processing',
    complete: 'ready',
    failed: 'failed'
  };
  const STUDY_INDEX_CACHE_KEY = 'page:study-index';

  let documents = [];
  let loading = true;
  let refreshing = false;
  let error = '';
  let actionError = '';
  let actionBusyId = '';
  let openMenuId = '';
  let confirmOpen = false;
  let pendingDeleteDoc = null;
  let renameOpen = false;
  let pendingRenameDoc = null;
  let renameValue = '';

  $: highlightDocumentId = typeof $routeParams?.highlight === 'string' ? $routeParams.highlight : '';
  $: deleteTitle = t('documentsPage.deleteConfirmTitle');
  $: deleteDescription = t('documentsPage.deleteConfirmDescription', {
    name: pendingDeleteDoc?.originalName ?? t('documentsPage.deleteUnknown')
  });
  $: renameTitle = t('documentsPage.actions.renamePrompt');
  $: renameDescription = pendingRenameDoc?.originalName ?? '';
  $: renameDisabled = !pendingRenameDoc?.id || !renameValue.trim() || renameValue.trim() === (pendingRenameDoc?.originalName ?? '').trim();
  $: deleteLabel = t('documentsPage.actions.delete');
  $: cancelLabel = t('confirmModal.cancel');

  onMount(() => {
    const cached = readPageCache(STUDY_INDEX_CACHE_KEY);
    if (cached?.loaded) {
      documents = Array.isArray(cached.documents) ? cached.documents : [];
      loading = false;
    }

    void loadDocuments({ background: Boolean(cached?.loaded) });
    window.addEventListener('click', closeMenu);
  });

  onDestroy(() => {
    window.removeEventListener('click', closeMenu);
  });

  async function loadDocuments({ background = false } = {}) {
    actionError = '';
    if (background) {
      refreshing = true;
    } else {
      loading = true;
      error = '';
    }

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
      writePageCache(STUDY_INDEX_CACHE_KEY, { loaded: true, documents });
    } catch (err) {
      error = err?.message || t('documentsPage.errors.load');
    } finally {
      if (background) {
        refreshing = false;
      } else {
        loading = false;
      }
    }
  }

  function closeMenu() {
    openMenuId = '';
  }

  function goToHome() {
    window.location.hash = '/home';
  }

  function openDocument(documentId) {
    openMenuId = '';
    window.location.hash = `/study/${documentId}`;
  }

  function handleDocumentCardKeydown(event, documentId) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    openDocument(documentId);
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
    return getDocumentFileTypeLabel(doc, { fallback: 'FILE' });
  }

  function getFileBadgeTone(doc) {
    const fileType = getFileType(doc);
    if (fileType === 'PDF') return 'destructive';
    if (fileType === 'DOCX') return 'info';
    if (fileType === 'PPTX') return 'warning';
    return 'accent';
  }

  function openRenameModal(doc) {
    openMenuId = '';
    const currentName = typeof doc?.originalName === 'string' ? doc.originalName.trim() : '';
    if (!currentName) return;

    pendingRenameDoc = doc;
    renameValue = currentName;
    renameOpen = true;
  }

  function closeRenameModal() {
    renameOpen = false;
    pendingRenameDoc = null;
    renameValue = '';
  }

  async function renameDocument() {
    const currentName = typeof pendingRenameDoc?.originalName === 'string' ? pendingRenameDoc.originalName.trim() : '';
    const nextName = renameValue.trim();
    if (!pendingRenameDoc?.id || !nextName || nextName === currentName) {
      return;
    }

    actionBusyId = pendingRenameDoc.id;
    actionError = '';
    try {
      const response = await fetch(`${API_BASE}/api/document/${pendingRenameDoc.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalName: nextName })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || t('documentsPage.errors.rename'));
      }

      closeRenameModal();
      await loadDocuments({ background: true });
    } catch (err) {
      actionError = err?.message || t('documentsPage.errors.rename');
    } finally {
      actionBusyId = '';
    }
  }

  function openDeleteModal(doc) {
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

      documents = documents.filter((doc) => doc.id !== pendingDeleteDoc.id);
      writePageCache(STUDY_INDEX_CACHE_KEY, { loaded: true, documents });
      closeDeleteModal();
      await loadDocuments({ background: true });
    } catch (err) {
      actionError = err?.message || t('documentsPage.errors.delete');
    } finally {
      actionBusyId = '';
    }
  }
</script>

<div class="library-page">
  <PageHeader eyebrow={t('documentsPage.eyebrow')} title={t('documentsPage.title')} subtitle={t('documentsPage.description')}>
    <div slot="actions" class="header-actions">
      <Button type="button" variant="secondary" on:click={() => loadDocuments({ background: documents.length > 0 })} disabled={loading || refreshing}>
        {refreshing ? t('common.loading') : t('documentsPage.actions.refresh')}
      </Button>
      <Button type="button" variant="primary" on:click={goToHome}>
        {t('documentsPage.actions.uploadCta')}
      </Button>
    </div>
  </PageHeader>

  {#if loading}
    <DocumentListSkeleton />
  {:else}
    {#if error || actionError}
      <div class="alert-stack">
        {#if error}
          <Card class="inline-error" variant="soft" border="strong" padding="sm">{error}</Card>
        {/if}
        {#if actionError}
          <Card class="inline-error" variant="soft" border="strong" padding="sm">{actionError}</Card>
        {/if}
      </div>
    {/if}

    {#if documents.length === 0}
      <EmptyState title={t('documentsPage.emptyTitle')} description={t('documentsPage.emptyDescription')}>
        <Button slot="actions" type="button" variant="primary" on:click={goToHome}>
          {t('documentsPage.actions.uploadCta')}
        </Button>
      </EmptyState>
    {:else}
      <section class="documents-grid">
        {#each documents as doc}
          <DocumentCard
            class="document-card"
            role="link"
            tabindex="0"
            aria-label={doc.originalName}
            title={doc.originalName}
            meta={`${t('documentsPage.labels.uploaded')}: ${formatDate(doc.uploadDate)}`}
            badgeLabel={getFileType(doc)}
            badgeTone={getFileBadgeTone(doc)}
            status={getStatusTone(doc)}
            statusLabel={t(`documentsPage.statuses.${getStatusKey(doc)}`)}
            highlighted={highlightDocumentId === doc.id}
            on:click={() => openDocument(doc.id)}
            on:keydown={(event) => handleDocumentCardKeydown(event, doc.id)}
          >
            <div slot="actions" class="menu-wrap" role="presentation" on:click|stopPropagation>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="card-menu-button"
                aria-label={t('documentsPage.actions.more')}
                aria-expanded={openMenuId === doc.id}
                on:click={(event) => toggleMenu(event, doc.id)}
              >
                <span slot="icon">⋯</span>
              </Button>
              {#if openMenuId === doc.id}
                <MenuSurface class="library-menu" minWidth="140px">
                  <MenuItem on:click={() => openRenameModal(doc)} disabled={actionBusyId === doc.id}>
                    {t('documentsPage.actions.rename')}
                  </MenuItem>
                  <MenuItem
                    tone="danger"
                    on:click={() => openDeleteModal(doc)}
                    disabled={actionBusyId === doc.id}
                  >
                    {t('documentsPage.actions.delete')}
                  </MenuItem>
                </MenuSurface>
              {/if}
            </div>
          </DocumentCard>
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

  <PromptModal
    open={renameOpen}
    title={renameTitle}
    description={renameDescription}
    label={t('documentsPage.actions.rename')}
    value={renameValue}
    placeholder={pendingRenameDoc?.originalName ?? ''}
    confirmLabel={t('documentsPage.actions.rename')}
    cancelLabel={cancelLabel}
    confirmDisabled={renameDisabled}
    confirmLoading={actionBusyId === pendingRenameDoc?.id}
    on:change={(event) => (renameValue = event.detail)}
    on:confirm={renameDocument}
    on:cancel={closeRenameModal}
  />
</div>

<style>
  .library-page {
    width: min(100%, 64rem);
    margin: 0 auto;
    display: grid;
    gap: var(--ui-space-5);
    min-width: 0;
  }

  .header-actions {
    display: inline-flex;
    gap: var(--ui-space-3);
    flex-wrap: wrap;
  }

  .alert-stack {
    display: grid;
    gap: 0.75rem;
  }

  .documents-grid {
    display: grid;
    gap: var(--ui-space-4);
    grid-template-columns: repeat(3, minmax(0, 1fr));
    min-width: 0;
  }

  .library-page :global(.document-card) {
    min-height: 216px;
  }

  .library-page :global(.document-card:focus-visible) {
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
  }

  .menu-wrap {
    position: relative;
  }

  .library-page :global(.card-menu-button) {
    opacity: 0.78;
  }

  .library-page :global(.document-card:hover .card-menu-button),
  .library-page :global(.card-menu-button[aria-expanded='true']) {
    opacity: 1;
  }

  .library-page :global(.library-menu) {
    position: absolute;
    top: calc(var(--ui-control-height-sm) + 6px);
    inset-inline-end: 0;
    z-index: 20;
  }

  .library-page :global(.document-card:hover h2),
  .library-page :global(.document-card:focus-visible h2) {
    text-decoration: underline;
    text-decoration-color: color-mix(in srgb, var(--foreground) 45%, transparent);
    text-underline-offset: 0.16em;
  }

  :global(.inline-error) {
    color: var(--destructive);
  }

  .library-page :global(.empty-state) {
    min-height: 320px;
    border-color: var(--border);
    background: var(--card);
    box-shadow: var(--shadow-card);
  }

  .library-page :global(.document-list-skeleton) {
    gap: 1rem;
  }

  @media (max-width: 1024px) {
    .documents-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    :global(.page-hero) {
      flex-direction: column;
      gap: 1rem;
    }

    .documents-grid {
      grid-template-columns: 1fr;
    }

    .header-actions {
      width: 100%;
    }

    .header-actions :global(.ui-button) {
      flex: 1;
    }
  }
</style>
