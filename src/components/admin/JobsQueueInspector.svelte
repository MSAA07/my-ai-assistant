<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import SectionState from '../../lib/components/ui/SectionState.svelte';
  import { API_BASE } from '../../config.js';
  import { toast } from '../../stores/toasts.js';
  import { buildJobsQuery, JOB_PAGE_SIZE } from '../../lib/admin/operations.js';

  const dispatch = createEventDispatcher();
  const jobStatuses = ['all', 'queued', 'running', 'succeeded', 'failed'];
  const jobTypes = ['all', 'extract_document', 'generate_summary', 'generate_flashcards', 'generate_exam', 'export_pdf'];

  let jobs = [];
  let summary = null;
  let page = 1;
  let total = 0;
  let loading = true;
  let refreshing = false;
  let error = '';
  let search = '';
  let statusFilter = 'all';
  let typeFilter = 'all';
  let failedOnly = false;
  let stuckOnly = false;
  let selectedJob = null;
  let detailLoading = false;
  let detailError = '';
  let retryingId = '';

  $: pageCount = Math.max(1, Math.ceil(total / JOB_PAGE_SIZE));
  $: pageStart = total === 0 ? 0 : (page - 1) * JOB_PAGE_SIZE + 1;
  $: pageEnd = Math.min((page - 1) * JOB_PAGE_SIZE + jobs.length, total);

  async function fetchJson(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  async function loadSummary() {
    try {
      summary = await fetchJson('/api/admin/jobs/summary');
    } catch {
      summary = null;
    }
  }

  async function fetchJobs({ background = false, resetPage = false } = {}) {
    if (resetPage) page = 1;
    if (background) refreshing = true;
    else { loading = true; error = ''; }
    try {
      const query = buildJobsQuery({ page, search, status: statusFilter, jobType: typeFilter, failedOnly, stuckOnly });
      const data = await fetchJson(`/api/admin/jobs?${query}`);
      jobs = data.jobs || [];
      total = Number(data.total || 0);
      page = Number(data.page || page);
      error = '';
      void loadSummary();
    } catch (err) {
      error = err.message || 'Failed to load jobs';
    } finally {
      loading = false;
      refreshing = false;
    }
  }

  async function openDetail(job) {
    selectedJob = job;
    detailLoading = true;
    detailError = '';
    try {
      const data = await fetchJson(`/api/admin/jobs/${job.id}`);
      selectedJob = data.job;
    } catch (err) {
      detailError = err.message || 'Failed to load job timeline';
    } finally {
      detailLoading = false;
    }
  }

  async function retryJob(job) {
    retryingId = job.id;
    try {
      await fetchJson(`/api/admin/jobs/${job.id}/retry`, { method: 'POST' });
      jobs = jobs.map((entry) => entry.id === job.id ? {
        ...entry,
        status: 'queued',
        stuck: false,
        progressPct: 0,
        retryCount: 0,
        errorMessage: null,
        startedAt: null,
        completedAt: null
      } : entry);
      toast.success('Job requeued.');
      dispatch('jobretry', { jobId: job.id });
      void loadSummary();
    } catch (err) {
      toast.error(err.message || 'Failed to requeue job.');
    } finally {
      retryingId = '';
    }
  }

  function applyQuickFilter(kind) {
    failedOnly = kind === 'failed';
    stuckOnly = kind === 'stuck';
    if (failedOnly || stuckOnly) statusFilter = 'all';
    void fetchJobs({ background: jobs.length > 0, resetPage: true });
  }

  function applyFilters() {
    failedOnly = false;
    stuckOnly = false;
    void fetchJobs({ background: jobs.length > 0, resetPage: true });
  }

  function changePage(next) {
    if (next < 1 || next > pageCount || next === page) return;
    page = next;
    void fetchJobs({ background: true });
  }

  const statusTone = (status) => ({ queued: 'neutral', running: 'info', succeeded: 'success', failed: 'destructive' }[status] || 'neutral');
  const formatDate = (value) => value ? new Date(value).toLocaleString() : '-';
  const shortId = (value = '') => value ? value.slice(0, 8) : '-';
  const jobLabel = (job) => job?.jobType?.replaceAll('_', ' ') || 'job';
  function formatDuration(ms) {
    const value = Number(ms);
    if (!Number.isFinite(value)) return '-';
    if (value < 1000) return `${value} ms`;
    const seconds = Math.round(value / 1000);
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }

  onMount(() => { void fetchJobs(); void loadSummary(); });
</script>

<section aria-labelledby="jobs-queue-title">
  <DataSurface title="Jobs & Queue" description="Search worker activity, inspect stage timing, and requeue failed or stuck work." tableMinWidth="1180px">
    <svelte:fragment slot="header">
      <div><h2 id="jobs-queue-title">Jobs &amp; Queue</h2><p>Search worker activity, inspect stage timing, and requeue failed or stuck work.</p></div>
    </svelte:fragment>
    <Button slot="actions" type="button" variant="secondary" size="sm" disabled={loading || refreshing} on:click={() => fetchJobs({ background: jobs.length > 0 })}>{refreshing ? 'Refreshing...' : 'Refresh'}</Button>

    <svelte:fragment slot="filters">
      <FieldShell className="filter-field" label="Search"><input aria-label="Search jobs" placeholder="Job, user, document, type, or error" bind:value={search} on:change={applyFilters} /></FieldShell>
      <FieldShell className="filter-field" label="Status"><select aria-label="Job status" bind:value={statusFilter} disabled={failedOnly || stuckOnly} on:change={applyFilters}>{#each jobStatuses as status}<option value={status}>{status === 'all' ? 'All statuses' : status}</option>{/each}</select></FieldShell>
      <FieldShell className="filter-field" label="Job type"><select aria-label="Job type" bind:value={typeFilter} on:change={applyFilters}>{#each jobTypes as type}<option value={type}>{type === 'all' ? 'All job types' : type.replaceAll('_', ' ')}</option>{/each}</select></FieldShell>
    </svelte:fragment>

    <svelte:fragment slot="bulk">
      <div class="summary-strip" aria-label="Queue summary">
        <button type="button" class:active={failedOnly} on:click={() => applyQuickFilter('failed')}><strong>{summary?.failedLast24h ?? 0}</strong><span>Failed 24h</span></button>
        <button type="button" class:active={stuckOnly} on:click={() => applyQuickFilter('stuck')}><strong>{summary?.stuckJobs?.length ?? 0}</strong><span>Stuck</span></button>
        <button type="button" class:active={!failedOnly && !stuckOnly} on:click={() => applyQuickFilter('all')}><strong>{summary?.runningJobs ?? 0}</strong><span>Running</span></button>
      </div>
    </svelte:fragment>

    <svelte:fragment slot="state">
      {#if loading && jobs.length === 0}<SectionState message="Loading jobs and queue state..." />
      {:else if error}<SectionState error message={error} retry={() => fetchJobs()} />
      {:else if jobs.length === 0}<SectionState message="No jobs match the current filters." />{/if}
    </svelte:fragment>

    <svelte:fragment slot="table">
      {#if !loading && !error && jobs.length > 0}
        <table class="ui-data-table">
          <thead><tr><th>Job</th><th>User</th><th>Status</th><th>Progress</th><th>Queued</th><th>Duration</th><th>Retry</th><th>Error</th><th>Actions</th></tr></thead>
          <tbody>{#each jobs as job (job.id)}<tr>
            <td><strong>{shortId(job.id)}</strong><span class="subtext">{jobLabel(job)}</span></td>
            <td><strong>{job.user?.name || '-'}</strong><span class="subtext">{job.user?.email || job.userId}</span></td>
            <td><Badge tone={job.stuck ? 'warning' : statusTone(job.status)} size="xs" uppercase>{job.stuck ? 'stuck' : job.status}</Badge></td>
            <td>{job.progressPct}%</td><td>{formatDate(job.queuedAt)}</td><td>{formatDuration(job.totalDurationMs)}</td><td>{job.retryCount}/{job.maxRetries}</td>
            <td class="error-cell">{job.errorMessage || '-'}</td>
            <td class="row-actions"><Button type="button" variant="ghost" size="sm" on:click={() => openDetail(job)}>Inspect</Button>{#if job.status === 'failed' || job.stuck}<Button type="button" variant="warning" size="sm" loading={retryingId === job.id} disabled={Boolean(retryingId)} on:click={() => retryJob(job)}>Requeue</Button>{/if}</td>
          </tr>{/each}</tbody>
        </table>
        <div class="pagination"><p>Showing {pageStart}-{pageEnd} of {total} jobs</p><div><Button type="button" variant="secondary" size="sm" disabled={page <= 1 || refreshing} on:click={() => changePage(page - 1)}>Previous</Button><span>Page {page} of {pageCount}</span><Button type="button" variant="secondary" size="sm" disabled={page >= pageCount || refreshing} on:click={() => changePage(page + 1)}>Next</Button></div></div>
      {/if}
    </svelte:fragment>
  </DataSurface>

  {#if selectedJob}
    <aside class="job-detail" aria-labelledby="job-detail-title">
      <header><div><p>Queue inspector</p><h3 id="job-detail-title">Job {shortId(selectedJob.id)}</h3></div><Button type="button" variant="ghost" size="sm" on:click={() => (selectedJob = null)}>Close</Button></header>
      {#if detailLoading}<SectionState message="Loading job timeline..." />
      {:else if detailError}<SectionState error message={detailError} retry={() => openDetail(selectedJob)} />
      {:else}
        <div class="detail-grid"><span><small>Status</small><strong>{selectedJob.stuck ? 'stuck' : selectedJob.status}</strong></span><span><small>Document</small><strong>{selectedJob.document?.originalName || shortId(selectedJob.documentId)}</strong></span><span><small>Generation</small><strong>{selectedJob.generation?.generationType || shortId(selectedJob.generationId)}</strong></span><span><small>Duration</small><strong>{formatDuration(selectedJob.totalDurationMs)}</strong></span></div>
        {#if selectedJob.stageEvents?.length}<ol class="timeline">{#each selectedJob.stageEvents as stage}<li><div><strong>{stage.stageName.replaceAll('_', ' ')}</strong><Badge tone={statusTone(stage.status)} size="xs">{stage.status}</Badge></div><span>Attempt {stage.attemptNumber} · {formatDuration(stage.durationMs)}</span>{#if stage.errorSummary}<p>{stage.errorSummary}</p>{/if}</li>{/each}</ol>{:else}<SectionState message="No stage timings recorded for this job." />{/if}
      {/if}
    </aside>
  {/if}
</section>

<style>
  section { display: grid; gap: var(--ui-space-3); }
  .summary-strip, .summary-strip button, .pagination, .pagination > div, .row-actions { display: flex; align-items: center; gap: var(--ui-space-2); }
  .summary-strip { flex-wrap: wrap; }
  .summary-strip button { padding: var(--ui-space-2) var(--ui-space-3); border: 1px solid var(--ui-border-default); border-radius: var(--ui-radius-sm); background: var(--ui-surface-secondary); color: var(--ui-text-secondary); cursor: pointer; }
  .summary-strip button.active { border-color: var(--ui-border-focus); background: var(--ui-surface-tertiary); color: var(--ui-text-primary); }
  .summary-strip button:focus-visible { outline: 2px solid var(--ui-accent-info); outline-offset: 2px; }
  .subtext { display: block; margin-top: .2rem; color: var(--ui-text-muted); font-size: var(--ui-type-label); }
  .error-cell { max-width: 24rem; overflow-wrap: anywhere; }
  .row-actions { min-width: 11rem; }
  .pagination { justify-content: space-between; padding-top: var(--ui-space-3); }
  .pagination p, .pagination span { margin: 0; color: var(--ui-text-secondary); font-size: var(--ui-type-body-sm); }
  .job-detail { padding: var(--ui-space-4); border: 1px solid var(--ui-border-default); border-radius: var(--ui-radius-md); background: var(--ui-surface-card); box-shadow: var(--ui-shadow-lg); }
  .job-detail > header { display: flex; justify-content: space-between; gap: var(--ui-space-3); margin-bottom: var(--ui-space-3); }
  .job-detail h3, .job-detail p { margin: 0; }.job-detail header p, small { color: var(--ui-text-muted); font-size: var(--ui-type-label); }
  .detail-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: var(--ui-space-3); }.detail-grid span { display: grid; gap: var(--ui-space-1); }
  .timeline { display: grid; gap: var(--ui-space-2); margin: var(--ui-space-4) 0 0; padding: 0; list-style: none; }.timeline li { padding: var(--ui-space-3); border-inline-start: 2px solid var(--ui-border-strong); background: var(--ui-surface-secondary); }.timeline li div { display: flex; align-items: center; justify-content: space-between; gap: var(--ui-space-2); }.timeline li > span, .timeline li p { color: var(--ui-text-secondary); font-size: var(--ui-type-body-sm); }
  input, select, select option { background-color: var(--ui-surface-input); color: var(--ui-text-primary); }
  input:focus-visible, select:focus-visible { border-color: var(--ui-border-focus); box-shadow: var(--ui-focus-ring-strong); }
  @media (max-width: 760px) { .detail-grid { grid-template-columns: 1fr 1fr; }.pagination { align-items: stretch; flex-direction: column; } }
</style>
