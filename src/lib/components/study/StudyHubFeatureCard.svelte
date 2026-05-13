<script>
  import Button from '../ui/Button.svelte';
  import ProgressBar from '../ui/ProgressBar.svelte';
  import StudyActionCard from '../ui/StudyActionCard.svelte';
  import { Play, Sparkles } from '@lucide/svelte';

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
    details: {
      empty: true,
      emptyLabel: '',
      items: [],
      score: null,
    },
    ...card,
  };
</script>

<StudyActionCard class={`study-hub-feature-card study-hub-feature-card--${resolvedCard.key || 'feature'}`.trim()} title={resolvedCard.title} status={resolvedCard.stateTone} statusLabel={resolvedCard.stateLabel}>
  <svelte:fragment slot="icon">
    {#if Icon}
      <svelte:component this={Icon} />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="description">
    {#if resolvedCard.details?.empty}
      <p class="study-hub-feature-card__empty">{resolvedCard.details.emptyLabel || resolvedCard.statusCopy || resolvedCard.description}</p>
    {:else}
      <dl class="study-hub-feature-card__details">
        {#each resolvedCard.details?.items ?? [] as item}
          <div class="study-hub-feature-card__detail">
            <dt aria-hidden="true"></dt>
            <dd>{item.label}</dd>
          </div>
        {/each}
      </dl>
      {#if resolvedCard.details?.score}
        <div class="study-hub-feature-card__score">
          <div class="study-hub-feature-card__score-meta">
            <span>{resolvedCard.details.score.label}</span>
            <strong>{resolvedCard.details.score.value}%</strong>
          </div>
          <ProgressBar
            value={resolvedCard.details.score.percent}
            max={100}
            ariaLabel={`${resolvedCard.title} ${resolvedCard.details.score.label}`}
            className="study-hub-feature-card__score-bar"
          />
        </div>
      {/if}
    {/if}
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
        variant="secondary"
        className="study-hub-feature-card__button"
        on:click={() => onPrimaryAction(resolvedCard)}
        disabled={!resolvedCard.canPrimaryAction}
      >
        <span slot="icon" aria-hidden="true">
          {#if resolvedCard.phase === 'ready'}
            <Play />
          {:else}
            <Sparkles />
          {/if}
        </span>
        {resolvedCard.primaryLabel}
      </Button>
    {/if}
  </div>
</StudyActionCard>

<style>
  :global(.study-hub-feature-card) {
    min-height: 17.35rem;
    border-color: color-mix(in srgb, var(--ui-text-primary) 18%, transparent);
    background: color-mix(in srgb, var(--ui-surface-secondary) 72%, var(--ui-surface-card) 28%);
    --study-feature-card-accent: var(--ui-text-primary);
    --study-feature-card-icon-bg: color-mix(in srgb, var(--ui-text-primary) 12%, var(--ui-surface-secondary) 88%);
    --study-feature-card-icon-fg: var(--ui-text-primary);
  }

  :global(.study-hub-feature-card--summary) {
    --study-feature-card-accent: #93c5fd;
    --study-feature-card-icon-bg: #dbeafe;
    --study-feature-card-icon-fg: #1d4ed8;
  }

  :global(.study-hub-feature-card--flashcards) {
    --study-feature-card-accent: #a5b4fc;
    --study-feature-card-icon-bg: #e0e7ff;
    --study-feature-card-icon-fg: #4338ca;
  }

  :global(.study-hub-feature-card--exam) {
    --study-feature-card-accent: #bbf7d0;
    --study-feature-card-icon-bg: #dcfce7;
    --study-feature-card-icon-fg: #15803d;
  }

  :global(.study-hub-feature-card .ui-study-action-card__icon) {
    background: var(--study-feature-card-icon-bg);
    color: var(--study-feature-card-icon-fg);
  }

  :global(.study-hub-feature-card .ui-study-action-card__copy h2) {
    font-weight: 650;
  }

  :global(.study-hub-feature-card .ui-study-action-card__description) {
    padding-top: 0.9rem;
    border-top: 1px solid color-mix(in srgb, var(--ui-text-primary) 10%, transparent);
  }

  :global(.study-hub-feature-card .ui-study-action-card__status) {
    border-radius: var(--ui-radius-pill);
  }

  .study-hub-feature-card__support-copy {
    margin: 0;
    margin-top: 0.35rem;
    color: var(--ui-text-secondary);
    line-height: 1.5;
    font-size: 0.8125rem;
  }

  .study-hub-feature-card__empty {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: 0.8125rem;
    font-style: italic;
    line-height: 1.35;
  }

  .study-hub-feature-card__details {
    display: grid;
    gap: 0.42rem;
    margin: 0;
  }

  .study-hub-feature-card__detail {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    min-width: 0;
    color: var(--ui-text-secondary);
    font-size: 0.8125rem;
    font-weight: 560;
    line-height: 1.3;
  }

  .study-hub-feature-card__detail dt {
    width: 0.7rem;
    height: 0.7rem;
    flex: 0 0 auto;
    margin: 0;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--study-feature-card-accent) 70%, var(--ui-text-secondary) 30%);
    box-shadow: inset 0 0 0 0.16rem var(--ui-surface-card);
  }

  .study-hub-feature-card__detail dd {
    min-width: 0;
    margin: 0;
  }

  .study-hub-feature-card__score {
    display: grid;
    gap: 0.38rem;
    margin-top: 0.7rem;
  }

  .study-hub-feature-card__score-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    color: var(--ui-text-secondary);
    font-size: 0.74rem;
    font-weight: 560;
    line-height: 1.2;
  }

  .study-hub-feature-card__score-meta strong {
    color: var(--ui-text-primary);
    font-size: 0.75rem;
    font-weight: 750;
    font-variant-numeric: tabular-nums;
  }

  :global(.study-hub-feature-card__score-bar.ui-progress) {
    --ui-progress-track: color-mix(in srgb, var(--ui-text-primary) 13%, transparent);
    --ui-progress-fill: color-mix(in srgb, var(--ui-accent-success) 78%, #3f6212 22%);
    height: 0.25rem;
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
    --button-bg: transparent;
    --button-bg-hover: color-mix(in srgb, var(--ui-text-primary) 7%, transparent);
    --button-bg-active: color-mix(in srgb, var(--ui-text-primary) 11%, transparent);
    --button-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ui-text-primary) 22%, var(--ui-border-default) 78%);
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
