<script>
  import { onMount } from 'svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import ConfirmModal from '../../lib/components/ui/ConfirmModal.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import SectionState from '../../lib/components/ui/SectionState.svelte';
  import { API_BASE } from '../../config.js';
  import { toast } from '../../stores/toasts.js';
  import {
    buildIncidentsQuery,
    formatCodexBrief,
    INCIDENT_PAGE_SIZE,
    optimisticIncidentTransition,
    selectedIncidents
  } from '../../lib/admin/operations.js';
  import JobsQueueInspector from './JobsQueueInspector.svelte';

  const sourceOptions = [
    { value: 'all', label: 'All sources' },
    { value: 'sentry', label: 'Sentry' },
    { value: 'job', label: 'Job' },
    { value: 'cost_alert', label: 'Cost · Alert' }
  ];
  const severityOptions = ['all', 'critical', 'warning', 'info'];

  let incidents = [];
  let total = 0;
  let page = 1;
  let loading = true;
  let refreshing = false;
  let error = '';
  let sourceFilter = 'all';
  let severityFilter = 'all';
  let includeResolved = false;
  let selection = new Set();
  let kpis = { open: 0, openBySource: { sentry: 0, job: 0, costAlert: 0 } };
  let sources = {};
  let refreshedAt = null;
  let busyIds = new Set();
  let bulkConfirmOpen = false;
  let jobsOpen = true;

  $: pageCount = Math.max(1, Math.ceil(total / INCIDENT_PAGE_SIZE));
  $: pageStart = total === 0 ? 0 : (page - 1) * INCIDENT_PAGE_SIZE + 1;
  $: pageEnd = Math.min((page - 1) * INCIDENT_PAGE_SIZE + incidents.length, total);
  $: selected = selectedIncidents(incidents, selection);
  $: codexPreview = formatCodexBrief(selected);
  $: allPageSelected = incidents.length > 0 && incidents.every((incident) => selection.has(incident.id));
  $: degradedSources = Object.entries(sources).filter(([, value]) => value?.status !== 'fresh');

  async function fetchJson(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  async function fetchIncidents({ background = false, resetPage = false, force = false } = {}) {
    if (resetPage) page = 1;
    if (background) refreshing = true;
    else { loading = true; error = ''; }
    try {
      const query = buildIncidentsQuery({ page, source: sourceFilter, severity: severityFilter, includeResolved, refresh: force });
      const data = await fetchJson(`/api/admin/issues?${query}`);
      incidents = data.items || [];
      total = Number(data.total || 0);
      page = Number(data.page || page);
      kpis = {
        open: Number(data.kpis?.open || 0),
        openBySource: {
          sentry: Number(data.kpis?.openBySource?.sentry || 0),
          job: Number(data.kpis?.openBySource?.job || 0),
          costAlert: Number(data.kpis?.openBySource?.costAlert || 0)
        }
      };
      sources = data.sources || {};
      refreshedAt = data.refreshedAt || new Date().toISOString();
      selection = new Set();
      error = '';
    } catch (err) {
      error = err.message || 'Failed to load incident feed';
    } finally {
      loading = false;
      refreshing = false;
    }
  }

  function setBusy(ids, busy) {
    const next = new Set(busyIds);
    ids.forEach((id) => busy ? next.add(id) : next.delete(id));
    busyIds = next;
  }

  function updateSourceKpis(changed, status) {
    const nextBreakdown = { ...kpis.openBySource };
    for (const incident of changed) {
      const key = incident.sourceGroup === 'cost_alert' ? 'costAlert' : incident.source;
      if (!(key in nextBreakdown) || incident.status === status) continue;
      if (incident.status === 'resolved' && status !== 'resolved') nextBreakdown[key] += 1;
      if (incident.status !== 'resolved' && status === 'resolved') nextBreakdown[key] = Math.max(0, nextBreakdown[key] - 1);
    }
    kpis = { ...kpis, openBySource: nextBreakdown };
  }

  function applyTransition(ids, status) {
    const changed = incidents.filter((incident) => ids.includes(incident.id));
    updateSourceKpis(changed, status);
    const result = optimisticIncidentTransition({ incidents, ids, status, includeResolved, openCount: kpis.open });
    incidents = result.incidents;
    kpis = { ...kpis, open: result.openCount };
    if (status === 'resolved' && !includeResolved) {
      total = Math.max(0, total - changed.filter((incident) => incident.status !== 'resolved').length);
      selection = new Set([...selection].filter((id) => !ids.includes(id)));
    }
  }

  async function transitionIncident(incident, status) {
    setBusy([incident.id], true);
    try {
      await fetchJson(`/api/admin/incidents/${incident.source}/${encodeURIComponent(incident.sourceId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      applyTransition([incident.id], status);
      toast.success(status === 'resolved' ? 'Incident resolved.' : status === 'open' ? 'Incident reopened.' : 'Incident marked in progress.');
    } catch (err) {
      toast.error(err.message || 'Failed to update incident.');
    } finally {
      setBusy([incident.id], false);
    }
  }

  async function transitionSelected(status, { copied = false } = {}) {
    const targets = selected;
    if (targets.length === 0) return false;
    const ids = targets.map((incident) => incident.id);
    setBusy(ids, true);
    try {
      await fetchJson('/api/admin/incidents/bulk/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          incidents: targets.map(({ source, sourceId }) => ({ source, sourceId }))
        })
      });
      applyTransition(ids, status);
      toast.success(copied ? 'Copied for Codex and marked in progress.' : `${targets.length} incident${targets.length === 1 ? '' : 's'} resolved.`);
      bulkConfirmOpen = false;
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to update selected incidents.');
      return false;
    } finally {
      setBusy(ids, false);
    }
  }

  async function copyForCodex() {
    if (!codexPreview) return;
    try {
      await navigator.clipboard.writeText(codexPreview);
    } catch {
      toast.error('Could not write to the clipboard.');
      return;
    }
    await transitionSelected('in_progress', { copied: true });
  }

  function toggleSelection(id) {
    const next = new Set(selection);
    if (next.has(id)) next.delete(id); else next.add(id);
    selection = next;
  }

  function togglePageSelection() {
    const next = new Set(selection);
    if (allPageSelected) incidents.forEach((incident) => next.delete(incident.id));
    else incidents.forEach((incident) => next.add(incident.id));
    selection = next;
  }

  function applyFilters() { void fetchIncidents({ background: incidents.length > 0, resetPage: true }); }
  function changePage(next) { if (next >= 1 && next <= pageCount && next !== page) { page = next; void fetchIncidents({ background: true }); } }
  const sourceLabel = (incident) => incident.sourceGroup === 'cost_alert' ? 'Cost · Alert' : incident.source === 'job' ? 'Job' : 'Sentry';
  const sourceTone = (incident) => incident.source === 'sentry' ? 'info' : incident.source === 'job' ? 'destructive' : 'warning';
  const severityTone = (severity) => severity === 'critical' ? 'destructive' : severity === 'warning' ? 'warning' : 'info';
  const statusTone = (status) => status === 'resolved' ? 'success' : status === 'in_progress' ? 'info' : 'neutral';
  const formatStatus = (status) => status === 'in_progress' ? 'In Progress' : status === 'resolved' ? 'Resolved' : 'Open';
  const formatTime = (value) => value ? new Date(value).toLocaleString() : 'Unknown';
  const lastKnown = (entry) => entry?.lastSuccessfulAt ? formatTime(entry.lastSuccessfulAt) : refreshedAt ? formatTime(refreshedAt) : 'unknown';

  onMount(() => void fetchIncidents());
</script>

<section class="operations" aria-labelledby="operations-title">
  <header class="operations-header"><div><p>Admin Console</p><h2 id="operations-title">Operations</h2><span>Prioritize incidents, coordinate investigation, and inspect queue health.</span></div></header>

  <div class="kpi-grid" aria-label="Incident metrics">
    <Card variant="base" border="subtle" padding="md"><span>Open incidents</span><strong>{kpis.open}</strong></Card>
    <Card variant="base" border="subtle" padding="md"><span>Sentry</span><strong>{kpis.openBySource.sentry}</strong></Card>
    <Card variant="base" border="subtle" padding="md"><span>Job failures</span><strong>{kpis.openBySource.job}</strong></Card>
    <Card variant="base" border="subtle" padding="md"><span>Cost · Alert</span><strong>{kpis.openBySource.costAlert}</strong></Card>
  </div>

  <DataSurface title="Incident feed" description="Severity-first view across Sentry, failed jobs, cost anomalies, and admin alerts." tableMinWidth="1040px">
    <svelte:fragment slot="actions"><span class="freshness" aria-live="polite">Last checked {formatTime(refreshedAt)}</span><Button type="button" variant="secondary" size="sm" disabled={loading || refreshing} on:click={() => fetchIncidents({ background: incidents.length > 0, force: true })}>{refreshing ? 'Refreshing...' : 'Refresh'}</Button></svelte:fragment>
    <svelte:fragment slot="filters">
      <FieldShell className="filter-field" label="Source"><select aria-label="Incident source" bind:value={sourceFilter} on:change={applyFilters}>{#each sourceOptions as option}<option value={option.value}>{option.label}</option>{/each}</select></FieldShell>
      <FieldShell className="filter-field" label="Severity"><select aria-label="Incident severity" bind:value={severityFilter} on:change={applyFilters}>{#each severityOptions as severity}<option value={severity}>{severity === 'all' ? 'All severities' : severity}</option>{/each}</select></FieldShell>
      <label class="resolved-toggle"><input type="checkbox" bind:checked={includeResolved} on:change={applyFilters} /><span>Show resolved</span></label>
    </svelte:fragment>

    <svelte:fragment slot="panels">
      {#if degradedSources.length > 0}<div class="source-health" aria-live="polite">{#each degradedSources as [name, entry]}<p class:stale={entry.status === 'stale'}><strong>{name === 'costAlert' ? 'Cost · Alert' : name[0].toUpperCase() + name.slice(1)} {entry.status}.</strong> Last known {lastKnown(entry)}{entry.error ? ` — ${entry.error}` : ''}</p>{/each}</div>{/if}
      {#if selected.length > 0}<div class="codex-panel"><header><div><strong>Copy for Codex</strong><span>{selected.length} selected</span></div><div><Button type="button" variant="secondary" size="sm" on:click={() => (selection = new Set())}>Clear</Button><Button type="button" variant="primary" size="sm" disabled={busyIds.size > 0} on:click={copyForCodex}>Copy for Codex</Button></div></header><pre aria-label="Copy for Codex preview">{codexPreview}</pre></div>{/if}
    </svelte:fragment>

    <svelte:fragment slot="bulk">
      {#if selected.length > 0}<span class="selection-count">{selected.length} selected</span><Button type="button" variant="warning" size="sm" disabled={busyIds.size > 0} on:click={() => (bulkConfirmOpen = true)}>Resolve selected</Button>{/if}
    </svelte:fragment>

    <svelte:fragment slot="state">
      {#if loading && incidents.length === 0}<SectionState message="Loading incident sources..." />
      {:else if error}<SectionState error message={error} retry={() => fetchIncidents()} />
      {:else if incidents.length === 0}<SectionState message="No open incidents — systems healthy" />{/if}
    </svelte:fragment>

    <svelte:fragment slot="table">
      {#if !loading && !error && incidents.length > 0}
        <table class="ui-data-table"><thead><tr><th><input type="checkbox" aria-label="Select all incidents on this page" checked={allPageSelected} on:change={togglePageSelection} /></th><th>Source</th><th>Severity</th><th>Incident</th><th>Status</th><th>Timestamp</th><th>Actions</th></tr></thead>
          <tbody>{#each incidents as incident (incident.id)}<tr>
            <td><input type="checkbox" aria-label={`Select ${incident.title}`} checked={selection.has(incident.id)} on:change={() => toggleSelection(incident.id)} /></td>
            <td><Badge tone={sourceTone(incident)} size="xs">{sourceLabel(incident)}</Badge></td>
            <td><Badge tone={severityTone(incident.severity)} size="xs" uppercase>{incident.severity}</Badge></td>
            <td class="incident-copy"><strong>{incident.title}</strong><span>{incident.message}</span>{#if incident.permalink}<a href={incident.permalink} target="_blank" rel="noreferrer">Open in Sentry</a>{/if}</td>
            <td><Badge tone={statusTone(incident.status)} size="xs">{formatStatus(incident.status)}</Badge></td><td>{formatTime(incident.createdAt)}</td>
            <td class="row-actions">{#if incident.status === 'resolved'}<Button type="button" variant="secondary" size="sm" loading={busyIds.has(incident.id)} on:click={() => transitionIncident(incident, 'open')}>Reopen</Button>{:else}{#if incident.status === 'open'}<Button type="button" variant="ghost" size="sm" disabled={busyIds.has(incident.id)} on:click={() => transitionIncident(incident, 'in_progress')}>Acknowledge</Button>{/if}<Button type="button" variant="warning" size="sm" loading={busyIds.has(incident.id)} on:click={() => transitionIncident(incident, 'resolved')}>Resolve</Button>{/if}</td>
          </tr>{/each}</tbody>
        </table>
        <div class="pagination"><p>Showing {pageStart}-{pageEnd} of {total} incidents</p><div><Button type="button" variant="secondary" size="sm" disabled={page <= 1 || refreshing} on:click={() => changePage(page - 1)}>Previous</Button><span>Page {page} of {pageCount}</span><Button type="button" variant="secondary" size="sm" disabled={page >= pageCount || refreshing} on:click={() => changePage(page + 1)}>Next</Button></div></div>
      {/if}
    </svelte:fragment>
  </DataSurface>

  <div class="jobs-disclosure"><div><div><p>Worker operations</p><h3>Jobs &amp; Queue inspector</h3></div><Button type="button" variant="secondary" size="sm" aria-expanded={jobsOpen} on:click={() => (jobsOpen = !jobsOpen)}>{jobsOpen ? 'Hide inspector' : 'Show inspector'}</Button></div>{#if jobsOpen}<JobsQueueInspector on:jobretry={() => fetchIncidents({ background: incidents.length > 0 })} />{/if}</div>
</section>

<ConfirmModal open={bulkConfirmOpen} title="Resolve selected incidents?" description="This will hide them from the default feed. You can reveal and reopen them later." confirmLabel="Resolve incidents" severity="warning" busy={busyIds.size > 0} on:cancel={() => (bulkConfirmOpen = false)} on:confirm={() => transitionSelected('resolved')} />

<style>
  .operations { display: grid; gap: var(--ui-space-4); min-width: 0; }.operations-header > div { display: grid; gap: var(--ui-space-1); }.operations-header p, .operations-header h2, .operations-header span { margin: 0; }.operations-header p, .jobs-disclosure > div > div p { color: var(--ui-text-muted); font-size: var(--ui-type-label); font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }.operations-header h2 { color: var(--ui-text-primary); font-size: var(--ui-type-title-lg); }.operations-header span { color: var(--ui-text-secondary); font-size: var(--ui-type-body-sm); }
  .kpi-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: var(--ui-space-3); }.kpi-grid :global(.ui-card) { display: grid; gap: var(--ui-space-1); }.kpi-grid span, .freshness, .selection-count { color: var(--ui-text-muted); font-size: var(--ui-type-label); }.kpi-grid strong { color: var(--ui-text-primary); font-size: clamp(1.4rem,3vw,2rem); }
  .resolved-toggle { display: inline-flex; align-items: center; gap: var(--ui-space-2); min-height: 2.5rem; color: var(--ui-text-secondary); font-size: var(--ui-type-body-sm); cursor: pointer; }.resolved-toggle input, table input { width: 1rem; height: 1rem; accent-color: var(--ui-accent-info); }
  .source-health { display: grid; gap: var(--ui-space-2); }.source-health p { margin: 0; padding: var(--ui-space-2) var(--ui-space-3); border: 1px solid color-mix(in srgb,var(--ui-accent-danger) 28%,var(--ui-border-default)); border-radius: var(--ui-radius-sm); background: color-mix(in srgb,var(--ui-accent-danger) 7%,transparent); color: var(--ui-text-secondary); font-size: var(--ui-type-body-sm); }.source-health p.stale { border-color: color-mix(in srgb,var(--ui-accent-warning) 32%,var(--ui-border-default)); background: color-mix(in srgb,var(--ui-accent-warning) 8%,transparent); }
  .codex-panel { display: grid; gap: var(--ui-space-2); padding: var(--ui-space-3); border: 1px solid var(--ui-border-default); border-radius: var(--ui-radius-md); background: var(--ui-surface-secondary); }.codex-panel header, .codex-panel header > div { display: flex; align-items: center; justify-content: space-between; gap: var(--ui-space-2); }.codex-panel header > div:first-child { display: grid; justify-items: start; }.codex-panel pre { max-height: 16rem; margin: 0; padding: var(--ui-space-3); overflow: auto; border-radius: var(--ui-radius-sm); background: var(--ui-surface-input); color: var(--ui-text-primary); white-space: pre-wrap; overflow-wrap: anywhere; font: 0.78rem/1.5 var(--font-family-mono); }
  .incident-copy { min-width: 20rem; max-width: 36rem; }.incident-copy span, .incident-copy a { display: block; margin-top: .25rem; }.incident-copy span { color: var(--ui-text-secondary); overflow-wrap: anywhere; }.incident-copy a { width: fit-content; color: var(--ui-accent-info); text-decoration: underline; }.row-actions { display: flex; gap: var(--ui-space-2); min-width: 13rem; }.pagination, .pagination > div { display: flex; align-items: center; justify-content: space-between; gap: var(--ui-space-2); }.pagination { padding-top: var(--ui-space-3); }.pagination p, .pagination span { margin: 0; color: var(--ui-text-secondary); font-size: var(--ui-type-body-sm); }
  .jobs-disclosure { display: grid; gap: var(--ui-space-3); }.jobs-disclosure > div:first-child { display: flex; align-items: center; justify-content: space-between; gap: var(--ui-space-3); padding: var(--ui-space-3) var(--ui-space-4); border: 1px solid var(--ui-border-default); border-radius: var(--ui-radius-md); background: var(--ui-surface-secondary); }.jobs-disclosure h3, .jobs-disclosure p { margin: 0; }.jobs-disclosure h3 { font-size: var(--ui-type-title-sm); }
  select, select option { background-color: var(--ui-surface-input); color: var(--ui-text-primary); }select:focus-visible, input:focus-visible { border-color: var(--ui-border-focus); box-shadow: var(--ui-focus-ring-strong); }
  @media (max-width: 900px) { .kpi-grid { grid-template-columns: 1fr 1fr; }.pagination { align-items: stretch; flex-direction: column; }.codex-panel header { align-items: stretch; flex-direction: column; }.jobs-disclosure > div:first-child { align-items: stretch; flex-direction: column; } }
  @media (max-width: 560px) { .kpi-grid { grid-template-columns: 1fr; } }
</style>
