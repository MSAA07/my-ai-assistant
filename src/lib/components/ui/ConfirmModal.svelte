<script>
  import { createEventDispatcher } from 'svelte';
  import { t } from '../../i18n/t.js';
  import Button from './Button.svelte';
  import ModalSurface from './ModalSurface.svelte';

  const dispatch = createEventDispatcher();

  export let open = false;
  export let title = t('confirmModal.title');
  export let description = t('confirmModal.description');
  export let confirmLabel = t('confirmModal.confirm');
  export let cancelLabel = t('confirmModal.cancel');

  function close() {
    dispatch('cancel');
  }

  function confirm() {
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
  <div class="confirm-modal-content">
    <h2 id="confirm-modal-title">{title}</h2>
    <p>{description}</p>

    <div class="modal-actions">
      <Button type="button" variant="ghost" on:click={close}>
        {cancelLabel}
      </Button>
      <Button type="button" variant="danger" on:click={confirm}>
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
