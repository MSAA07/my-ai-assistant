<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { t } from '../../i18n/t.js';

  const dispatch = createEventDispatcher();

  export let open = false;
  export let title = t('confirmModal.title');
  export let description = t('confirmModal.description');
  export let confirmLabel = t('confirmModal.confirm');
  export let cancelLabel = t('confirmModal.cancel');

  let modalElement;

  function close() {
    dispatch('cancel');
  }

  function confirm() {
    dispatch('confirm');
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      close();
    }
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeydown);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeydown);
      }
    };
  });
</script>

{#if open}
  <div
    class="modal-overlay"
    role="presentation"
    tabindex="-1"
    transition:fade={{ duration: 120 }}
    on:click={handleOverlayClick}
    on:keydown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        close();
      }
    }}
  >
    <div
      class="modal"
      bind:this={modalElement}
      transition:fly={{ y: 12, duration: 180, easing: t => t }}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <h2 id="confirm-modal-title">{title}</h2>
      <p>{description}</p>
      <div class="modal-actions">
        <button type="button" class="cancel" on:click={close}>
          {cancelLabel}
        </button>
        <button type="button" class="confirm" on:click={confirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-backdrop-strong);
    backdrop-filter: blur(6px);
    z-index: 999;
    padding: var(--space-4);
  }

  .modal {
    width: min(420px, 100%);
    background: var(--color-surface-1);
    border-radius: var(--radius-2);
    border: 1px solid var(--color-border);
    padding: var(--space-5);
    box-shadow: 0 20px 50px var(--color-shadow);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  h2 {
    margin: 0;
    font-size: 1.35rem;
    color: var(--color-text-primary);
  }

  p {
    margin: 0;
    color: var(--color-text-secondary);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    margin-top: var(--space-4);
  }

  button {
    min-width: 120px;
    min-height: 44px;
    border-radius: var(--radius-1);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--motion-fast) var(--ease-standard);
    border: 1px solid transparent;
  }

  .cancel {
    background: transparent;
    color: var(--color-text-primary);
    border-color: var(--color-border);
  }

  .cancel:hover {
    border-color: var(--color-accent-primary);
  }

  .confirm {
    background: var(--color-danger);
    color: var(--color-bg);
    border-color: var(--color-danger);
  }

  .confirm:hover {
    filter: brightness(1.08);
  }
</style>
