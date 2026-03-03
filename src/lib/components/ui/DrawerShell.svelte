<script>
  import { createEventDispatcher } from 'svelte';
  import { t } from '../../i18n/t.js';

  export let open = false;
  export let title = '';
  export let anchor = 'end';
  export let width = 'var(--size-drawer)';

  const dispatch = createEventDispatcher();
  const titleId = `drawer-title-${Math.random().toString(36).slice(2, 9)}`;

  const handleClose = () => {
    dispatch('close');
  };

  const handleOverlay = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  $: normalizedAnchor = anchor === 'start' ? 'start' : 'end';
</script>

<div class="drawer-container" data-open={open}>
  <div class="drawer-overlay" on:click={handleOverlay} aria-hidden={!open}></div>
  <aside
    class="drawer"
    class:drawer--open={open}
    class:drawer--anchor-start={normalizedAnchor === 'start'}
    class:drawer--anchor-end={normalizedAnchor === 'end'}
    aria-hidden={!open}
    aria-modal={open}
    role="dialog"
    aria-labelledby={title ? titleId : undefined}
    style={`--drawer-width: ${width};`}
  >
    <header class="drawer__header">
      <div>
        <h2 id={title ? titleId : undefined}>{title}</h2>
        <slot name="subtitle"></slot>
      </div>
      <button type="button" class="drawer__close" on:click={handleClose}>
        {t('drawer.close')}
      </button>
    </header>
    <div class="drawer__scroll">
      <div class="drawer__content">
        <slot />
      </div>
    </div>
    <footer class="drawer__footer">
      <slot name="footer"></slot>
    </footer>
  </aside>
</div>

<style>
  .drawer-container {
    position: fixed;
    inset: 0;
    display: contents;
  }

  .drawer-overlay {
    position: fixed;
    inset: 0;
    background: color-mix(in srgb, black 40%, transparent);
    opacity: 0;
    transition: opacity var(--motion-normal) var(--ease-standard);
    pointer-events: none;
  }

  .drawer {
    position: fixed;
    inset-block: 0;
    inline-size: var(--drawer-width);
    max-inline-size: min(var(--drawer-width), 100%);
    background: var(--color-surface-1);
    border-inline-start: 1px solid var(--color-border);
    box-shadow: 0 0 40px color-mix(in srgb, var(--color-bg) 70%, transparent);
    transform: translateX(var(--drawer-hidden-offset, 100%));
    transition: transform var(--motion-normal) var(--ease-standard);
    display: flex;
    flex-direction: column;
  }

  .drawer--anchor-start {
    inset-inline-start: 0;
    inset-inline-end: auto;
    border-inline-start: none;
    border-inline-end: 1px solid var(--color-border);
    --drawer-hidden-offset: -100%;
  }

  .drawer--anchor-end {
    inset-inline-end: 0;
    inset-inline-start: auto;
    --drawer-hidden-offset: 100%;
  }

  .drawer--open {
    transform: translateX(0);
  }

  .drawer__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-5);
    border-block-end: 1px solid var(--color-border);
  }

  h2 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--color-text-primary);
  }

  .drawer__close {
    min-inline-size: 44px;
    min-block-size: 36px;
    border-radius: var(--radius-1);
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text-muted);
    font: inherit;
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .drawer__close:hover,
  .drawer__close:focus-visible {
    color: var(--color-text-primary);
    background: var(--color-surface-2);
    border-color: var(--color-accent-primary);
    outline: none;
  }

  .drawer__scroll {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-4) var(--space-5);
  }

  .drawer__content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .drawer__footer {
    padding: var(--space-4) var(--space-5);
    border-block-start: 1px solid var(--color-border);
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
  }

  :global(html[dir='rtl']) .drawer {
    border-inline-start: 1px solid var(--color-border);
    border-inline-end: none;
  }

  :global(html[dir='rtl']) .drawer--anchor-end {
    --drawer-hidden-offset: -100%;
  }

  :global(html[dir='rtl']) .drawer--anchor-start {
    --drawer-hidden-offset: 100%;
  }

  [data-open='true'] .drawer-overlay {
    opacity: 1;
    pointer-events: auto;
  }

  @media (max-width: 768px) {
    .drawer__header,
    .drawer__scroll,
    .drawer__footer {
      padding-inline: var(--space-4);
    }
  }

  @media (max-width: 640px) {
    .drawer {
      inline-size: 100%;
      max-inline-size: 100%;
    }
  }
</style>
