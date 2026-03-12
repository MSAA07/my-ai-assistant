<script>
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';
  import ModalSurface from './ModalSurface.svelte';
  import UploadDropzone from './UploadDropzone.svelte';
  import UploadFileRow from './UploadFileRow.svelte';

  const dispatch = createEventDispatcher();

  export let open = false;
  export let busy = false;
  export let maxFiles = 5;
  export let files = [];
  export let accept = '';
  export let multiple = true;

  export let title = '';
  export let description = '';
  export let dropzoneTitle = '';
  export let dropzoneOr = 'OR';
  export let browseLabel = '';
  export let supportLabel = '';
  export let cancelLabel = '';
  export let submitLabel = '';
  export let submitBusyLabel = '';
  export let removeFileLabel = '';
  export let closeLabel = '';
  export let errorMessage = '';

  $: activeFileName = files?.[0]?.name || '';
  $: canSubmit = Array.isArray(files) && files.length > 0 && !busy;

  function close() {
    if (busy) return;
    dispatch('close');
  }

  function handleSubmit() {
    dispatch('submit');
  }

  function handleFilesSelected(event) {
    dispatch('filesSelected', event.detail);
  }

  function removeFile(index) {
    dispatch('removeFile', { index });
  }
</script>

<ModalSurface
  {open}
  width="var(--upload-modal-width)"
  className="upload-modal"
  closeOnBackdrop={!busy}
  closeOnEscape={!busy}
  labelledBy="upload-modal-title"
  describedBy="upload-modal-description"
  on:close={close}
>
  <div class="upload-modal__header">
    <div class="upload-modal__titles">
      <h2 id="upload-modal-title">{title}</h2>
      <p id="upload-modal-description">{description}</p>
    </div>
    <button
      type="button"
      class="upload-modal__close"
      aria-label={closeLabel}
      title={closeLabel}
      on:click={close}
      disabled={busy}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
      </svg>
    </button>
  </div>

  <UploadDropzone
    id="upload-modal-input"
    {accept}
    {multiple}
    disabled={busy}
    isBusy={busy}
    title={dropzoneTitle}
    orLabel={dropzoneOr}
    {browseLabel}
    {activeFileName}
    on:filesSelected={handleFilesSelected}
  />

  <p class="upload-modal__support">{supportLabel}</p>

  {#if errorMessage}
    <p class="upload-modal__error" role="alert">{errorMessage}</p>
  {/if}

  {#if files.length > 0}
    <div class="upload-modal__files" role="list" aria-label="Selected files">
      {#each files as file, index (file.name + file.size + index)}
        <div role="listitem">
          <UploadFileRow
            {file}
            disabled={busy}
            removeLabel={removeFileLabel}
            on:remove={() => removeFile(index)}
          />
        </div>
      {/each}
    </div>
  {/if}

  <footer class="upload-modal__footer">
    <p class="upload-modal__counter">{files.length}/{maxFiles}</p>
    <div class="upload-modal__actions">
      <Button type="button" variant="secondary" class="upload-modal__cancel" on:click={close} disabled={busy}>
        {cancelLabel}
      </Button>
      <Button
        type="button"
        variant="primary"
        class="upload-modal__submit"
        on:click={handleSubmit}
        disabled={!canSubmit}
        loading={busy}
      >
        {busy ? submitBusyLabel : submitLabel}
      </Button>
    </div>
  </footer>
</ModalSurface>

<style>
  :global(.upload-modal.ui-modal) {
    background: var(--upload-modal-bg);
    border-color: var(--ui-border-strong);
    box-shadow: var(--upload-modal-shadow);
    gap: var(--space-3);
  }

  .upload-modal__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .upload-modal__titles {
    display: grid;
    gap: var(--space-1);
  }

  .upload-modal__titles h2,
  .upload-modal__titles p,
  .upload-modal__support,
  .upload-modal__counter {
    margin: 0;
  }

  .upload-modal__titles h2 {
    color: var(--upload-modal-title);
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0;
  }

  .upload-modal__titles p {
    color: var(--upload-modal-description);
    font-size: var(--font-size-sm);
    line-height: 1.45;
  }

  .upload-modal__close {
    border: 1px solid var(--ui-border-subtle);
    background: var(--ui-surface-base);
    color: var(--upload-close-color);
    width: var(--ui-control-height-md);
    height: var(--ui-control-height-md);
    border-radius: var(--ui-radius-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard);
  }

  .upload-modal__close:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ui-surface-base) 88%, white 12%);
    border-color: var(--ui-border-strong);
  }

  .upload-modal__close:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring);
  }

  .upload-modal__close:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .upload-modal__close svg {
    width: 14px;
    height: 14px;
  }

  .upload-modal__support {
    color: var(--upload-support-text);
    font-size: var(--font-size-xs);
  }

  .upload-modal__error {
    margin: 0;
    color: color-mix(in srgb, var(--color-danger) 72%, var(--color-text-primary) 28%);
    font-size: var(--font-size-xs);
  }

  .upload-modal__files {
    display: grid;
    gap: var(--space-2);
  }

  .upload-modal__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    border-top: 1px solid var(--upload-footer-border);
    padding-top: var(--space-3);
    margin-top: var(--space-1);
  }

  .upload-modal__counter {
    color: var(--upload-support-text);
    font-size: var(--font-size-xs);
  }

  .upload-modal__actions {
    display: flex;
    gap: var(--space-2);
  }

  :global(.upload-modal__cancel.ui-button) {
    min-width: 120px;
  }

  :global(.upload-modal__submit.ui-button) {
    min-width: 120px;
  }

  @media (max-width: 720px) {
    .upload-modal__footer {
      flex-direction: column;
      align-items: stretch;
    }

    .upload-modal__counter {
      text-align: center;
    }

    .upload-modal__actions {
      width: 100%;
    }

    :global(.upload-modal__actions .ui-button) {
      flex: 1;
      min-width: 0;
    }
  }
</style>
