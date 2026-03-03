<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { t } from '../../i18n/t.js';

  export let open = false;
  export let title = t('modal.destructiveTitle');
  export let description = t('modal.destructiveSubtitle');
  export let confirmLabel = t('modal.confirm');
  export let cancelLabel = t('modal.cancel');
  export let loading = false;

  const dispatch = createEventDispatcher();

  const handleKeydown = (event) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      dispatch('cancel');
    }
  };

  const handleBackdrop = (event) => {
    if (event.target === event.currentTarget) {
      dispatch('cancel');
    }
  };

  const teardown = () => {
    if (typeof document === 'undefined') {
      return;
    }
    document.removeEventListener('keydown', handleKeydown);
    document.body.style.removeProperty('overflow');
  };

  let bindingsApplied = false;

  $: {
    if (typeof document === 'undefined') {
      return;
    }

    if (open && !bindingsApplied) {
      document.addEventListener('keydown', handleKeydown);
      document.body.style.setProperty('overflow', 'hidden');
      bindingsApplied = true;
    }

    if (!open && bindingsApplied) {
      teardown();
      bindingsApplied = false;
    }
  }

  onDestroy(() => {
    teardown();
    bindingsApplied = false;
  });
</script>

{#if open}
  <div class="modal" role="presentation" on:click={handleBackdrop}>
    <div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div class="modal__content">
        <h2 id="confirm-modal-title">{title}</h2>
        {#if description}
          <p>{description}</p>
        {/if}
      </div>
      <div class="modal__actions">
        <button type="button" class="modal__cancel" on:click={() => dispatch('cancel')}>
          {cancelLabel}
        </button>
        <button type="button" class="modal__confirm" on:click={() => dispatch('confirm')} disabled={loading}>
          {#if loading}
            <span class="modal__spinner" aria-hidden="true"></span>
          {/if}
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: color-mix(in srgb, black 40%, transparent);
    backdrop-filter: blur(4px);
    z-index: 100;
    padding: var(--space-4);
  }

  .modal__dialog {
    inline-size: min(420px, 100%);
    border-radius: var(--radius-2);
    background: var(--color-surface-1);
    border: 1px solid var(--color-border);
    box-shadow: 0 32px 64px color-mix(in srgb, var(--color-bg) 70%, transparent);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-5);
  }

  h2 {
    margin: 0;
    font-size: 1.15rem;
    color: var(--color-text-primary);
  }

  p {
    margin: 0;
    color: var(--color-text-muted);
  }

  .modal__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
  }

  button {
    min-inline-size: 120px;
    min-block-size: 44px;
    border-radius: var(--radius-1);
    border: 1px solid var(--color-border);
    font: inherit;
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .modal__cancel {
    background: transparent;
    color: var(--color-text-muted);
  }

  .modal__cancel:hover,
  .modal__cancel:focus-visible {
    color: var(--color-text-primary);
    background: var(--color-surface-2);
    outline: none;
  }

  .modal__confirm {
    background: color-mix(in srgb, var(--color-danger) 18%, transparent);
    border-color: var(--color-danger);
    color: var(--color-text-primary);
  }

  .modal__confirm:hover,
  .modal__confirm:focus-visible {
    background: color-mix(in srgb, var(--color-danger) 28%, transparent);
    outline: none;
  }

  .modal__confirm:disabled {
    opacity: 0.6;
    cursor: progress;
  }

  .modal__spinner {
    inline-size: 16px;
    block-size: 16px;
    border-radius: 999px;
    border: 2px solid color-mix(in srgb, var(--color-danger) 30%, transparent);
    border-top-color: var(--color-danger);
    margin-inline-end: var(--space-2);
    animation: spin var(--motion-normal) linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
