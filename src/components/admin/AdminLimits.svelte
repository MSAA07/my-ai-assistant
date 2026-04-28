<script>
  import { onMount } from 'svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import { API_BASE } from '../../config.js';

  const USD_TO_SAR = 3.75;

  let loading = true;
  let saving = false;
  let previewing = false;
  let error = '';
  let message = '';
  let caps = [];
  let activeCap = null;
  let impact = null;
  let form = {
    documentCap: '',
    costCapUsd: '',
    tokenCap: '',
    reason: ''
  };

  $: freeCap = caps.find((cap) => cap.plan === 'free') || activeCap;
  $: currentCost = freeCap?.costCapUsd ?? null;
  $: proposedCost = parseNullableNumber(form.costCapUsd);
  $: proposedDocumentCap = parseNullableInteger(form.documentCap);
  $: proposedTokenCap = parseNullableInteger(form.tokenCap);
  $: lowering = Boolean(
    freeCap && (
      isLowering(proposedDocumentCap, freeCap.documentCap)
      || isLowering(proposedCost, currentCost)
      || isLowering(proposedTokenCap, freeCap.tokenCap)
    )
  );
  $: impactedOverLimit = Boolean(
    impact && (
      impact.overLimit?.documents > 0
      || impact.overLimit?.costUsd > 0
      || impact.overLimit?.tokens > 0
    )
  );

  function parseNullableInteger(value) {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
  }

  function parseNullableNumber(value) {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }

  function isLowering(nextValue, currentValue) {
    if (nextValue === null || currentValue === null || currentValue === undefined) return false;
    return Number(nextValue) < Number(currentValue);
  }

  function formatUsd(value) {
    return value === null || value === undefined ? 'Unlimited' : `$${Number(value || 0).toFixed(4)}`;
  }

  function formatSar(value) {
    return value === null || value === undefined ? 'Unlimited' : `${(Number(value || 0) * USD_TO_SAR).toFixed(2)} SAR`;
  }

  function formatNumber(value) {
    return value === null || value === undefined ? 'Unlimited' : Number(value || 0).toLocaleString();
  }

  function hydrateForm(cap) {
    activeCap = cap;
    form = {
      documentCap: cap?.documentCap ?? '',
      costCapUsd: cap?.costCapUsd ?? '',
      tokenCap: cap?.tokenCap ?? '',
      reason: ''
    };
    impact = null;
  }

  async function fetchJson(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  async function fetchCaps() {
    loading = true;
    error = '';

    try {
      const data = await fetchJson('/api/admin/caps/defaults');
      caps = data.caps || [];
      hydrateForm(caps.find((cap) => cap.plan === 'free') || null);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function buildPayload() {
    return {
      documentCap: form.documentCap === '' ? null : Number(form.documentCap),
      costCapUsd: form.costCapUsd === '' ? null : Number(form.costCapUsd),
      tokenCap: form.tokenCap === '' ? null : Number(form.tokenCap),
      reason: form.reason.trim() || null
    };
  }

  async function previewImpact() {
    previewing = true;
    error = '';
    message = '';

    try {
      const data = await fetchJson('/api/admin/caps/defaults/free/impact', {
        method: 'POST',
        body: JSON.stringify(buildPayload())
      });
      impact = data.impact;
      message = 'Impact preview refreshed.';
    } catch (err) {
      error = err.message;
    } finally {
      previewing = false;
    }
  }

  async function saveCaps() {
    error = '';
    message = '';

    if ((lowering || impactedOverLimit) && !form.reason.trim()) {
      error = 'Add a reason before lowering caps or saving a change that leaves users over cap.';
      return;
    }

    if (lowering || impactedOverLimit) {
      const warning = [
        'Save lower global caps?',
        impact ? `${impact.overLimit?.documents || 0} users over document cap, ${impact.overLimit?.costUsd || 0} users over cost cap.` : '',
        'This is audited.'
      ].filter(Boolean).join('\n');
      if (!confirm(warning)) return;
    }

    saving = true;

    try {
      const data = await fetchJson('/api/admin/caps/defaults/free', {
        method: 'PATCH',
        body: JSON.stringify(buildPayload())
      });
      const updated = data.cap;
      caps = caps.map((cap) => (cap.plan === updated.plan ? updated : cap));
      if (!caps.some((cap) => cap.plan === updated.plan)) caps = [...caps, updated];
      hydrateForm(updated);
      impact = data.impact;
      message = 'Global normal-user caps saved.';
    } catch (err) {
      error = err.message;
    } finally {
      saving = false;
    }
  }

  onMount(fetchCaps);
</script>

<div class="limits-page">
  <DataSurface title="Global Limits" description="Normal-user caps used for dynamic remaining allowance." tableMinWidth="780px">
    <Button slot="actions" type="button" variant="secondary" size="sm" on:click={fetchCaps} disabled={loading || saving}>
      Refresh
    </Button>

    <svelte:fragment slot="panels">
      {#if freeCap}
        <div class="metric-grid">
          <div><span>Document Cap</span><strong>{formatNumber(freeCap.documentCap)}</strong></div>
          <div><span>USD Cost Cap</span><strong>{formatUsd(freeCap.costCapUsd)}</strong></div>
          <div><span>SAR Approx.</span><strong>{formatSar(freeCap.costCapUsd)}</strong></div>
          <div><span>Token Cap</span><strong>{formatNumber(freeCap.tokenCap)}</strong></div>
          <div><span>Last Updated</span><strong>{freeCap.updatedAt ? new Date(freeCap.updatedAt).toLocaleString() : '-'}</strong></div>
          <div><span>Updated By</span><strong>{freeCap.updatedBy || '-'}</strong></div>
        </div>
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="state">
      {#if loading}
        <p class="ui-data-state-note">Loading cap settings...</p>
      {:else if error}
        <Card class="ui-data-state-error" variant="soft" border="strong" padding="sm">{error}</Card>
      {:else if message}
        <p class="ui-data-state-note">{message}</p>
      {/if}
    </svelte:fragment>
  </DataSurface>

  <Card class="limit-editor" variant="base" padding="md">
    <header class="card-header">
      <h3>Edit Normal-User Caps</h3>
      {#if lowering}
        <Badge tone="warning" size="sm">Lowering cap</Badge>
      {/if}
    </header>

    <div class="field-grid">
      <FieldShell label="Document Cap" forId="global-document-cap">
        <input id="global-document-cap" type="number" min="0" bind:value={form.documentCap} />
      </FieldShell>
      <FieldShell label="USD Cost Cap" forId="global-cost-cap">
        <input id="global-cost-cap" type="number" min="0" step="0.0001" bind:value={form.costCapUsd} />
      </FieldShell>
      <FieldShell label="Token Cap" forId="global-token-cap">
        <input id="global-token-cap" type="number" min="0" bind:value={form.tokenCap} placeholder="Unlimited" />
      </FieldShell>
      <FieldShell label="Reason" forId="global-limit-reason">
        <textarea id="global-limit-reason" rows="3" bind:value={form.reason} placeholder="Required when lowering caps or putting users over cap"></textarea>
      </FieldShell>
    </div>

    <div class="actions">
      <Button type="button" variant="secondary" size="sm" on:click={previewImpact} disabled={previewing || saving}>
        {previewing ? 'Previewing...' : 'Preview Impact'}
      </Button>
      <Button type="button" variant="primary" size="sm" on:click={saveCaps} disabled={saving || loading}>
        {saving ? 'Saving...' : 'Save Caps'}
      </Button>
    </div>
  </Card>

  {#if impact}
    <DataSurface title="Impact Preview" description="Users at or above the proposed effective cap." tableMinWidth="760px">
      <svelte:fragment slot="panels">
        <div class="metric-grid impact-grid">
          <div><span>Users Checked</span><strong>{formatNumber(impact.userCount)}</strong></div>
          <div><span>Over Documents</span><strong>{formatNumber(impact.overLimit?.documents)}</strong></div>
          <div><span>Over Cost</span><strong>{formatNumber(impact.overLimit?.costUsd)}</strong></div>
          <div><span>Over Tokens</span><strong>{formatNumber(impact.overLimit?.tokens)}</strong></div>
        </div>
      </svelte:fragment>
      <svelte:fragment slot="table">
        {#if impactedOverLimit}
          <table class="ui-data-table">
            <thead>
              <tr>
                <th>Area</th>
                <th>User</th>
                <th>Consumed</th>
                <th>Cap</th>
                <th>Override</th>
              </tr>
            </thead>
            <tbody>
              {#each ['documents', 'costUsd', 'tokens'] as area}
                {#each impact.samples?.[area] || [] as user}
                  <tr>
                    <td><strong>{area}</strong></td>
                    <td>{user.email || user.id}</td>
                    <td>{area === 'costUsd' ? formatUsd(user.consumed) : formatNumber(user.consumed)}</td>
                    <td>{area === 'costUsd' ? formatUsd(user.cap) : formatNumber(user.cap)}</td>
                    <td>{user.override ? 'Yes' : 'No'}</td>
                  </tr>
                {/each}
              {/each}
            </tbody>
          </table>
        {:else}
          <p class="ui-data-state-note">No sampled users are over the proposed effective caps.</p>
        {/if}
      </svelte:fragment>
    </DataSurface>
  {/if}
</div>

<style>
  .limits-page,
  .field-grid {
    display: grid;
    gap: var(--ui-space-4);
    min-width: 0;
  }

  .metric-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--ui-space-3);
  }

  .metric-grid div {
    display: grid;
    gap: 0.18rem;
    min-width: 0;
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-sm);
    background: var(--ui-surface-secondary);
    padding: var(--ui-space-3);
  }

  .metric-grid span {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-body-xs);
  }

  .metric-grid strong {
    color: var(--ui-text-primary);
    font-size: var(--ui-type-title-sm);
    word-break: break-word;
  }

  .card-header,
  .actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-space-3);
    flex-wrap: wrap;
  }

  h3 {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: var(--ui-type-title-sm);
  }

  textarea {
    resize: vertical;
  }

  @media (max-width: 760px) {
    .metric-grid {
      grid-template-columns: 1fr;
    }

    .actions :global(.ui-button) {
      width: 100%;
    }
  }
</style>
