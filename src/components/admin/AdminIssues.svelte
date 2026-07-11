<script>
  import { onMount } from 'svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import { API_BASE } from '../../config.js';
  import { formatDate, t } from '../../lib/i18n/t.js';
  import { language } from '../../lib/stores/language.js';

  const PAGE_SIZE = 50;
  const types = ['all', 'job_failure', 'admin_alert', 'cost_anomaly'];
  const severities = ['all', 'error', 'warning', 'info'];
  const resolvedOptions = [
    { value: 'all', label: 'all' },
    { value: 'false', label: 'unresolved' },
    { value: 'true', label: 'resolved' }
  ];

  let issues = [];
  let total = 0;
  let page = 1;
  let loading = true;
  let refreshing = false;
  let exporting = false;
  let error = '';
  let typeFilter = 'all';
  let severityFilter = 'all';
  let resolvedFilter = 'all';
  let startDate = '';
  let endDate = '';
  let expandedIssueIds = new Set();

  $: pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  $: $language;

  function buildQuery({ includePage = true } = {}) {
    const params = new URLSearchParams();
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (severityFilter !== 'all') params.set('severity', severityFilter);
    if (resolvedFilter !== 'all') params.set('resolved', resolvedFilter);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (includePage) {
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
    }
    return params.toString();
  }

  function issueLabel(value) {
    return t(`adminIssues.values.${value}`);
  }

  function severityTone(severity) {
    return {
      error: 'destructive',
      warning: 'warning',
      info: 'info'
    }[severity] || 'neutral';
  }

  function typeTone(type) {
    return {
      job_failure: 'destructive',
      admin_alert: 'warning',
      cost_anomaly: 'info'
    }[type] || 'neutral';
  }

  function formattedDate(value) {
    return formatDate(value, { dateStyle: 'medium', timeStyle: 'short' }) || '-';
  }

  function isLongMessage(message = '') {
    return message.length > 180;
  }

  function visibleMessage(issue) {
    if (!isLongMessage(issue.message) || expandedIssueIds.has(issue.id)) return issue.message;
    return `${issue.message.slice(0, 180)}…`;
  }

  function toggleMessage(issueId) {
    const next = new Set(expandedIssueIds);
    if (next.has(issueId)) next.delete(issueId);
    else next.add(issueId);
    expandedIssueIds = next;
  }

  async function fetchIssues({ background = false } = {}) {
    if (background) {
      refreshing = true;
    } else {
      loading = true;
      error = '';
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/issues?${buildQuery()}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t('adminIssues.errors.fetch'));

      issues = data.items || [];
      total = Number(data.total) || 0;
      page = Number(data.page) || 1;
      expandedIssueIds = new Set();
    } catch (err) {
      error = err.message || t('adminIssues.errors.fetch');
    } finally {
      if (background) refreshing = false;
      else loading = false;
    }
  }

  function applyFilters() {
    page = 1;
    void fetchIssues({ background: issues.length > 0 });
  }

  function goToPage(nextPage) {
    if (nextPage < 1 || nextPage > pageCount || nextPage === page) return;
    page = nextPage;
    void fetchIssues({ background: issues.length > 0 });
  }

  function getDownloadFilename(contentDisposition) {
    const match = contentDisposition?.match(/filename="?([^";]+)"?/i);
    return match?.[1] || 'issues-feed.csv';
  }

  async function exportCsv() {
    exporting = true;
    error = '';

    try {
      const query = buildQuery({ includePage: false });
      const response = await fetch(`${API_BASE}/api/admin/issues/export${query ? `?${query}` : ''}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || t('adminIssues.errors.export'));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = getDownloadFilename(response.headers.get('content-disposition'));
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      error = err.message || t('adminIssues.errors.export');
    } finally {
      exporting = false;
    }
  }

  onMount(() => {
    void fetchIssues();
  });
</script>

<DataSurface title={t('adminIssues.title')} description={t('adminIssues.description')} tableMinWidth="960px">
  <div slot="actions" class="issue-actions">
    <Button type="button" variant="secondary" size="sm" on:click={() => fetchIssues({ background: issues.length > 0 })} disabled={loading || refreshing}>
      {refreshing ? t('adminIssues.refreshing') : t('adminIssues.refresh')}
    </Button>
    <Button type="button" variant="primary" size="sm" on:click={exportCsv} disabled={exporting}>
      {exporting ? t('adminIssues.exporting') : t('adminIssues.exportCsv')}
    </Button>
  </div>

  <svelte:fragment slot="filters">
    <FieldShell className="filter-field" label={t('adminIssues.filters.type')}>
      <select bind:value={typeFilter} on:change={applyFilters} aria-label={t('adminIssues.filters.type')}>
        {#each types as type}
          <option value={type}>{issueLabel(type)}</option>
        {/each}
      </select>
    </FieldShell>

    <FieldShell className="filter-field" label={t('adminIssues.filters.severity')}>
      <select bind:value={severityFilter} on:change={applyFilters} aria-label={t('adminIssues.filters.severity')}>
        {#each severities as severity}
          <option value={severity}>{issueLabel(severity)}</option>
        {/each}
      </select>
    </FieldShell>

    <FieldShell className="filter-field" label={t('adminIssues.filters.resolved')}>
      <select bind:value={resolvedFilter} on:change={applyFilters} aria-label={t('adminIssues.filters.resolved')}>
        {#each resolvedOptions as resolved}
          <option value={resolved.value}>{issueLabel(resolved.label)}</option>
        {/each}
      </select>
    </FieldShell>

    <FieldShell className="filter-field" label={t('adminIssues.filters.startDate')}>
      <input type="date" bind:value={startDate} on:change={applyFilters} aria-label={t('adminIssues.filters.startDate')} />
    </FieldShell>

    <FieldShell className="filter-field" label={t('adminIssues.filters.endDate')}>
      <input type="date" bind:value={endDate} on:change={applyFilters} aria-label={t('adminIssues.filters.endDate')} />
    </FieldShell>
  </svelte:fragment>

  <svelte:fragment slot="state">
    {#if loading && issues.length === 0}
      <p class="ui-data-state-note">{t('adminIssues.loading')}</p>
    {:else if error}
      <Card class="ui-data-state-error" variant="soft" border="strong" padding="sm">{error}</Card>
    {:else if issues.length === 0}
      <p class="ui-data-state-note">{t('adminIssues.empty')}</p>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="table">
    {#if !loading && !error && issues.length > 0}
      <table class="ui-data-table issues-table">
        <thead>
          <tr>
            <th>{t('adminIssues.columns.severity')}</th>
            <th>{t('adminIssues.columns.type')}</th>
            <th>{t('adminIssues.columns.title')}</th>
            <th>{t('adminIssues.columns.message')}</th>
            <th>{t('adminIssues.columns.createdAt')}</th>
            <th>{t('adminIssues.columns.resolved')}</th>
          </tr>
        </thead>
        <tbody>
          {#each issues as issue}
            <tr>
              <td><Badge tone={severityTone(issue.severity)} size="xs" uppercase>{issueLabel(issue.severity)}</Badge></td>
              <td><Badge tone={typeTone(issue.type)} size="xs">{issueLabel(issue.type)}</Badge></td>
              <td><strong>{issue.title}</strong></td>
              <td class="message-cell">
                <span>{visibleMessage(issue)}</span>
                {#if isLongMessage(issue.message)}
                  <Button type="button" variant="ghost" size="sm" on:click={() => toggleMessage(issue.id)}>
                    {expandedIssueIds.has(issue.id) ? t('adminIssues.showLess') : t('adminIssues.showMore')}
                  </Button>
                {/if}
              </td>
              <td>{formattedDate(issue.createdAt)}</td>
              <td>
                <Badge tone={issue.resolved ? 'success' : 'neutral'} size="xs">
                  {issue.resolved ? t('adminIssues.values.resolved') : t('adminIssues.values.unresolved')}
                </Badge>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </svelte:fragment>

  {#if !loading && !error && total > 0}
    <nav class="issues-pagination" aria-label={t('adminIssues.pagination.label')}>
      <span>{t('adminIssues.pagination.summary', { page, pageCount, total })}</span>
      <div>
        <Button type="button" variant="secondary" size="sm" on:click={() => goToPage(page - 1)} disabled={page <= 1 || refreshing}>
          {t('adminIssues.pagination.previous')}
        </Button>
        <Button type="button" variant="secondary" size="sm" on:click={() => goToPage(page + 1)} disabled={page >= pageCount || refreshing}>
          {t('adminIssues.pagination.next')}
        </Button>
      </div>
    </nav>
  {/if}
</DataSurface>

<style>
  .issue-actions,
  .issues-pagination,
  .issues-pagination > div {
    display: flex;
    align-items: center;
    gap: var(--ui-space-2);
    flex-wrap: wrap;
  }

  .issues-pagination {
    justify-content: space-between;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
  }

  .message-cell {
    min-width: 280px;
    max-width: 460px;
    overflow-wrap: anywhere;
  }

  .message-cell :global(.ui-button) {
    margin-inline-start: var(--ui-space-1);
    vertical-align: baseline;
  }

  select,
  select option {
    background-color: var(--ui-surface-card);
    color: var(--ui-text-primary);
  }

  select:focus-visible {
    border-color: var(--ui-border-focus);
    box-shadow: var(--ui-focus-ring-strong);
  }

  @media (max-width: 640px) {
    .issues-pagination,
    .issues-pagination > div {
      align-items: stretch;
      width: 100%;
    }

    .issues-pagination > div :global(.ui-button) {
      flex: 1;
    }
  }
</style>
