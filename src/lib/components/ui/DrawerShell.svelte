<script>
  import { createEventDispatcher } from 'svelte';
  import { t } from '../../i18n/t.js';
  import Button from './Button.svelte';

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
      <Button type="button" className="drawer__close" variant="ghost" size="sm" on:click={handleClose}>
        {t('drawer.close')}
      </Button>
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
    background: var(--color-backdrop-strong);
    opacity: 0;
    transition: opacity var(--motion-normal) var(--ease-standard);
    pointer-events: none;
  }

  .drawer {
    position: fixed;
    inset-block: 0;
    inline-size: var(--drawer-width);
    max-inline-size: min(var(--drawer-width), 100%);
    background: var(--ui-surface-overlay);
    border-inline-start: 1px solid var(--ui-border-subtle);
    box-shadow: var(--ui-shadow-lg);
    transform: translateX(var(--drawer-hidden-offset, 100%));
    transition: transform var(--motion-normal) var(--ease-standard);
    display: flex;
    flex-direction: column;
  }

  .drawer--anchor-start {
    inset-inline-start: 0;
    inset-inline-end: auto;
    border-inline-start: none;
    border-inline-end: 1px solid var(--ui-border-subtle);
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
    padding: var(--space-4);
    border-block-end: 1px solid var(--ui-border-subtle);
  }

  h2 {
    margin: 0;
    font-size: 0.98rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .drawer__close {
    min-inline-size: 70px;
    min-block-size: 2.75rem;
    justify-self: end;
  }

  .drawer__scroll {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-3) var(--space-4);
  }

  .drawer__content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .drawer__footer {
    padding: var(--space-3) var(--space-4);
    border-block-start: 1px solid var(--ui-border-subtle);
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
  }

  :global(html[dir='rtl']) .drawer {
    border-inline-start: 1px solid var(--ui-border-subtle);
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
