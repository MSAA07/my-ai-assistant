<script>
  import { onDestroy } from 'svelte';
  import Button from '../ui/Button.svelte';
  import ProgressBar from '../ui/ProgressBar.svelte';
  import StudyActionCard from '../ui/StudyActionCard.svelte';
  import { Sparkles } from '@lucide/svelte';
  import { t } from '../../i18n/t.js';

  export let card = {};
  export let icon;
  export let onPrimaryAction = () => {};

  const MESSAGE_INTERVAL_MS = 2800;
  const GENERATING_MESSAGE_CONFIG = {
    summary: {
      delayMs: 0,
      messageKeys: [
        'document.hub.generatingMessages.summary.reading',
        'document.hub.generatingMessages.summary.identifying',
        'document.hub.generatingMessages.summary.extracting',
        'document.hub.generatingMessages.summary.writing',
        'document.hub.generatingMessages.common.almostThere',
      ],
    },
    flashcards: {
      delayMs: 900,
      messageKeys: [
        'document.hub.generatingMessages.flashcards.scanning',
        'document.hub.generatingMessages.flashcards.matching',
        'document.hub.generatingMessages.flashcards.building',
        'document.hub.generatingMessages.flashcards.organising',
        'document.hub.generatingMessages.common.almostThere',
      ],
    },
    exam: {
      delayMs: 1800,
      messageKeys: [
        'document.hub.generatingMessages.exam.analysing',
        'document.hub.generatingMessages.exam.crafting',
        'document.hub.generatingMessages.exam.trueFalse',
        'document.hub.generatingMessages.exam.mixing',
        'document.hub.generatingMessages.common.almostThere',
      ],
    },
  };

  let activeMessageIndex = 0;
  let messageAnimationKey = 0;
  let messageDelayTimer = null;
  let messageIntervalTimer = null;
  let messageRunKey = '';

  $: Icon = icon;
  $: resolvedCard = {
    key: '',
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
  $: generatingConfig = GENERATING_MESSAGE_CONFIG[resolvedCard.key] ?? GENERATING_MESSAGE_CONFIG.summary;
  $: activeGeneratingMessageKey = generatingConfig.messageKeys[activeMessageIndex] ?? generatingConfig.messageKeys[0] ?? '';
  $: activeGeneratingMessage = activeGeneratingMessageKey ? t(activeGeneratingMessageKey) : '';
  $: nextMessageRunKey = `${resolvedCard.key}:${resolvedCard.status}`;
  $: if (nextMessageRunKey !== messageRunKey) {
    messageRunKey = nextMessageRunKey;
    resetGeneratingMessages();
  }

  onDestroy(() => {
    clearMessageTimers();
  });

  function clearMessageTimers() {
    if (messageDelayTimer) clearTimeout(messageDelayTimer);
    if (messageIntervalTimer) clearInterval(messageIntervalTimer);
    messageDelayTimer = null;
    messageIntervalTimer = null;
  }

  function advanceGeneratingMessage() {
    const messageCount = generatingConfig.messageKeys.length;
    if (messageCount <= 1) return;
    activeMessageIndex = (activeMessageIndex + 1) % messageCount;
    messageAnimationKey += 1;
  }

  function resetGeneratingMessages() {
    clearMessageTimers();
    activeMessageIndex = 0;
    messageAnimationKey += 1;

    if (resolvedCard.status !== 'generating') return;

    const startInterval = () => {
      clearMessageTimers();
      messageIntervalTimer = setInterval(advanceGeneratingMessage, MESSAGE_INTERVAL_MS);
    };

    if (generatingConfig.delayMs > 0) {
      messageDelayTimer = setTimeout(startInterval, generatingConfig.delayMs);
    } else {
      startInterval();
    }
  }
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
    {:else if resolvedCard.status === 'generating'}
      {#key messageAnimationKey}
        <p class="study-hub-feature-card__generating-message">{activeGeneratingMessage}</p>
      {/key}
    {:else if resolvedCard.status !== 'complete'}
      <p>{resolvedCard.statusCopy}</p>
    {/if}
  </svelte:fragment>

  {#if resolvedCard.status === 'generating'}
    <div class="study-hub-feature-card__skeleton study-hub-feature-card__skeleton--{resolvedCard.key}" aria-hidden="true">
      {#if resolvedCard.key === 'summary'}
        <span class="study-hub-feature-card__skeleton-item study-hub-feature-card__skeleton-line" style="--skeleton-width: 90%; --skeleton-height: 11px;"></span>
        <span class="study-hub-feature-card__skeleton-item study-hub-feature-card__skeleton-line" style="--skeleton-width: 75%; --skeleton-height: 11px;"></span>
        <span class="study-hub-feature-card__skeleton-item study-hub-feature-card__skeleton-line" style="--skeleton-width: 82%; --skeleton-height: 11px;"></span>
        <span class="study-hub-feature-card__skeleton-item study-hub-feature-card__skeleton-line" style="--skeleton-width: 60%; --skeleton-height: 11px;"></span>
      {:else if resolvedCard.key === 'flashcards'}
        {#each [0, 1] as rowIndex}
          <div class="study-hub-feature-card__skeleton-row study-hub-feature-card__skeleton-row--flashcard">
            <span class="study-hub-feature-card__skeleton-item study-hub-feature-card__skeleton-square"></span>
            <span class="study-hub-feature-card__skeleton-copy">
              <span class="study-hub-feature-card__skeleton-item study-hub-feature-card__skeleton-line" style={`--skeleton-width: ${rowIndex === 0 ? '78%' : '70%'}; --skeleton-height: 10px;`}></span>
              <span class="study-hub-feature-card__skeleton-item study-hub-feature-card__skeleton-line" style={`--skeleton-width: ${rowIndex === 0 ? '52%' : '62%'}; --skeleton-height: 10px;`}></span>
            </span>
          </div>
        {/each}
      {:else}
        {#each [0, 1, 2] as rowIndex}
          <div class="study-hub-feature-card__skeleton-row study-hub-feature-card__skeleton-row--exam">
            <span class="study-hub-feature-card__skeleton-item study-hub-feature-card__skeleton-circle"></span>
            <span class="study-hub-feature-card__skeleton-item study-hub-feature-card__skeleton-line" style={`--skeleton-width: ${rowIndex === 0 ? '82%' : rowIndex === 1 ? '68%' : '76%'}; --skeleton-height: 10px;`}></span>
          </div>
        {/each}
      {/if}
    </div>
  {/if}

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

  .study-hub-feature-card__generating-message {
    animation: study-hub-feature-card-message-in 0.4s ease both;
  }

  .study-hub-feature-card__skeleton {
    display: grid;
    gap: 8px;
    min-height: 5.5rem;
  }

  .study-hub-feature-card__skeleton-row {
    display: flex;
    align-items: center;
    gap: var(--ui-space-3);
    min-width: 0;
  }

  .study-hub-feature-card__skeleton-row--flashcard {
    min-height: 36px;
  }

  .study-hub-feature-card__skeleton-row--exam {
    min-height: 24px;
  }

  .study-hub-feature-card__skeleton-copy {
    flex: 1 1 auto;
    display: grid;
    gap: 7px;
    min-width: 0;
  }

  .study-hub-feature-card__skeleton-item {
    --skeleton-color: var(--ui-surface-secondary);
    display: block;
    background:
      linear-gradient(
        90deg,
        var(--skeleton-color) 0%,
        color-mix(in srgb, var(--skeleton-color) 72%, var(--ui-surface-card) 28%) 48%,
        var(--skeleton-color) 100%
      );
    background-size: 220% 100%;
    animation: study-hub-feature-card-shimmer 1.6s ease-in-out infinite;
  }

  .study-hub-feature-card__skeleton-line {
    width: var(--skeleton-width, 100%);
    height: var(--skeleton-height, 10px);
    border-radius: 6px;
  }

  .study-hub-feature-card__skeleton-square {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    flex: 0 0 36px;
  }

  .study-hub-feature-card__skeleton-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    flex: 0 0 20px;
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

  @keyframes study-hub-feature-card-message-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes study-hub-feature-card-shimmer {
    from { background-position: -160% 0; }
    to { background-position: 160% 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .study-hub-feature-card__generating-message,
    .study-hub-feature-card__skeleton-item {
      animation: none;
    }
  }
</style>
