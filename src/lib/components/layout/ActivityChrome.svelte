<script>
  export let className = '';
</script>

<section
  {...$$restProps}
  class={['activity-chrome', className, $$props.class ?? ''].filter(Boolean).join(' ')}
>
  <div class="activity-chrome__rail">
    <div class="activity-chrome__controls">
      {#if $$slots.back}
        <div class="activity-chrome__pane activity-chrome__pane--back">
          <slot name="back" />
        </div>
      {/if}

      {#if $$slots.progress}
        <div class="activity-chrome__pane activity-chrome__pane--progress">
          <slot name="progress" />
        </div>
      {/if}

      {#if $$slots.status}
        <div class="activity-chrome__pane activity-chrome__pane--status">
          <slot name="status" />
        </div>
      {/if}
    </div>
  </div>

  <div class="activity-chrome__body">
    <slot />
  </div>
</section>

<style>
  .activity-chrome {
    width: 100%;
    min-width: 0;
    display: grid;
    gap: clamp(1rem, 1vw + 0.75rem, 1.5rem);
  }

  .activity-chrome__rail {
    position: sticky;
    top: 0;
    z-index: 24;
    padding-top: max(0px, env(safe-area-inset-top));
    pointer-events: none;
  }

  .activity-chrome__controls {
    display: grid;
    gap: 0.9rem;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr) minmax(0, 1fr);
    align-items: start;
  }

  .activity-chrome__pane {
    min-width: 0;
    pointer-events: auto;
    display: flex;
  }

  .activity-chrome__pane--back {
    justify-content: flex-start;
  }

  .activity-chrome__pane--progress {
    justify-content: center;
  }

  .activity-chrome__pane--status {
    justify-content: flex-end;
  }

  .activity-chrome__body {
    min-width: 0;
    display: grid;
    gap: clamp(1rem, 1vw + 0.75rem, 1.5rem);
    padding-bottom: max(0px, env(safe-area-inset-bottom));
  }

  @media (max-width: 900px) {
    .activity-chrome__controls {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }

    .activity-chrome__pane--progress {
      grid-column: 1 / -1;
      justify-content: stretch;
    }
  }

  @media (max-width: 640px) {
    .activity-chrome__controls {
      grid-template-columns: minmax(0, 1fr);
    }

    .activity-chrome__pane--back,
    .activity-chrome__pane--progress,
    .activity-chrome__pane--status {
      justify-content: stretch;
    }
  }
</style>
