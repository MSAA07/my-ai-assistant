<script>
  import ActivityChrome from '../layout/ActivityChrome.svelte';
  import FocusedStudyLayout from '../ui/FocusedStudyLayout.svelte';
  import Badge from '../ui/Badge.svelte';
  import ProgressBar from '../ui/ProgressBar.svelte';
  import StatusBadge from '../ui/StatusBadge.svelte';

  export let className = '';
  export let mode = 'summary';
  export let modeLabel = '';
  export let fileTypeBadge = '';
  export let status = 'info';
  export let statusLabel = '';
  export let statusHeadline = '';
  export let statusCopy = '';
  export let showProgress = false;
  export let progressLabel = '';
  export let progressValue = 0;
  export let progressMax = 1;
  export let contentWidth = 'wide';
  export let chromeVariant = 'default';

  $: resolvedClass = [
    'study-activity-shell',
    `study-activity-shell--${mode}`,
    chromeVariant !== 'default' ? `study-activity-shell--${chromeVariant}` : '',
    className,
    $$props.class ?? '',
  ]
    .filter(Boolean)
    .join(' ');
</script>

<ActivityChrome {...$$restProps} className={resolvedClass}>
  {#if $$slots.back}
    <slot name="back" slot="back" />
  {/if}

  <svelte:fragment slot="progress">
    {#if chromeVariant === 'focused-flashcards' && $$slots['chrome-progress']}
      <div class="study-activity-shell__chrome-slot">
        <slot name="chrome-progress" />
      </div>
    {:else if showProgress}
      <div class="study-activity-shell__progress">
        <p class="study-activity-shell__progress-label">{progressLabel}</p>
        <ProgressBar
          value={progressValue}
          max={progressMax}
          ariaLabel={progressLabel}
          className="study-activity-shell__progress-bar"
        />
      </div>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="status">
    {#if chromeVariant === 'focused-flashcards' && $$slots['chrome-status']}
      <div class="study-activity-shell__chrome-slot">
        <slot name="chrome-status" />
      </div>
    {:else}
      <div class="study-activity-shell__status">
        <div class="study-activity-shell__status-head">
          <div class="study-activity-shell__status-badges">
            {#if modeLabel}
              <Badge tone="accent" variant="soft" size="sm" uppercase>{modeLabel}</Badge>
            {/if}
            {#if fileTypeBadge}
              <Badge tone="destructive" variant="outline" size="sm" className="study-activity-shell__file-badge">{fileTypeBadge}</Badge>
            {/if}
          </div>
          <StatusBadge status={status} label={statusLabel} />
        </div>

        <div class="study-activity-shell__status-copy">
          {#if statusHeadline}
            <p class="study-activity-shell__status-title">{statusHeadline}</p>
          {/if}
          {#if statusCopy}
            <p class="study-activity-shell__status-body">{statusCopy}</p>
          {/if}
        </div>

        {#if $$slots.actions}
          <div class="study-activity-shell__status-actions">
            <slot name="actions" />
          </div>
        {/if}
      </div>
    {/if}
  </svelte:fragment>

  {#if $$slots.banner}
    <div class="study-activity-shell__banner">
      <slot name="banner" />
    </div>
  {/if}

  <FocusedStudyLayout className="study-activity-shell__canvas" narrow={contentWidth}>
    <slot />
  </FocusedStudyLayout>
</ActivityChrome>

<style>
  :global(.study-activity-shell) {
    min-width: 0;
  }

  .study-activity-shell__progress,
  .study-activity-shell__status,
  .study-activity-shell__chrome-slot,
  .study-activity-shell__banner {
    width: 100%;
  }

  .study-activity-shell__progress,
  .study-activity-shell__status {
    border: 1px solid color-mix(in srgb, var(--ui-border-default) 88%, transparent);
    border-radius: calc(var(--ui-radius-md) + 0.15rem);
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-surface-card) 96%, transparent), color-mix(in srgb, var(--ui-surface-card) 88%, var(--ui-surface-secondary) 12%));
    box-shadow: var(--ui-shadow-1);
    backdrop-filter: blur(14px);
  }

  .study-activity-shell__progress {
    max-width: 30rem;
    padding: 0.85rem 1rem;
    display: grid;
    gap: 0.55rem;
    align-self: center;
  }

  .study-activity-shell__progress-label {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: 600;
  }

  :global(.study-activity-shell__progress-bar) {
    height: 0.4rem;
  }

  .study-activity-shell__status {
    max-width: 22rem;
    padding: 0.95rem 1rem;
    display: grid;
    gap: 0.8rem;
    justify-self: end;
  }

  .study-activity-shell__status-head,
  .study-activity-shell__status-badges {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .study-activity-shell__status-badges {
    align-items: center;
  }

  .study-activity-shell__status-copy,
  .study-activity-shell__status-actions {
    display: grid;
    gap: 0.5rem;
  }

  .study-activity-shell__status-title,
  .study-activity-shell__status-body {
    margin: 0;
  }

  .study-activity-shell__status-title {
    color: var(--ui-text-primary);
    font-size: 0.98rem;
    font-weight: 600;
    line-height: 1.35;
  }

  .study-activity-shell__status-body {
    color: var(--ui-text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  :global(.study-activity-shell__status-actions .ui-button) {
    justify-self: start;
  }

  :global(.study-activity-shell__file-badge) {
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .study-activity-shell__banner {
    display: grid;
    gap: 1rem;
  }

  :global(.study-activity-shell__canvas) {
    width: 100%;
    min-width: 0;
    margin-inline: auto;
  }

  :global(.study-activity-shell--focused-flashcards .activity-chrome__rail) {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 32;
    padding:
      max(var(--ui-space-4), env(safe-area-inset-top))
      max(var(--ui-space-4), env(safe-area-inset-right))
      0
      max(var(--ui-space-4), env(safe-area-inset-left));
  }

  :global(.study-activity-shell--focused-flashcards .activity-chrome__controls) {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    gap: clamp(0.75rem, 1vw + 0.4rem, 1.4rem);
    align-items: center;
  }

  :global(.study-activity-shell--focused-flashcards .activity-chrome__body) {
    gap: clamp(1.25rem, 1vw + 1rem, 2rem);
    padding-top: clamp(5.5rem, 4.7rem + 2.8vw, 7.25rem);
  }

  :global(.study-activity-shell--focused-flashcards .activity-chrome__pane) {
    align-items: center;
  }

  :global(.study-activity-shell--focused-flashcards .activity-chrome__pane--progress) {
    justify-content: center;
  }

  @media (max-width: 900px) {
    .study-activity-shell__status {
      max-width: none;
    }

    :global(.study-activity-shell--focused-flashcards .activity-chrome__controls) {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    :global(.study-activity-shell--focused-flashcards .activity-chrome__pane--progress) {
      grid-column: 1 / -1;
      justify-content: center;
    }
  }

  @media (max-width: 640px) {
    :global(.study-activity-shell--focused-flashcards .activity-chrome__controls) {
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--ui-space-3);
    }
  }
</style>
