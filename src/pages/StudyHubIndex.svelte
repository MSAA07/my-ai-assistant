<script>
  import { onDestroy, onMount } from 'svelte';
  import { API_BASE } from '../config.js';
  import { routeParams } from '../stores/router.js';
  import { t } from '../lib/i18n/t.js';
  import Badge from '../lib/components/ui/Badge.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import Card from '../lib/components/ui/Card.svelte';
  import EmptyState from '../lib/components/ui/EmptyState.svelte';
  import MenuItem from '../lib/components/ui/MenuItem.svelte';
  import MenuSurface from '../lib/components/ui/MenuSurface.svelte';
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

  $: highlightDocumentId = typeof $routeParams?.highlight === 'string' ? $routeParams.highlight : '';
  $: deleteTitle = t('documentsPage.deleteConfirmTitle');
  $: deleteDescription = t('documentsPage.deleteConfirmDescription', {
    name: pendingDeleteDoc?.originalName ?? t('documentsPage.deleteUnknown')
  });
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

  function getFileBadgeTone(doc) {
    const fileType = getFileType(doc);
    if (fileType === 'PDF') return 'destructive';
    if (fileType === 'DOCX') return 'info';
    if (fileType === 'PPTX') return 'warning';
    return 'accent';
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

      await loadDocuments({ background: true });
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
      await loadDocuments({ background: true });
    } catch (err) {
      actionError = err?.message || t('documentsPage.errors.delete');
    } finally {
      actionBusyId = '';
    }
  }
</script>

<div class="library-page">
  <Card as="section" class="page-hero" variant="base" padding="lg" border="strong">
    <div class="heading">
      <Badge tone="neutral" variant="outline" size="sm" className="page-eyebrow">{t('documentsPage.eyebrow')}</Badge>
      <div class="heading-copy">
        <h1>{t('documentsPage.title')}</h1>
        <p class="subtitle">{t('documentsPage.description')}</p>
      </div>
    </div>
    <div class="header-actions">
      <Button type="button" variant="secondary" on:click={() => loadDocuments({ background: documents.length > 0 })} disabled={loading || refreshing}>
        {refreshing ? t('common.loading') : t('documentsPage.actions.refresh')}
      </Button>
      <Button type="button" variant="primary" on:click={goToHome}>
        {t('documentsPage.actions.uploadCta')}
      </Button>
    </div>
  </Card>

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
          <Card
            as="article"
            class="document-card"
            variant="base"
            padding="sm"
            hoverable
            border={highlightDocumentId === doc.id ? 'accent' : 'subtle'}
          >
            <div class="card-top">
              <Badge tone={getFileBadgeTone(doc)} variant="outline" size="sm" className="file-badge">
                {getFileType(doc)}
              </Badge>
              <div class="menu-wrap">
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
                    <MenuItem on:click={() => renameDocument(doc)} disabled={actionBusyId === doc.id}>
                      {t('documentsPage.actions.rename')}
                    </MenuItem>
                    <MenuItem
                      tone="danger"
                      on:click={(event) => openDeleteModal(event, doc)}
                      disabled={actionBusyId === doc.id}
                    >
                      {t('documentsPage.actions.delete')}
                    </MenuItem>
                  </MenuSurface>
                {/if}
              </div>
            </div>

            <a class="card-link" href={`#/study/${doc.id}`}>
              <div class="card-main">
                <h2>{doc.originalName}</h2>
                <p class="meta">
                  {t('documentsPage.labels.uploaded')}: {formatDate(doc.uploadDate)}
                </p>
              </div>
              <div class="card-footer">
                <StatusBadge
                  status={getStatusTone(doc)}
                  label={t(`documentsPage.statuses.${getStatusKey(doc)}`)}
                />
              </div>
            </a>
          </Card>
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
    width: min(100%, 64rem);
    margin: 0 auto;
    display: grid;
    gap: 1.5rem;
    min-width: 0;
  }

  :global(.page-hero) {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1.5rem;
    flex-wrap: wrap;
    background:
      radial-gradient(circle at top right, color-mix(in srgb, var(--foreground) 7%, transparent) 0%, transparent 46%),
      linear-gradient(180deg, color-mix(in srgb, var(--card) 92%, var(--muted) 8%) 0%, var(--card) 100%);
  }

  .heading {
    display: grid;
    gap: 0.75rem;
    min-width: 0;
  }

  .heading-copy {
    display: grid;
    gap: 0.4rem;
  }

  .header-actions {
    display: inline-flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  :global(.page-eyebrow) {
    min-height: 22px;
    width: fit-content;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted-foreground);
  }

  h1 {
    margin: 0;
    color: var(--foreground);
    font-size: clamp(1.55rem, 3vw, 1.95rem);
    font-weight: 600;
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  .subtitle {
    margin: 0;
    max-width: 42rem;
    font-size: 0.95rem;
    line-height: 1.55;
    color: var(--muted-foreground);
  }

  .alert-stack {
    display: grid;
    gap: 0.75rem;
  }

  .documents-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    min-width: 0;
  }

  .library-page :global(.document-card) {
    display: grid;
    gap: 1rem;
    min-height: 216px;
    border: 1px solid color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    box-shadow: none;
  }

  .library-page :global(.document-card[data-border='accent']) {
    border-color: color-mix(in srgb, var(--foreground) 18%, var(--border) 82%);
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }

  :global(.file-badge) {
    letter-spacing: 0.04em;
    text-transform: uppercase;
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

  h2 {
    margin: 0;
    color: var(--foreground);
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.35;
    letter-spacing: -0.02em;
    word-break: break-word;
  }

  .meta {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }

  .card-link {
    color: inherit;
    text-decoration: none;
    display: grid;
    gap: 1rem;
    min-height: 0;
    height: 100%;
    padding-top: 0.125rem;
  }

  .card-main {
    display: grid;
    gap: 0.55rem;
  }

  .card-footer {
    margin-top: auto;
    display: flex;
    justify-content: flex-start;
  }

  .card-link:hover h2,
  .card-link:focus-visible h2 {
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
