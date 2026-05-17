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
    stateTone: 'info',
    stateLabel: '',
    description: '',
    statusCopy: '',
    errorMessage: '',
    progressVisible: false,
    phase: 'not_requested',
    loadingLabel: '',
    progressText: '',
    progressValue: 0,
    progressIndeterminate: false,
    canPrimaryAction: false,
    primaryLabel: '',
    ...card,
  };
</script>

<StudyActionCard class="study-hub-feature-card" title={resolvedCard.title} status={resolvedCard.stateTone} statusLabel={resolvedCard.stateLabel}>
  <svelte:fragment slot="icon">
    {#if Icon}
      <svelte:component this={Icon} />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="description">
    <p>{resolvedCard.description}</p>
    <p class="study-hub-feature-card__support-copy">{resolvedCard.statusCopy}</p>
    {#if resolvedCard.errorMessage}<p class="study-hub-feature-card__error">{resolvedCard.errorMessage}</p>{/if}
  </svelte:fragment>

  <div slot="actions" class="study-hub-feature-card__actions">
    {#if resolvedCard.progressVisible}
      <div
        class={`study-hub-feature-card__loading study-hub-feature-card__loading--${resolvedCard.phase}`.trim()}
        role="status"
        aria-live="polite"
        aria-label={`${resolvedCard.title} ${resolvedCard.loadingLabel}`}
      >
        <div class="study-hub-feature-card__loading-meta">
          <span class="study-hub-feature-card__loading-label">{resolvedCard.loadingLabel}</span>
          {#if resolvedCard.progressText}
            <span class="study-hub-feature-card__loading-value">{resolvedCard.progressText}</span>
          {/if}
        </div>
        <ProgressBar
          value={resolvedCard.progressValue}
          max={100}
          indeterminate={resolvedCard.progressIndeterminate}
          ariaLabel={`${resolvedCard.title} ${resolvedCard.loadingLabel}`}
          className="study-hub-feature-card__loading-bar"
        />
      </div>
    {:else}
      <Button
        type="button"
        variant={resolvedCard.phase === 'ready' ? 'primary' : 'secondary'}
        className="study-hub-feature-card__button"
        on:click={() => onPrimaryAction(resolvedCard)}
        disabled={!resolvedCard.canPrimaryAction}
      >
        <span slot="icon" aria-hidden="true"><Sparkles /></span>
        {resolvedCard.primaryLabel}
      </Button>
    {/if}
  </div>
</StudyActionCard>

<style>
  :global(.study-hub-feature-card) {
    min-height: 0;
  }

  .study-hub-feature-card__support-copy {
    margin: 0;
    margin-top: 0.35rem;
    color: var(--ui-text-secondary);
    line-height: 1.5;
    font-size: 0.8125rem;
  }

  .study-hub-feature-card__error {
    margin: 0;
    margin-top: 0.35rem;
    color: var(--destructive);
    font-size: 0.8125rem;
    line-height: 1.5;
  }

  .study-hub-feature-card__actions {
    position: relative;
    z-index: 1;
  }

  .study-hub-feature-card__loading {
    display: grid;
    gap: 0.5rem;
    min-height: var(--ui-control-height-md);
    padding: 0.8rem 0.9rem;
    border-radius: var(--ui-radius-sm);
    border: 1px solid color-mix(in srgb, var(--ui-text-primary) 12%, var(--ui-border-default) 88%);
    background: color-mix(in srgb, var(--ui-surface-secondary) 82%, black 18%);
    color: var(--ui-text-primary);
    box-shadow: none;
    --ui-progress-track: color-mix(in srgb, var(--ui-surface-secondary) 74%, black 26%);
    --ui-progress-fill: linear-gradient(90deg, rgba(255,255,255,.96), rgba(209,213,219,.82), rgba(255,255,255,.96));
    animation: study-hub-feature-card-pulse 1.4s ease-in-out infinite;
  }

  .study-hub-feature-card__loading-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    min-width: 0;
  }

  .study-hub-feature-card__loading-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: inherit;
    font-size: 0.8125rem;
    font-weight: 650;
    line-height: 1.4;
  }

  .study-hub-feature-card__loading-value {
    color: var(--ui-text-primary);
    font-size: 0.82rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    direction: ltr;
    unicode-bidi: plaintext;
  }

  :global(.study-hub-feature-card__loading-bar.ui-progress) {
    --progress-height: 0.36rem;
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

  @keyframes study-hub-feature-card-pulse {
    0%, 100% {
      border-color: color-mix(in srgb, var(--ui-text-primary) 10%, var(--ui-border-default) 90%);
      background: color-mix(in srgb, var(--ui-surface-secondary) 82%, black 18%);
    }

    50% {
      border-color: color-mix(in srgb, var(--ui-text-primary) 16%, var(--ui-border-default) 84%);
      background: color-mix(in srgb, var(--ui-surface-secondary) 88%, black 12%);
    }
  }

  :global(html[dir='rtl']) .study-hub-feature-card__loading-meta {
    align-items: flex-start;
  }

  @media (max-width: 640px) {
    .study-hub-feature-card__loading-meta {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
