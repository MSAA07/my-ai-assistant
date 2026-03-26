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
  $: stickyChrome = chromeVariant === 'active-session';

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

<ActivityChrome {...$$restProps} className={resolvedClass} sticky={stickyChrome}>
  <svelte:fragment slot="back">
    {#if $$slots.back}
      <slot name="back" />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="progress">
    {#if chromeVariant === 'active-session' && $$slots['chrome-progress']}
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
    {#if chromeVariant === 'active-session' && $$slots['chrome-status']}
      <div class="study-activity-shell__chrome-slot">
        <slot name="chrome-status" />
      </div>
    {:else if $$slots['chrome-status']}
      <div class="study-activity-shell__chrome-slot study-activity-shell__chrome-slot--default">
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

  {#if chromeVariant === 'active-session'}
    <div class="study-activity-shell__session">
      <slot />
    </div>
  {:else}
    <FocusedStudyLayout className="study-activity-shell__canvas" narrow={contentWidth}>
      <slot />
    </FocusedStudyLayout>
  {/if}
</ActivityChrome>

<style>
  :global(.study-activity-shell) {
    min-width: 0;
  }

  .study-activity-shell__progress,
  .study-activity-shell__status,
  .study-activity-shell__chrome-slot,
  .study-activity-shell__session,
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

  .study-activity-shell__session {
    min-width: 0;
    display: grid;
    gap: var(--ui-space-3);
  }

  :global(.study-activity-shell__canvas) {
    width: 100%;
    min-width: 0;
    margin-inline: auto;
  }

  /* Summary/exam chrome: single-column controls; only the back link lives in the rail.
     Badge, title, and regenerate have moved into the content body column. */
  :global(.study-activity-shell--summary .activity-chrome__controls) {
    width: min(100%, var(--study-flow-reading-width));
    margin-inline: auto;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--study-flow-copy-gap);
  }

  :global(.study-activity-shell--exam .activity-chrome__controls) {
    width: min(100%, var(--study-flow-session-width));
    margin-inline: auto;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--study-flow-copy-gap);
  }

  /* Hide progress and status panes; they are unused for summary/exam now */
  :global(.study-activity-shell--summary .activity-chrome__pane--progress),
  :global(.study-activity-shell--exam .activity-chrome__pane--progress),
  :global(.study-activity-shell--summary .activity-chrome__pane--status),
  :global(.study-activity-shell--exam .activity-chrome__pane--status) {
    display: none;
  }

  :global(.study-activity-shell--summary .study-activity-shell__canvas) {
    width: min(100%, var(--study-flow-reading-width));
  }

  :global(.study-activity-shell--exam .study-activity-shell__canvas) {
    width: min(100%, var(--study-flow-session-width));
  }

  /* Tighten back-link rail to content-body gap for summary and exam */
  :global(.study-activity-shell--summary.activity-chrome),
  :global(.study-activity-shell--exam.activity-chrome) {
    gap: var(--ui-space-2);
  }

  :global(.study-activity-shell--active-session.activity-chrome) {
    gap: var(--ui-space-3);
  }

  :global(.study-activity-shell--active-session .activity-chrome__rail) {
    z-index: 12;
    padding-bottom: var(--ui-space-1);
  }

  :global(.study-activity-shell--flashcards.study-activity-shell--active-session .activity-chrome__rail) {
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-bg-page) 97%, transparent), color-mix(in srgb, var(--ui-bg-page) 92%, transparent) 78%, transparent);
  }

  :global(.study-activity-shell--active-session .activity-chrome__controls) {
    width: min(100%, var(--study-flow-session-content-width));
    margin-inline: auto;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    gap: clamp(0.75rem, 1vw + 0.4rem, 1.4rem);
    align-items: center;
  }

  :global(.study-activity-shell--flashcards.study-activity-shell--active-session .activity-chrome__controls) {
    grid-template-columns: auto minmax(11rem, 1fr) auto;
    gap: var(--ui-space-4);
    min-height: 0;
  }

  :global(.study-activity-shell--flashcards.study-activity-shell--active-session .activity-chrome__pane--progress) {
    justify-content: center;
    min-width: 0;
  }

  :global(.study-activity-shell--flashcards.study-activity-shell--active-session .activity-chrome__pane--status) {
    justify-content: flex-end;
    width: auto;
    max-width: none;
  }

  :global(.study-activity-shell--flashcards.study-activity-shell--active-session .activity-chrome__pane--back) {
    justify-content: flex-start;
    width: auto;
  }

  :global(.study-activity-shell--active-session .activity-chrome__body) {
    width: min(100%, var(--study-flow-session-content-width));
    margin-inline: auto;
    gap: var(--study-flow-card-gap);
    padding-bottom: max(var(--ui-space-3), env(safe-area-inset-bottom));
  }

  :global(.study-activity-shell--active-session .activity-chrome__pane) {
    align-items: center;
  }

  :global(.study-activity-shell--active-session .activity-chrome__pane--progress) {
    justify-content: center;
  }

  :global(.study-activity-shell--active-session .study-activity-shell__session) {
    padding-inline: 0;
  }

  @media (max-width: 900px) {
    .study-activity-shell__status {
      max-width: none;
    }

    :global(.study-activity-shell--active-session .activity-chrome__controls) {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    :global(.study-activity-shell--active-session .activity-chrome__pane--progress) {
      grid-column: 1 / -1;
      justify-content: center;
    }

    :global(.study-activity-shell--flashcards.study-activity-shell--active-session .activity-chrome__controls) {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--ui-space-3);
    }
  }

  @media (max-width: 640px) {
    :global(.study-activity-shell--active-session .activity-chrome__controls) {
      width: 100%;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--ui-space-3);
    }

    :global(.study-activity-shell--active-session .study-activity-shell__session) {
      gap: var(--ui-space-3);
    }

    :global(.study-activity-shell--flashcards.study-activity-shell--active-session .activity-chrome__controls) {
      gap: var(--ui-space-2);
    }
  }
</style>
