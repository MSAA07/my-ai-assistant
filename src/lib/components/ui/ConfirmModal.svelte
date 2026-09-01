<script>
  import { createEventDispatcher } from 'svelte';
  import { t } from '../../i18n/t.js';
  import Button from './Button.svelte';
  import FieldShell from './FieldShell.svelte';
  import ModalSurface from './ModalSurface.svelte';

  const dispatch = createEventDispatcher();

  export let open = false;
  export let title = t('confirmModal.title');
  export let description = t('confirmModal.description');
  export let confirmLabel = t('confirmModal.confirm');
  export let cancelLabel = t('confirmModal.cancel');
  export let severity = 'danger';
  export let typedConfirmation = null;
  export let busy = false;

  let typedValue = '';

  $: requiredValue = typedConfirmation?.value ?? '';
  $: caseSensitive = typedConfirmation?.caseSensitive !== false;
  $: normalizedTypedValue = caseSensitive ? typedValue : typedValue.toLowerCase();
  $: normalizedRequiredValue = caseSensitive ? requiredValue : requiredValue.toLowerCase();
  $: typedMatches = !requiredValue || normalizedTypedValue === normalizedRequiredValue;
  $: confirmVariant = severity === 'danger' ? 'danger' : severity === 'warning' ? 'warning' : 'primary';

  $: if (!open) typedValue = '';

  function close() {
    dispatch('cancel');
  }

  function confirm() {
    if (!typedMatches || busy) return;
    dispatch('confirm');
  }
</script>

<ModalSurface
  {open}
  width="min(420px, 100%)"
  labelledBy="confirm-modal-title"
  on:close={close}
  className="confirm-modal"
>
  <div class="confirm-modal-content" data-severity={severity}>
    <h2 id="confirm-modal-title">{title}</h2>
    <p>{description}</p>

    {#if requiredValue}
      <div class="typed-confirmation">
        <p>
          {typedConfirmation?.prompt || 'Type'}
          <strong>{requiredValue}</strong>
          {typedConfirmation?.suffix || 'to continue.'}
        </p>
        <FieldShell label={typedConfirmation?.label || 'Confirmation'} forId="confirm-modal-typed-value">
          <input
            id="confirm-modal-typed-value"
            autocomplete="off"
            spellcheck="false"
            bind:value={typedValue}
          />
        </FieldShell>
      </div>
    {/if}

    <div class="modal-actions">
      <Button type="button" variant="ghost" on:click={close} disabled={busy}>
        {cancelLabel}
      </Button>
      <Button type="button" variant={confirmVariant} on:click={confirm} disabled={!typedMatches} loading={busy}>
        {confirmLabel}
      </Button>
    </div>
  </div>
</ModalSurface>

<style>
  .confirm-modal-content {
    display: grid;
    gap: var(--space-2);
  }

  .confirm-modal-content h2 {
    margin: 0;
    font-size: 1.02rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .confirm-modal-content p {
    margin: 0;
    color: var(--color-text-secondary);
    line-height: 1.45;
    font-size: var(--font-size-sm);
  }

  .confirm-modal-content[data-severity='warning'] {
    border-inline-start: 3px solid var(--ui-accent-warning);
    padding-inline-start: var(--ui-space-3);
  }

  .confirm-modal-content[data-severity='danger'] {
    border-inline-start: 3px solid var(--ui-accent-danger);
    padding-inline-start: var(--ui-space-3);
  }

  .typed-confirmation {
    display: grid;
    gap: var(--ui-space-2);
    padding: var(--ui-space-3);
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-sm);
    background: var(--ui-surface-secondary);
  }

  .typed-confirmation p strong {
    display: inline-block;
    margin-inline: 0.3rem;
    color: var(--ui-text-primary);
    font-family: var(--font-family-mono);
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
