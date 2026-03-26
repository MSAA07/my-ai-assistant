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
  export let className = '';

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

  $: canSubmit = Array.isArray(files) && files.length > 0 && !busy;
  $: showFooter = busy || files.length > 0 || showCounter;

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

<section
  class={['upload-panel', className, $$props.class ?? ''].filter(Boolean).join(' ')}
  aria-label={title}
>
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

  {#if showFooter}
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
  {/if}
</section>

<style>
  .upload-panel {
    display: grid;
    gap: var(--upload-panel-gap);
    padding: var(--upload-panel-padding);
    border-radius: var(--ui-radius-md);
    border: 1px solid var(--upload-panel-border);
    background: var(--upload-panel-bg);
    box-shadow: var(--upload-panel-shadow);
  }

  .upload-panel__header {
    display: grid;
    gap: var(--ui-space-1);
  }

  .upload-panel__titles {
    display: grid;
    gap: var(--ui-space-1);
  }

  .upload-panel__titles h2,
  .upload-panel__titles p,
  .upload-panel__support,
  .upload-panel__counter {
    margin: 0;
  }

  .upload-panel__titles h2 {
    color: var(--upload-panel-title);
    font-size: var(--ui-type-title-sm);
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .upload-panel__titles p {
    max-width: 32rem;
    color: var(--upload-panel-description);
    font-size: var(--font-size-sm);
    line-height: 1.5;
  }

  .upload-panel__support {
    margin-top: -0.125rem;
    color: var(--upload-panel-support);
    font-size: var(--font-size-xs);
  }

  .upload-panel__error {
    margin: 0;
    color: var(--upload-panel-error);
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
    border-top: 1px solid var(--upload-footer-border);
    padding-top: var(--ui-space-4);
  }

  .upload-panel__counter {
    color: var(--upload-panel-support);
    font-size: var(--font-size-xs);
  }

  .upload-panel__actions {
    display: flex;
    gap: 0.75rem;
  }

  :global(.upload-panel__cancel.ui-button) {
    min-width: 6.5rem;
  }

  :global(.upload-panel__submit.ui-button) {
    min-width: 6.5rem;
    box-shadow: none;
  }

  @media (max-width: 720px) {
    .upload-panel__footer {
      flex-direction: row;
      align-items: center;
      flex-wrap: wrap;
    }

    .upload-panel__counter {
      text-align: left;
    }

    .upload-panel__actions {
      width: min(100%, 228px);
      margin-left: auto;
    }

    :global(.upload-panel__actions .ui-button) {
      flex: 1 1 0;
      min-width: 0;
    }
  }
</style>
