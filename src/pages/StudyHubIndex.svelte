<script>
  import { onDestroy, onMount } from 'svelte';
  import { BookOpenText, MoreVertical, Upload } from '@lucide/svelte';
  import { API_BASE } from '../config.js';
  import { routeParams } from '../stores/router.js';
  import { formatDate, t } from '../lib/i18n/t.js';
  import PageLayout from '../lib/components/layout/PageLayout.svelte';
  import Badge from '../lib/components/ui/Badge.svelte';
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
  import { getDocumentDisplayName } from '../lib/utils/documentName.js';
  import { getDocumentFileTypeLabel } from '../lib/utils/fileType.js';
  import { readPageCache, writePageCache } from '../stores/pageCache.js';

  const FEATURE_KEYS = ['summary', 'flashcards', 'exam'];
  const STUDY_INDEX_CACHE_KEY = 'page:study-index';

  let documents = [];
  let loading = true;
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
    name: getDocumentDisplayName(pendingDeleteDoc, t('documentsPage.deleteUnknown'))
  });
  $: renameTitle = t('documentsPage.actions.renamePrompt');
  $: renameDescription = getDocumentDisplayName(pendingRenameDoc);
  $: renameDisabled = !pendingRenameDoc?.id || !renameValue.trim() || renameValue.trim() === getDocumentDisplayName(pendingRenameDoc).trim();
  $: deleteLabel = t('documentsPage.actions.delete');
  $: cancelLabel = t('confirmModal.cancel');
  $: showLibraryEmptyState = !loading && documents.length === 0;

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
    if (!background) {
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
      if (!background) {
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

  function toggleMenu(event, docId) {
    event.stopPropagation();
    openMenuId = openMenuId === docId ? '' : docId;
  }

  function normalizeString(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function normalizeDocumentStatus(status) {
    const normalized = normalizeString(status).toLowerCase();
    if (normalized === 'queued' || normalized === 'processing' || normalized === 'complete' || normalized === 'failed') {
      return normalized;
    }
    return 'unknown';
  }

  function normalizeGenerationStatus(status) {
    const normalized = normalizeString(status).toLowerCase();
    if (normalized === 'not_requested' || normalized === 'queued' || normalized === 'running' || normalized === 'complete' || normalized === 'failed') {
      return normalized;
    }
    return 'not_requested';
  }

  function getDocumentDisplayState(doc) {
    const processingStatus = normalizeDocumentStatus(doc?.processingStatus);
    const generationStatuses = FEATURE_KEYS.map((featureKey) =>
      normalizeGenerationStatus(doc?.generationState?.[featureKey]?.status)
    );
    const hasActiveGeneration = generationStatuses.some((status) => status === 'queued' || status === 'running');
    const hasCompletedGeneration = generationStatuses.some((status) => status === 'complete');
    const hasFailedGeneration = generationStatuses.some((status) => status === 'failed');
    const hasRequestedGeneration = generationStatuses.some((status) => status !== 'not_requested');

    if (processingStatus === 'queued' || processingStatus === 'processing') {
      return {
        tone: 'processing',
        labelKey: 'documentsPage.statuses.processingUpload',
        messageKey: 'documentsPage.statusMessages.processingUpload',
      };
    }

    if (processingStatus === 'failed') {
      return {
        tone: 'failed',
        labelKey: 'documentsPage.statuses.failed',
        messageKey: 'documentsPage.statusMessages.processingFailed',
      };
    }

    if (hasActiveGeneration) {
      return {
        tone: 'processing',
        labelKey: 'documentsPage.statuses.generatingSelected',
        messageKey: 'documentsPage.statusMessages.generatingSelected',
      };
    }

    if (!hasRequestedGeneration) {
      return {
        tone: 'info',
        labelKey: 'documentsPage.statuses.readyToGenerate',
        messageKey: 'documentsPage.statusMessages.readyToGenerate',
      };
    }

    if (hasCompletedGeneration) {
      return {
        tone: 'ready',
        labelKey: 'documentsPage.statuses.complete',
        messageKey: 'documentsPage.statusMessages.ready',
      };
    }

    if (hasFailedGeneration) {
      return {
        tone: 'failed',
        labelKey: 'documentsPage.statuses.failed',
        messageKey: 'documentsPage.statusMessages.generationFailed',
      };
    }

    return {
      tone: 'info',
      labelKey: 'documentsPage.statuses.unknown',
      messageKey: 'documentsPage.statusMessages.unknown',
    };
  }

  function formatDocumentDate(value) {
    if (!value) {
      return 'Unknown';
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 'Unknown' : formatDate(parsed);
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
    const currentName = getDocumentDisplayName(doc).trim();
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
    const currentName = getDocumentDisplayName(pendingRenameDoc).trim();
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

<PageLayout class="library-page" width="wide" gap="compact">
  <PageHeader
    className="library-header"
    eyebrow={t('documentsPage.eyebrow')}
    title={t('documentsPage.title')}
    subtitle={t('documentsPage.description')}
  >
    <svelte:fragment slot="actions">
      {#if !showLibraryEmptyState}
        <div class="header-actions">
          <Button type="button" variant="primary" className="library-upload" on:click={goToHome}>
            <span slot="icon" aria-hidden="true">
              <Upload />
            </span>
            {t('documentsPage.actions.uploadCta')}
          </Button>
        </div>
      {/if}
    </svelte:fragment>
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
      <EmptyState
        variant="hero"
        eyebrow={t('documentsPage.libraryEmptyEyebrow')}
        title={t('documentsPage.libraryEmptyTitle')}
        description={t('documentsPage.libraryEmptyDescription')}
      >
        <div slot="support" class="library-empty-support">
          <p>{t('documentsPage.libraryEmptySupport')}</p>
          <div class="library-empty-support__chips" aria-label={t('documentsPage.libraryEmptyBenefitsLabel')}>
            <Badge tone="neutral" variant="outline" size="sm">{t('documentsPage.libraryEmptySummary')}</Badge>
            <Badge tone="neutral" variant="outline" size="sm">{t('documentsPage.libraryEmptyFlashcards')}</Badge>
            <Badge tone="neutral" variant="outline" size="sm">{t('documentsPage.libraryEmptyExams')}</Badge>
          </div>
        </div>
        <div slot="actions" class="library-empty-actions">
          <Button type="button" variant="primary" size="lg" on:click={goToHome}>
            <span slot="icon" aria-hidden="true">
              <Upload />
            </span>
            {t('documentsPage.libraryEmptyUploadCta')}
          </Button>
        </div>
        <span slot="icon" aria-hidden="true">
          <BookOpenText />
        </span>
      </EmptyState>
    {:else}
      <section class="documents-grid">
        {#each documents as doc}
          {@const displayState = getDocumentDisplayState(doc)}
          <DocumentCard
            as="button"
            type="button"
            class="document-card"
            aria-label={getDocumentDisplayName(doc)}
            title={getDocumentDisplayName(doc)}
            meta={`${t('documentsPage.labels.uploaded')}: ${formatDocumentDate(doc.uploadDate)}`}
            badgeLabel={getFileType(doc)}
            badgeTone={getFileBadgeTone(doc)}
            status={displayState.tone}
            statusLabel={t(displayState.labelKey)}
            highlighted={highlightDocumentId === doc.id}
            on:click={() => openDocument(doc.id)}
          >
            <p class="document-card__detail">{t(displayState.messageKey)}</p>

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
                <span slot="icon" aria-hidden="true">
                  <MoreVertical />
                </span>
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
    placeholder={getDocumentDisplayName(pendingRenameDoc)}
    confirmLabel={t('documentsPage.actions.rename')}
    cancelLabel={cancelLabel}
    confirmDisabled={renameDisabled}
    confirmLoading={actionBusyId === pendingRenameDoc?.id}
    on:change={(event) => (renameValue = event.detail)}
    on:confirm={renameDocument}
    on:cancel={closeRenameModal}
  />
</PageLayout>

<style>
  :global(.library-page) {
    display: grid;
    gap: var(--study-flow-page-gap);
    min-width: 0;
  }

  .header-actions {
    display: inline-flex;
    align-items: center;
    gap: var(--study-flow-action-gap);
    flex-wrap: wrap;
  }

  :global(.library-upload.ui-button) {
    --button-shadow: none;
  }

  .alert-stack {
    display: grid;
    gap: var(--study-flow-copy-gap);
  }

  .documents-grid {
    display: grid;
    gap: var(--study-flow-card-gap);
    grid-template-columns: repeat(3, minmax(0, 1fr));
    min-width: 0;
  }

  :global(.library-page .document-card) {
    min-height: 180px;
  }

  .document-card__detail {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--font-size-sm);
    line-height: 1.55;
  }

  :global(.library-page .document-card:focus-visible) {
    outline: none;
    box-shadow: var(--ui-focus-ring-strong);
  }

  .library-empty-support {
    display: grid;
    gap: var(--ui-space-3);
    justify-items: center;
    width: 100%;
  }

  .library-empty-support p {
    margin: 0;
    max-width: 44ch;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.6;
  }

  .library-empty-support__chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--ui-space-2);
  }

  .library-empty-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--ui-space-2);
  }

  .menu-wrap {
    position: relative;
  }

  :global(.library-page .card-menu-button) {
    opacity: 1;
    min-width: 44px;
    min-height: 44px;
    width: 44px;
    height: 44px;
    transition: opacity var(--motion-fast) var(--ease-standard);
  }

  :global(.library-page .card-menu-button .ui-button__icon svg) {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

  :global(.library-page .library-menu) {
    position: absolute;
    top: calc(var(--ui-control-height-sm) + 6px);
    inset-inline-end: 0;
    z-index: 20;
  }

  :global(.library-page .document-card:hover h2),
  :global(.library-page .document-card:focus-visible h2) {
    color: var(--ui-text-primary);
  }

  :global(.inline-error) {
    color: var(--destructive);
  }

  :global(.library-page .document-list-skeleton) {
    gap: var(--study-flow-card-gap);
  }

  @media (max-width: 1024px) {
    .documents-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 768px) {
    .documents-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .documents-grid {
      grid-template-columns: 1fr;
    }

    .header-actions {
      width: 100%;
      justify-content: space-between;
    }

    .header-actions :global(.ui-button) {
      flex: 1 1 auto;
    }
  }
</style>
