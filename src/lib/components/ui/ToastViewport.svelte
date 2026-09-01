<script>
  import { AlertCircle, CheckCircle2, X } from '@lucide/svelte';
  import { fly } from 'svelte/transition';
  import { dismissToast, toasts } from '../../../stores/toasts.js';
</script>

<div class="toast-viewport" aria-live="polite" aria-label="Notifications">
  {#each $toasts as item (item.id)}
    <section
      class:error={item.type === 'error'}
      class="toast-item"
      role={item.type === 'error' ? 'alert' : 'status'}
      transition:fly={{ x: 18, duration: 160 }}
    >
      <span class="toast-icon" aria-hidden="true">
        {#if item.type === 'error'}<AlertCircle />{:else}<CheckCircle2 />{/if}
      </span>
      <div class="toast-copy">
        {#if item.title}<strong>{item.title}</strong>{/if}
        <p>{item.message}</p>
      </div>
      <button type="button" aria-label="Dismiss notification" on:click={() => dismissToast(item.id)}>
        <X aria-hidden="true" />
      </button>
    </section>
  {/each}
</div>

<style>
  .toast-viewport {
    position: fixed;
    inset-block-start: var(--ui-space-4);
    inset-inline-end: var(--ui-space-4);
    z-index: 1400;
    width: min(390px, calc(100vw - (2 * var(--ui-space-4))));
    display: grid;
    gap: var(--ui-space-2);
    pointer-events: none;
  }

  .toast-item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: start;
    gap: var(--ui-space-2);
    border: 1px solid color-mix(in srgb, var(--ui-accent-success-strong) 35%, var(--ui-border-default) 65%);
    border-radius: var(--ui-radius-md);
    background: var(--ui-surface-overlay);
    box-shadow: var(--ui-shadow-lg);
    color: var(--ui-text-primary);
    padding: var(--ui-space-3);
    pointer-events: auto;
  }

  .toast-item.error {
    border-color: color-mix(in srgb, var(--ui-accent-danger) 42%, var(--ui-border-default) 58%);
  }

  .toast-icon {
    display: inline-flex;
    color: var(--ui-accent-success-strong);
  }

  .error .toast-icon {
    color: var(--ui-accent-danger);
  }

  .toast-icon :global(svg),
  button :global(svg) {
    width: 1.05rem;
    height: 1.05rem;
  }

  .toast-copy {
    min-width: 0;
    display: grid;
    gap: 0.15rem;
  }

  .toast-copy strong,
  .toast-copy p {
    margin: 0;
    overflow-wrap: anywhere;
  }

  .toast-copy strong {
    font-size: var(--ui-type-body-sm);
  }

  .toast-copy p {
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-label);
    line-height: 1.45;
  }

  button {
    display: inline-flex;
    border: 0;
    background: transparent;
    color: var(--ui-text-muted);
    cursor: pointer;
    padding: 0.15rem;
  }

  button:hover {
    color: var(--ui-text-primary);
  }
</style>
