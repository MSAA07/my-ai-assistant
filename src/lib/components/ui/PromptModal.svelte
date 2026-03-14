<script>
  import { createEventDispatcher } from 'svelte';
  import { tick } from 'svelte';
  import { t } from '../../i18n/t.js';
  import Button from './Button.svelte';
  import FieldShell from './FieldShell.svelte';
  import ModalSurface from './ModalSurface.svelte';

  const dispatch = createEventDispatcher();

  export let open = false;
  export let title = '';
  export let description = '';
  export let label = '';
  export let value = '';
  export let placeholder = '';
  export let confirmLabel = t('confirmModal.confirm');
  export let cancelLabel = t('confirmModal.cancel');
  export let confirmDisabled = false;
  export let confirmLoading = false;
  export let inputId = 'prompt-modal-input';

  let inputEl;

  $: if (open) {
    void focusInput();
  }

  async function focusInput() {
    await tick();
    inputEl?.focus();
    inputEl?.select?.();
  }

  function close() {
    dispatch('cancel');
  }

  function handleInput(event) {
    dispatch('change', event.currentTarget.value);
  }

  function confirm() {
    if (confirmDisabled || confirmLoading) {
      return;
    }

    dispatch('confirm', { value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    confirm();
  }
</script>

<ModalSurface
  {open}
  width="min(420px, 100%)"
  labelledBy="prompt-modal-title"
  describedBy={description ? 'prompt-modal-description' : ''}
  on:close={close}
  className="prompt-modal"
>
  <form class="prompt-modal-content" on:submit={handleSubmit}>
    <h2 id="prompt-modal-title">{title}</h2>
    {#if description}
      <p id="prompt-modal-description">{description}</p>
    {/if}

    <FieldShell label={label} forId={inputId}>
      <input
        bind:this={inputEl}
        id={inputId}
        type="text"
        value={value}
        placeholder={placeholder}
        autocomplete="off"
        spellcheck="false"
        on:input={handleInput}
      />
    </FieldShell>

    <div class="modal-actions">
      <Button type="button" variant="ghost" on:click={close} disabled={confirmLoading}>
        {cancelLabel}
      </Button>
      <Button type="submit" variant="primary" disabled={confirmDisabled} loading={confirmLoading}>
        {confirmLabel}
      </Button>
    </div>
  </form>
</ModalSurface>

<style>
  .prompt-modal-content {
    display: grid;
    gap: var(--space-2);
  }

  .prompt-modal-content h2 {
    margin: 0;
    font-size: 1.02rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .prompt-modal-content p {
    margin: 0;
    color: var(--color-text-secondary);
    line-height: 1.45;
    font-size: var(--font-size-sm);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }

  @media (max-width: 520px) {
    .modal-actions {
      flex-direction: column-reverse;
    }
  }
</style>
