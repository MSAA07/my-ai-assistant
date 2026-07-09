<script>
  import { onDestroy, onMount } from 'svelte';
  import Badge from '../../lib/components/ui/Badge.svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';
  import FieldShell from '../../lib/components/ui/FieldShell.svelte';
  import { API_BASE } from '../../config.js';

  export let onDirtyChange = () => {};

  const features = [
    { id: 'summary', label: 'Summary' },
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'exam', label: 'Exam' }
  ];
  const plans = [
    { id: 'free', label: 'Free' },
    { id: 'premium', label: 'Premium' }
  ];
  const reasoningEfforts = ['none', 'low', 'medium', 'high', 'xhigh'];
  const modelCosts = {
    'gpt-4.1-nano': '$',
    'gpt-4o-mini': '$',
    'gpt-4.1-mini': '$',
    'gpt-5.4-nano': '$',
    'gpt-4.1': '$$',
    'gpt-4o': '$$',
    'gpt-5.4-mini': '$$',
    'gpt-5.4': '$$$',
    'gpt-5.5': '$$$$'
  };

  let loading = true;
  let error = '';
  let configs = [];
  let allowedModels = [];
  let drafts = {};
  let cellState = {};
  let lastDirtyState = null;

  $: allowedModelById = new Map(allowedModels.map((model) => [model.id, model]));
  $: hasDirtyCells = Object.values(drafts).some((draft) => isDirty(draft));
  $: if (hasDirtyCells !== lastDirtyState) {
    lastDirtyState = hasDirtyCells;
    onDirtyChange(Boolean(hasDirtyCells));
  }

  function cellKey(feature, plan) {
    return `${feature}:${plan}`;
  }

  function createDraft(config) {
    return {
      id: config.id,
      feature: config.feature,
      plan: config.plan,
      model: config.model,
      reasoningEffort: config.reasoningEffort ?? null,
      savedModel: config.model,
      savedReasoningEffort: config.reasoningEffort ?? null,
      updatedAt: config.updatedAt || null,
      updatedByAdminId: config.updatedByAdminId || null
    };
  }

  function hydrateDrafts(nextConfigs) {
    const nextDrafts = {};
    const nextState = {};
    for (const config of nextConfigs) {
      const key = cellKey(config.feature, config.plan);
      nextDrafts[key] = createDraft(config);
      nextState[key] = { saving: false, saved: false, error: '' };
    }
    drafts = nextDrafts;
    cellState = nextState;
  }

  function isDirty(draft) {
    if (!draft) return false;
    return draft.model !== draft.savedModel
      || (draft.reasoningEffort ?? null) !== (draft.savedReasoningEffort ?? null);
  }

  function getDraft(feature, plan) {
    return drafts[cellKey(feature, plan)] || null;
  }

  function getCellState(feature, plan) {
    return cellState[cellKey(feature, plan)] || { saving: false, saved: false, error: '' };
  }

  function supportsReasoning(modelId) {
    return Boolean(allowedModelById.get(modelId)?.supportsReasoningEffort);
  }

  function optionLabel(model) {
    const cost = modelCosts[model.id] || '';
    return `${model.label}${cost ? ` - ${cost}` : ''}`;
  }

  function formatDate(value) {
    return value ? new Date(value).toLocaleString() : '-';
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

  async function fetchModelRouting() {
    if (!loading && hasDirtyCells && !confirm('Discard unsaved model routing changes and refresh?')) {
      return;
    }

    loading = true;
    error = '';

    try {
      const data = await fetchJson('/api/admin/model-routing');
      configs = data.configs || [];
      allowedModels = data.allowedModels || [];
      hydrateDrafts(configs);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function updateDraft(feature, plan, patch) {
    const key = cellKey(feature, plan);
    const current = drafts[key];
    if (!current) return;
    const next = { ...current, ...patch };
    if (patch.model !== undefined && !supportsReasoning(patch.model)) {
      next.reasoningEffort = null;
    }
    drafts = { ...drafts, [key]: next };
    cellState = {
      ...cellState,
      [key]: { ...(cellState[key] || {}), saved: false, error: '' }
    };
  }

  async function saveCell(feature, plan) {
    const key = cellKey(feature, plan);
    const draft = drafts[key];
    if (!draft || !isDirty(draft)) return;

    cellState = {
      ...cellState,
      [key]: { ...(cellState[key] || {}), saving: true, saved: false, error: '' }
    };

    try {
      const updated = await fetchJson(`/api/admin/model-routing/${feature}/${plan}`, {
        method: 'PATCH',
        body: JSON.stringify({
          model: draft.model,
          reasoningEffort: draft.reasoningEffort ?? null
        })
      });
      drafts = {
        ...drafts,
        [key]: createDraft(updated)
      };
      cellState = {
        ...cellState,
        [key]: { saving: false, saved: true, error: '' }
      };
      window.setTimeout(() => {
        const current = cellState[key];
        if (current?.saved) {
          cellState = {
            ...cellState,
            [key]: { ...current, saved: false }
          };
        }
      }, 2200);
    } catch (err) {
      cellState = {
        ...cellState,
        [key]: { saving: false, saved: false, error: err.message }
      };
    }
  }

  function handleBeforeUnload(event) {
    if (!hasDirtyCells) return;
    event.preventDefault();
    event.returnValue = '';
  }

  onMount(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    void fetchModelRouting();
  });

  onDestroy(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    onDirtyChange(false);
  });
</script>

<div class="model-routing-page">
  <DataSurface title="Model Routing" description="Admin-controlled model selection by feature and plan." tableMinWidth="920px">
    <Button slot="actions" type="button" variant="secondary" size="sm" on:click={fetchModelRouting} disabled={loading}>
      Refresh
    </Button>

    <svelte:fragment slot="state">
      {#if loading}
        <p class="ui-data-state-note">Loading model routing...</p>
      {:else if error}
        <Card class="ui-data-state-error" variant="soft" border="strong" padding="sm">
          <div class="retry-state">
            <span>{error}</span>
            <Button type="button" variant="secondary" size="sm" on:click={fetchModelRouting}>
              Retry
            </Button>
          </div>
        </Card>
      {:else if configs.length === 0}
        <p class="ui-data-state-note">No model routing rows are configured.</p>
      {/if}
    </svelte:fragment>
  </DataSurface>

  {#if !loading && !error}
    <div class="feature-grid">
      {#each features as feature}
        <DataSurface title={feature.label} description={`${feature.label} generation routing for normal and premium users.`} tableMinWidth="720px" compact>
          <svelte:fragment slot="panels">
            <div class="plan-grid">
              {#each plans as plan}
                {@const draft = getDraft(feature.id, plan.id)}
                {@const state = getCellState(feature.id, plan.id)}
                <Card class="routing-cell" variant="base" border={isDirty(draft) ? 'strong' : 'subtle'} padding="md">
                  <header class="cell-header">
                    <div>
                      <h3>{plan.label}</h3>
                      <p>{draft?.updatedAt ? `Updated ${formatDate(draft.updatedAt)}` : 'Not seeded'}</p>
                    </div>
                    {#if state.saved}
                      <Badge tone="success" size="xs" uppercase>Saved</Badge>
                    {:else if isDirty(draft)}
                      <Badge tone="warning" size="xs" uppercase>Unsaved</Badge>
                    {/if}
                  </header>

                  {#if draft}
                    <div class="field-stack">
                      <FieldShell label="Model" forId={`model-${feature.id}-${plan.id}`}>
                        <select
                          id={`model-${feature.id}-${plan.id}`}
                          value={draft.model}
                          on:input={(event) => updateDraft(feature.id, plan.id, { model: event.currentTarget.value })}
                          on:change={(event) => updateDraft(feature.id, plan.id, { model: event.currentTarget.value })}
                          on:blur={(event) => updateDraft(feature.id, plan.id, { model: event.currentTarget.value })}
                        >
                          {#each allowedModels as model}
                            <option value={model.id}>{optionLabel(model)}</option>
                          {/each}
                        </select>
                      </FieldShell>

                      {#if supportsReasoning(draft.model)}
                        <FieldShell label="Reasoning Effort" forId={`reasoning-${feature.id}-${plan.id}`}>
                          <select
                            id={`reasoning-${feature.id}-${plan.id}`}
                            value={draft.reasoningEffort ?? ''}
                            on:input={(event) => updateDraft(feature.id, plan.id, { reasoningEffort: event.currentTarget.value || null })}
                            on:change={(event) => updateDraft(feature.id, plan.id, { reasoningEffort: event.currentTarget.value || null })}
                            on:blur={(event) => updateDraft(feature.id, plan.id, { reasoningEffort: event.currentTarget.value || null })}
                          >
                            <option value="">None</option>
                            {#each reasoningEfforts as effort}
                              <option value={effort}>{effort}</option>
                            {/each}
                          </select>
                        </FieldShell>
                      {/if}
                    </div>

                    {#if state.error}
                      <p class="cell-error">{state.error}</p>
                    {/if}

                    <div class="cell-actions">
                      <span class="saved-state">
                        Saved: {draft.savedModel}{draft.savedReasoningEffort ? ` / ${draft.savedReasoningEffort}` : ''}
                      </span>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        loading={state.saving}
                        disabled={!isDirty(draft) || state.saving}
                        on:click={() => saveCell(feature.id, plan.id)}
                      >
                        {state.saving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  {:else}
                    <p class="ui-data-state-note">Missing {feature.label} {plan.label} routing row.</p>
                  {/if}
                </Card>
              {/each}
            </div>
          </svelte:fragment>
        </DataSurface>
      {/each}
    </div>
  {/if}
</div>

<style>
  .model-routing-page,
  .feature-grid {
    display: grid;
    gap: var(--ui-space-4);
    min-width: 0;
  }

  .retry-state,
  .cell-header,
  .cell-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-space-3);
    flex-wrap: wrap;
  }

  .plan-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--ui-space-3);
  }

  :global(.routing-cell) {
    gap: var(--ui-space-3);
  }

  .cell-header h3 {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: var(--ui-type-title-sm);
    font-weight: 600;
  }

  .cell-header p,
  .saved-state {
    margin: 0;
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
  }

  .field-stack {
    display: grid;
    gap: var(--ui-space-3);
  }

  .cell-error {
    margin: 0;
    color: color-mix(in srgb, var(--ui-accent-danger) 78%, var(--ui-text-primary) 22%);
    border: 1px solid color-mix(in srgb, var(--ui-accent-danger) 34%, var(--ui-border-default) 66%);
    border-radius: var(--ui-radius-sm);
    background: color-mix(in srgb, var(--ui-accent-danger) 9%, transparent);
    padding: var(--ui-space-2) var(--ui-space-3);
    font-size: var(--ui-type-body-sm);
  }

  @media (max-width: 820px) {
    .plan-grid {
      grid-template-columns: 1fr;
    }

    .cell-actions :global(.ui-button),
    .retry-state :global(.ui-button) {
      width: 100%;
    }
  }
</style>
