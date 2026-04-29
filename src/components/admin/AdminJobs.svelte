<script>
  import { onMount } from 'svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import { API_BASE } from '../../config.js';
  import { readPageCache, writePageCache } from '../../stores/pageCache.js';

  const CACHE_KEY = 'page:admin:jobs';
  const jobStatuses = ['all', 'queued', 'running', 'succeeded', 'failed'];
  const jobTypes = ['all', 'extract_document', 'generate_summary', 'generate_flashcards', 'generate_exam', 'export_pdf'];

  let jobs = [];
  let summary = null;
  let selectedJob = null;
  let loading = true;
  let refreshing = false;
  let detailLoading = false;
  let error = '';
  let detailError = '';
  let statusFilter = 'all';
  let typeFilter = 'all';
  let userFilter = '';
  let documentFilter = '';
  let failedOnly = false;
  let stuckOnly = false;

  const statusTone = (status) => ({
    queued: 'neutral',
    running: 'info',
    succeeded: 'success',
    failed: 'danger'
  }[status] || 'neutral');

  function formatDate(value) {
    return value ? new Date(value).toLocaleString() : '-';
  }

  function formatDuration(ms) {
    const value = Number(ms);
    if (!Number.isFinite(value)) return '-';
    if (value < 1000) return `${value} ms`;
    const seconds = value / 1000;
    if (seconds < 60) return `${seconds.toFixed(seconds >= 10 ? 0 : 1)} s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }

  function shortId(id = '') {
    return id ? id.slice(0, 8) : '-';
  }

  function jobLabel(job) {
    return job?.jobType?.replaceAll('_', ' ') || 'job';
  }

  function buildQuery() {
    const params = new URLSearchParams();
    params.set('limit', '50');
    if (statusFilter !== 'all' && !failedOnly && !stuckOnly) params.set('status', statusFilter);
    if (typeFilter !== 'all') params.set('jobType', typeFilter);
    if (userFilter.trim()) params.set('userId', userFilter.trim());
    if (documentFilter.trim()) params.set('documentId', documentFilter.trim());
    if (failedOnly) params.set('failedOnly', 'true');
    if (stuckOnly) params.set('stuckOnly', 'true');
    return params.toString();
  }

  async function fetchSummary() {
    const response = await fetch(`${API_BASE}/api/admin/jobs/summary`, {
      credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch job summary');
    summary = data;
  }

  async function fetchJobs({ background = false } = {}) {
    if (background) {
      refreshing = true;
    } else {
      loading = true;
      error = '';
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/jobs?${buildQuery()}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch jobs');

      jobs = data.jobs || [];
      await fetchSummary();
      writePageCache(CACHE_KEY, {
        loaded: true,
        jobs,
        summary,
        statusFilter,
        typeFilter,
        userFilter,
        documentFilter,
        failedOnly,
        stuckOnly
      });
    } catch (err) {
      error = err.message;
    } finally {
      if (background) {
        refreshing = false;
      } else {
        loading = false;
      }
    }
  }

  async function selectJob(job) {
    selectedJob = job;
    detailLoading = true;
    detailError = '';

    try {
      const response = await fetch(`${API_BASE}/api/admin/jobs/${job.id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch job detail');
      selectedJob = data.job;
    } catch (err) {
      detailError = err.message;
    } finally {
      detailLoading = false;
    }
  }

  function clearDetail() {
    selectedJob = null;
    detailError = '';
  }

  function applyQuickFilter(kind) {
    failedOnly = kind === 'failed';
    stuckOnly = kind === 'stuck';
    if (failedOnly || stuckOnly) statusFilter = 'all';
    void fetchJobs({ background: jobs.length > 0 });
  }

  onMount(() => {
    const cached = readPageCache(CACHE_KEY);
    if (cached?.loaded) {
      jobs = Array.isArray(cached.jobs) ? cached.jobs : [];
      summary = cached.summary || null;
      statusFilter = cached.statusFilter || 'all';
      typeFilter = cached.typeFilter || 'all';
      userFilter = cached.userFilter || '';
      documentFilter = cached.documentFilter || '';
      failedOnly = Boolean(cached.failedOnly);
      stuckOnly = Boolean(cached.stuckOnly);
      loading = false;
    }
    void fetchJobs({ background: Boolean(cached?.loaded) });
  });
</script>

