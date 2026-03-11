<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let open = false;
  export let busy = false;
  export let title = '';
  export let description = '';
  export let reasonLabel = '';
  export let customLabel = '';
  export let customPlaceholder = '';
  export let confirmLabel = '';
  export let cancelLabel = '';
  export let reasons = [];

  let selectedReason = '';
  let customInstruction = '';
  let wasOpen = false;

  $: if (open && !wasOpen) {
    selectedReason = reasons?.[0]?.value ?? '';
    customInstruction = '';
  }

  $: wasOpen = open;

  function close() {
    if (busy) return;
    dispatch('cancel');
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;

    dispatch('confirm', {
      reasonKey: selectedReason,
      customInstruction: customInstruction.trim(),
    });
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      close();
    }
  }
</script>

{#if open}
  <div class="overlay" role="presentation" on:click={handleOverlayClick}>
    <form class="modal" on:submit={handleSubmit}>
      <header class="modal-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>

      <section class="field-group">
        <p class="field-label">{reasonLabel}</p>
        <div class="reasons-list" role="radiogroup" aria-label={reasonLabel}>
          {#each reasons as reason (reason.value)}
            <label class="reason-option" class:reason-option-active={selectedReason === reason.value}>
              <input
                type="radio"
                name="regenerate-reason"
                value={reason.value}
                bind:group={selectedReason}
                disabled={busy}
              />
              <span>{reason.label}</span>
            </label>
          {/each}
        </div>
      </section>

      <section class="field-group">
        <label class="field-label" for="regenerate-custom-instruction">{customLabel}</label>
        <textarea
          id="regenerate-custom-instruction"
          rows="4"
          maxlength="500"
          bind:value={customInstruction}
          placeholder={customPlaceholder}
          disabled={busy}
        ></textarea>
      </section>

      <footer class="modal-actions">
        <button type="button" class="secondary" on:click={close} disabled={busy}>
          {cancelLabel}
        </button>
        <button type="submit" class="primary" disabled={busy}>
          {busy ? `${confirmLabel}...` : confirmLabel}
        </button>
      </footer>
    </form>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: var(--space-4);
    background: var(--color-backdrop-strong);
    z-index: 999;
  }

  .modal {
    width: min(560px, 100%);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    background: var(--color-surface-1);
    padding: var(--space-5);
    display: grid;
    gap: var(--space-4);
    box-shadow: var(--shadow-menu);
  }

  .modal-header {
    display: grid;
    gap: var(--space-2);
  }

  .modal-header h2 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 1.2rem;
  }

  .modal-header p {
    margin: 0;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .field-group {
    display: grid;
    gap: var(--space-2);
  }

  .field-label {
    margin: 0;
    color: var(--color-text-primary);
    font-weight: 600;
    font-size: 0.92rem;
  }

  .reasons-list {
    display: grid;
    gap: 0.55rem;
  }

  .reason-option {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.65rem 0.8rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-1);
    background: var(--color-surface-2);
    cursor: pointer;
    transition: border-color var(--motion-fast) var(--ease-standard);
  }

  .reason-option input {
    margin: 0;
    accent-color: var(--color-accent-primary);
  }

  .reason-option span {
    color: var(--color-text-secondary);
    font-size: 0.95rem;
  }

  .reason-option-active {
    border-color: color-mix(in srgb, var(--color-accent-primary) 70%, var(--color-border) 30%);
  }

  .reason-option-active span {
    color: var(--color-text-primary);
  }

  textarea {
    width: 100%;
    resize: vertical;
    min-height: 92px;
    border-radius: var(--radius-1);
    border: 1px solid var(--color-border);
    background: var(--color-surface-2);
    color: var(--color-text-primary);
    padding: 0.75rem 0.85rem;
    font: inherit;
    line-height: 1.5;
  }

  textarea:focus {
    outline: none;
    border-color: var(--color-accent-primary);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
  }

  button {
    min-height: 42px;
    border-radius: var(--radius-1);
    border: 1px solid var(--color-border);
    padding: 0 1rem;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .secondary {
    background: var(--color-surface-2);
    color: var(--color-text-primary);
  }

  .primary {
    background: var(--gradient-accent-strong);
    color: var(--color-bg);
    border-color: transparent;
  }

  @media (max-width: 640px) {
    .modal {
      padding: var(--space-4);
    }

    .modal-actions {
      flex-direction: column;
    }

    .modal-actions button {
      width: 100%;
    }
  }
</style>
