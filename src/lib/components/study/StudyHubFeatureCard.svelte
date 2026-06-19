<script>
  import Button from '../ui/Button.svelte';
  import ProgressBar from '../ui/ProgressBar.svelte';
  import StudyActionCard from '../ui/StudyActionCard.svelte';
  import { Sparkles } from '@lucide/svelte';

  export let card = {};
  export let icon;
  export let onPrimaryAction = () => {};

  $: Icon = icon;
  $: resolvedCard = {
    title: '',
    status: 'not_generated',
    stateLabel: '',
    description: '',
    statusCopy: '',
    primaryMetric: '',
    secondaryMetric: '',
    tertiaryMetric: '',
    completedCount: 0,
    totalCount: 0,
    progressLabel: '',
    canPrimaryAction: false,
    primaryLabel: '',
    ...card,
  };
</script>

<StudyActionCard class="study-hub-feature-card" title={resolvedCard.title} status={resolvedCard.status} statusLabel={resolvedCard.stateLabel}>
  <svelte:fragment slot="icon">
    {#if Icon}
      <svelte:component this={Icon} />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="description">
    {#if resolvedCard.status === 'not_generated'}
      <p>{resolvedCard.description}</p>
    {:else if resolvedCard.status !== 'complete'}
      <p>{resolvedCard.statusCopy}</p>
    {/if}
  </svelte:fragment>

  {#if resolvedCard.status === 'complete'}
    <div class="study-hub-feature-card__metrics">
      {#if resolvedCard.primaryMetric}<p class="study-hub-feature-card__primary-metric">{resolvedCard.primaryMetric}</p>{/if}
      {#if resolvedCard.totalCount > 0 && resolvedCard.progressLabel}
        <ProgressBar
          value={resolvedCard.completedCount}
          max={resolvedCard.totalCount}
          ariaLabel={resolvedCard.progressLabel}
          className="study-hub-feature-card__progress"
        />
      {/if}
      {#if resolvedCard.secondaryMetric}<p>{resolvedCard.secondaryMetric}</p>{/if}
      {#if resolvedCard.tertiaryMetric}<p>{resolvedCard.tertiaryMetric}</p>{/if}
    </div>
  {/if}

  <div slot="actions" class="study-hub-feature-card__actions">
    <Button
      type="button"
      variant={resolvedCard.status === 'complete' ? 'primary' : 'secondary'}
      className="study-hub-feature-card__button"
      on:click={() => onPrimaryAction(resolvedCard)}
      disabled={!resolvedCard.canPrimaryAction}
    >
      <span slot="icon" aria-hidden="true"><Sparkles /></span>
      {resolvedCard.primaryLabel}
    </Button>
  </div>
</StudyActionCard>

<style>
  :global(.study-hub-feature-card) {
    min-height: 0;
  }

  .study-hub-feature-card__metrics {
    display: grid;
    gap: var(--ui-space-2);
    color: var(--ui-text-secondary);
    font-size: var(--font-size-sm);
    line-height: 1.4;
  }

  .study-hub-feature-card__metrics p {
    margin: 0;
  }

  .study-hub-feature-card__primary-metric {
    color: var(--ui-text-primary);
    font-size: 1rem;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
  }

  :global(.study-hub-feature-card__progress.ui-progress) {
    --progress-height: 0.25rem;
  }

  :global(.study-hub-feature-card__button) {
    width: 100%;
    --button-shadow: none;
  }

  :global(.study-hub-feature-card__button .ui-button__icon svg) {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

</style>
