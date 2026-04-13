<script>
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';
  import FieldShell from './FieldShell.svelte';
  import ModalSurface from './ModalSurface.svelte';

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
</script>

<ModalSurface
  {open}
  width="min(560px, 100%)"
  className="guided-modal"
  on:close={close}
>
  <form class="guided-modal__form" on:submit={handleSubmit}>
    <header class="guided-modal__header">
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

    <FieldShell
      className="field-group"
      label={customLabel}
      forId="regenerate-custom-instruction"
      disabled={busy}
    >
      <textarea
        id="regenerate-custom-instruction"
        rows="4"
        maxlength="500"
        bind:value={customInstruction}
        placeholder={customPlaceholder}
        disabled={busy}
      ></textarea>
    </FieldShell>

    <footer class="modal-actions">
      <Button type="button" variant="secondary" on:click={close} disabled={busy}>
        {cancelLabel}
      </Button>
      <Button type="submit" variant="primary" loading={busy} disabled={busy}>
        {confirmLabel}
      </Button>
    </footer>
  </form>
</ModalSurface>

<style>
  .guided-modal__form {
    display: grid;
    gap: var(--space-3);
  }

  .guided-modal__header {
    display: grid;
    gap: var(--space-2);
  }

  .guided-modal__header h2 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 1rem;
    font-weight: 600;
  }

  .guided-modal__header p {
    margin: 0;
    color: var(--color-text-secondary);
    line-height: 1.45;
    font-size: var(--font-size-sm);
  }

  .field-group {
    display: grid;
    gap: var(--space-2);
  }

  .field-label {
    margin: 0;
    color: var(--color-text-primary);
    font-weight: 500;
    font-size: var(--font-size-xs);
  }

  .reasons-list {
    display: grid;
    gap: 0.4rem;
  }

  .reason-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.62rem;
    border: 1px solid var(--ui-border-subtle);
    border-radius: var(--ui-radius-sm);
    background: var(--ui-surface-base);
    cursor: pointer;
    transition: border-color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard);
  }

  .reason-option input {
    margin: 0;
    accent-color: var(--color-accent-primary);
  }

  .reason-option span {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .reason-option-active {
    border-color: var(--ui-border-accent);
    background: color-mix(in srgb, var(--color-accent-primary) 14%, transparent);
  }

  .reason-option-active span {
    color: var(--color-text-primary);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    margin-top: var(--space-1);
  }

  @media (max-width: 640px) {
    .modal-actions {
      flex-direction: column-reverse;
    }

    .modal-actions :global(.ui-button) {
      width: 100%;
    }
  }
</style>
