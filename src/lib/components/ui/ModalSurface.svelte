<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  export let open = false;
  export let width = 'min(480px, 100%)';
  export let padding = 'lg';
  export let closeOnEscape = true;
  export let closeOnBackdrop = true;
  export let labelledBy = '';
  export let describedBy = '';
  export let className = '';
  export let overlayClassName = '';

  $: overlayClass = ['ui-modal-overlay', overlayClassName].filter(Boolean).join(' ');
  $: surfaceClass = ['ui-modal', `ui-modal--padding-${padding}`, className, $$props.class ?? '']
    .filter(Boolean)
    .join(' ');

  function requestClose() {
    dispatch('close');
  }

  function handleOverlayClick(event) {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      requestClose();
    }
  }

  function handleEscape(event) {
    if (!open || !closeOnEscape) return;
    if (event.key === 'Escape') {
      requestClose();
    }
  }

  $: if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleEscape);
    if (open && closeOnEscape) {
      window.addEventListener('keydown', handleEscape);
    }
  }

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleEscape);
    }
  });
</script>

{#if open}
  <div class={overlayClass} role="presentation" tabindex="-1" on:click={handleOverlayClick} transition:fade={{ duration: 130 }}>
    <section
      {...$$restProps}
      class={surfaceClass}
      style={`--ui-modal-width: ${width};`}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby={labelledBy || undefined}
      aria-describedby={describedBy || undefined}
      transition:fly={{ y: 10, duration: 170, easing: t => t }}
    >
      <slot />
    </section>
  </div>
{/if}

<style>
  .ui-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 999;
    padding: var(--space-4);
    display: grid;
    place-items: center;
    background: var(--color-backdrop-strong);
  }

  .ui-modal {
    width: var(--ui-modal-width);
    max-width: 100%;
    max-height: min(92vh, 960px);
    overflow-y: auto;
    border-radius: var(--ui-radius-md);
    border: 1px solid var(--ui-border-strong);
    background: var(--ui-surface-overlay);
    box-shadow: var(--ui-shadow-lg);
    display: grid;
    gap: var(--space-3);
  }

  .ui-modal--padding-sm {
    padding: var(--space-3);
  }

  .ui-modal--padding-md {
    padding: var(--space-4);
  }

  .ui-modal--padding-lg {
    padding: var(--space-4);
  }

  @media (min-width: 641px) and (max-width: 1024px) {
    .ui-modal {
      max-width: 90vw;
    }
  }

  @media (max-width: 640px) {
    .ui-modal-overlay {
      padding: 0;
      align-items: end;
    }

    .ui-modal {
      width: 100%;
      max-width: 100%;
      max-height: 100dvh;
      overflow-y: auto;
      border-radius: 1rem 1rem 0 0;
      margin: 0;
    }

    .ui-modal--padding-sm {
      padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
    }

    .ui-modal--padding-md,
    .ui-modal--padding-lg {
      padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
    }
  }
</style>
