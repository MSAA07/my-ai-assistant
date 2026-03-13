<script>
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';
  import UploadDropzone from './UploadDropzone.svelte';
  import UploadFileRow from './UploadFileRow.svelte';

  const dispatch = createEventDispatcher();

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
  export let showCounter = true;
  export let cancelLabel = '';
  export let submitLabel = '';
  export let submitBusyLabel = '';
  export let removeFileLabel = '';
  export let errorMessage = '';

  $: activeFileName = files?.[0]?.name || '';
  $: canSubmit = Array.isArray(files) && files.length > 0 && !busy;

  function handleSubmit() {
    dispatch('submit');
  }

  function handleCancel() {
    if (busy) return;
    dispatch('cancel');
  }

  function handleFilesSelected(event) {
    dispatch('filesSelected', event.detail);
  }

  function removeFile(index) {
    dispatch('removeFile', { index });
  }
</script>

<section class="upload-panel" aria-label={title}>
  <div class="upload-panel__header">
    <div class="upload-panel__titles">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  </div>

  <UploadDropzone
    id="upload-panel-input"
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

  <p class="upload-panel__support">{supportLabel}</p>

  {#if errorMessage}
    <p class="upload-panel__error" role="alert">{errorMessage}</p>
  {/if}

  {#if files.length > 0}
    <div class="upload-panel__files" role="list" aria-label="Selected files">
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

  <footer class="upload-panel__footer">
    {#if showCounter}
      <p class="upload-panel__counter">{files.length}/{maxFiles}</p>
    {/if}
    <div class="upload-panel__actions">
      <Button type="button" variant="outline" class="upload-panel__cancel" on:click={handleCancel} disabled={busy}>
        {cancelLabel}
      </Button>
      <Button
        type="button"
        variant="primary"
        class="upload-panel__submit"
        on:click={handleSubmit}
        disabled={!canSubmit}
        loading={busy}
      >
        {busy ? submitBusyLabel : submitLabel}
      </Button>
    </div>
  </footer>
</section>

<style>
  .upload-panel {
    display: grid;
    gap: 1.25rem;
    padding: 1.5rem;
    border-radius: 1rem;
    border: 1px solid color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    background: var(--upload-modal-bg);
    box-shadow: var(--shadow-card);
  }

  .upload-panel__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .upload-panel__titles {
    display: grid;
    gap: var(--space-1);
  }

  .upload-panel__titles h2,
  .upload-panel__titles p,
  .upload-panel__support,
  .upload-panel__counter {
    margin: 0;
  }

  .upload-panel__titles h2 {
    color: var(--upload-modal-title);
    font-size: 1.08rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .upload-panel__titles p {
    color: var(--upload-modal-description);
    font-size: var(--font-size-sm);
    line-height: 1.6;
  }

  .upload-panel__support {
    color: var(--upload-support-text);
    font-size: var(--font-size-xs);
  }

  .upload-panel__error {
    margin: 0;
    color: color-mix(in srgb, var(--color-danger) 72%, var(--color-text-primary) 28%);
    font-size: var(--font-size-sm);
    line-height: 1.5;
  }

  .upload-panel__files {
    display: grid;
    gap: var(--space-2);
  }

  .upload-panel__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    border-top: 1px solid color-mix(in srgb, var(--foreground) 8%, var(--border) 92%);
    padding-top: 1rem;
    margin-top: var(--space-1);
  }

  .upload-panel__counter {
    color: var(--upload-support-text);
    font-size: var(--font-size-xs);
  }

  .upload-panel__actions {
    display: flex;
    gap: var(--space-2);
  }

  :global(.upload-panel__cancel.ui-button) {
    min-width: 120px;
  }

  :global(.upload-panel__submit.ui-button) {
    min-width: 120px;
  }

  @media (max-width: 720px) {
    .upload-panel {
      padding: var(--space-4);
    }

    .upload-panel__footer {
      flex-direction: column;
      align-items: stretch;
    }

    .upload-panel__counter {
      text-align: center;
    }

    .upload-panel__actions {
      width: 100%;
    }

    :global(.upload-panel__actions .ui-button) {
      flex: 1;
      min-width: 0;
    }
  }
</style>