<div class="admin-jobs">
  <DataSurface title="Jobs" description="Worker activity, failures, retries, and heartbeat state." tableMinWidth="1320px">
    <Button slot="actions" type="button" variant="secondary" size="sm" on:click={() => fetchJobs({ background: jobs.length > 0 })} disabled={loading || refreshing}>
      {refreshing ? 'Refreshing...' : 'Refresh'}
    </Button>

    <svelte:fragment slot="filters">
      <FieldShell className="filter-field" label="Status">
        <select bind:value={statusFilter} disabled={failedOnly || stuckOnly} on:change={() => fetchJobs({ background: jobs.length > 0 })}>
          {#each jobStatuses as status}
            <option value={status}>{status === 'all' ? 'All statuses' : status}</option>
          {/each}
        </select>
      </FieldShell>

      <FieldShell className="filter-field" label="Job Type">
        <select bind:value={typeFilter} on:change={() => fetchJobs({ background: jobs.length > 0 })}>
          {#each jobTypes as type}
            <option value={type}>{type === 'all' ? 'All job types' : type.replaceAll('_', ' ')}</option>
          {/each}
        </select>
      </FieldShell>

      <FieldShell className="filter-field" label="User ID">
        <input placeholder="User ID" bind:value={userFilter} on:change={() => fetchJobs({ background: jobs.length > 0 })} />
      </FieldShell>

      <FieldShell className="filter-field" label="Document ID">
        <input placeholder="Document ID" bind:value={documentFilter} on:change={() => fetchJobs({ background: jobs.length > 0 })} />
      </FieldShell>
    </svelte:fragment>

    <svelte:fragment slot="bulk">
      <div class="summary-strip">
        <button type="button" class:active={failedOnly} on:click={() => applyQuickFilter('failed')}>
          <span>{summary?.failedLast24h ?? 0}</span>
          <small>failed 24h</small>
        </button>
        <button type="button" class:active={stuckOnly} on:click={() => applyQuickFilter('stuck')}>
          <span>{summary?.stuckJobs?.length ?? 0}</span>
          <small>stuck</small>
        </button>
        <button type="button" class:active={!failedOnly && !stuckOnly} on:click={() => applyQuickFilter('all')}>
          <span>{summary?.runningJobs ?? 0}</span>
          <small>running</small>
        </button>
      </div>
    </svelte:fragment>

    <svelte:fragment slot="state">
      {#if loading && jobs.length === 0}
        <p class="ui-data-state-note">Loading jobs...</p>
      {:else if error}
        <Card class="ui-data-state-error" variant="soft" border="strong" padding="sm">{error}</Card>
      {:else if jobs.length === 0}
        <p class="ui-data-state-note">No jobs match the current filters.</p>
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="table">
      {#if !loading && !error && jobs.length > 0}
        <table class="ui-data-table jobs-table">
          <thead>
            <tr>
              <th>Job</th>
              <th>User</th>
              <th>Document</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Queued</th>
              <th>Started</th>
              <th>Completed</th>
              <th>Duration</th>
              <th>Retry</th>
              <th>Worker</th>
              <th>Heartbeat</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {#each jobs as job}
              <tr class:selected={selectedJob?.id === job.id} on:click={() => selectJob(job)}>
                <td>
                  <strong>{shortId(job.id)}</strong>
                  <span>{jobLabel(job)}</span>
                </td>
                <td>
                  <strong>{job.user?.name || '-'}</strong>
                  <span>{job.user?.email || job.userId}</span>
                </td>
                <td>
                  <strong>{job.document?.originalName || '-'}</strong>
                  <span>{shortId(job.documentId)}</span>
                </td>
                <td>
                  <Badge tone={job.stuck ? 'warning' : statusTone(job.status)} size="xs" uppercase>
                    {job.stuck ? 'stuck' : job.status}
                  </Badge>
                </td>
                <td>{job.progressPct}%</td>
                <td>{formatDate(job.queuedAt)}</td>
                <td>{formatDate(job.startedAt)}</td>
                <td>{formatDate(job.completedAt)}</td>
                <td>{formatDuration(job.totalDurationMs)}</td>
                <td>{job.retryCount}/{job.maxRetries}</td>
                <td class="mono">{job.workerId || '-'}</td>
                <td>{formatDate(job.lastHeartbeatAt)}</td>
                <td class="error-cell">{job.errorMessage || '-'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </svelte:fragment>
  </DataSurface>

  {#if selectedJob}
    <DataSurface title={`Job ${shortId(selectedJob.id)}`} description={`${jobLabel(selectedJob)} timeline and linked records.`} tableMinWidth="860px">
      <Button slot="actions" type="button" variant="secondary" size="sm" on:click={clearDetail}>
        Close
      </Button>

      <svelte:fragment slot="panels">
        <div class="detail-grid">
          <div>
            <span>Status</span>
            <strong>{selectedJob.stuck ? 'stuck' : selectedJob.status}</strong>
          </div>
          <div>
            <span>Document</span>
            <strong>{selectedJob.document?.originalName || shortId(selectedJob.documentId)}</strong>
          </div>
          <div>
            <span>Generation</span>
            <strong>{selectedJob.generation?.generationType || shortId(selectedJob.generationId)}</strong>
          </div>
          <div>
            <span>Total Duration</span>
            <strong>{formatDuration(selectedJob.totalDurationMs)}</strong>
          </div>
        </div>
      </svelte:fragment>

      <svelte:fragment slot="state">
        {#if detailLoading}
          <p class="ui-data-state-note">Loading job timeline...</p>
        {:else if detailError}
          <Card class="ui-data-state-error" variant="soft" border="strong" padding="sm">{detailError}</Card>
        {:else if !selectedJob.stageEvents?.length}
          <p class="ui-data-state-note">No stage timings have been recorded for this job yet.</p>
        {/if}
      </svelte:fragment>

      <svelte:fragment slot="table">
        {#if !detailLoading && !detailError && selectedJob.stageEvents?.length}
          <table class="ui-data-table timeline-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Status</th>
                <th>Attempt</th>
                <th>Started</th>
                <th>Ended</th>
                <th>Duration</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {#each selectedJob.stageEvents as stage}
                <tr>
                  <td><strong>{stage.stageName.replaceAll('_', ' ')}</strong></td>
                  <td>
                    <Badge tone={statusTone(stage.status)} size="xs" uppercase>{stage.status}</Badge>
                  </td>
                  <td>{stage.attemptNumber}</td>
                  <td>{formatDate(stage.startedAt)}</td>
                  <td>{formatDate(stage.endedAt)}</td>
                  <td>{formatDuration(stage.durationMs)}</td>
                  <td class="error-cell">{stage.errorSummary || '-'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </svelte:fragment>
    </DataSurface>
  {/if}
</div>

<style>
  .admin-jobs {
    display: grid;
    gap: var(--ui-space-4);
    min-width: 0;
  }

  .summary-strip {
    display: flex;
    gap: var(--ui-space-2);
    flex-wrap: wrap;
  }

  .summary-strip button {
    display: grid;
    gap: 0.1rem;
    min-width: 88px;
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-sm);
    background: var(--ui-surface-card);
    color: var(--ui-text-primary);
    padding: 0.55rem 0.7rem;
    text-align: start;
    cursor: pointer;
  }

  .summary-strip button.active {
    border-color: color-mix(in srgb, var(--ui-text-primary) 48%, var(--ui-border-default));
    background: color-mix(in srgb, var(--ui-text-primary) 10%, var(--ui-surface-card));
  }

  .summary-strip span {
    font-weight: 700;
    font-size: var(--ui-type-title-sm);
  }

  .summary-strip small,
  .jobs-table td span {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
  }

  .jobs-table tbody tr {
    cursor: pointer;
  }

  .jobs-table tbody tr.selected {
    background: color-mix(in srgb, var(--ui-text-primary) 9%, transparent);
  }

  .jobs-table td:first-child,
  .jobs-table td:nth-child(2),
  .jobs-table td:nth-child(3) {
    min-width: 150px;
  }

  .jobs-table td strong,
  .jobs-table td span {
    display: block;
  }

  .mono {
    max-width: 180px;
    word-break: break-word;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: var(--ui-type-label);
  }

  .error-cell {
    max-width: 260px;
    word-break: break-word;
    color: color-mix(in srgb, var(--ui-accent-danger) 72%, var(--ui-text-secondary));
    font-size: var(--ui-type-label);
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--ui-space-3);
  }

  .detail-grid div {
    display: grid;
    gap: 0.2rem;
    min-width: 0;
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-sm);
    padding: var(--ui-space-3);
    background: var(--ui-surface-secondary);
  }

  .detail-grid span {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
  }

  .detail-grid strong {
    color: var(--ui-text-primary);
    font-size: var(--ui-type-body-sm);
    overflow-wrap: anywhere;
  }

  @media (max-width: 840px) {
    .detail-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .detail-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
