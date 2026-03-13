<script>
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';

  const dispatch = createEventDispatcher();

  export let id = 'upload-dropzone-input';
  export let accept = '';
  export let multiple = true;
  export let disabled = false;
  export let isBusy = false;
  export let title = '';
  export let orLabel = 'OR';
  export let browseLabel = '';
  export let activeFileName = '';

  let isDragActive = false;

  function emitFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    dispatch('filesSelected', { files });
  }

  function handleInputChange(event) {
    if (disabled || isBusy) {
      event.target.value = '';
      return;
    }

    emitFiles(event.target.files);
    event.target.value = '';
  }

  function handleDragOver(event) {
    event.preventDefault();
    if (disabled || isBusy) return;
    isDragActive = true;
  }

  function handleDragLeave(event) {
    event.preventDefault();
    isDragActive = false;
  }

  function handleDrop(event) {
    event.preventDefault();
    if (disabled || isBusy) {
      isDragActive = false;
      return;
    }

    emitFiles(event.dataTransfer?.files);
    isDragActive = false;
  }

  function openFilePicker() {
    if (disabled || isBusy) return;
    document.getElementById(id)?.click();
  }

  function handleBrowseClick(event) {
    event.stopPropagation();
    openFilePicker();
  }
</script>

<div
  class="upload-dropzone"
  class:upload-dropzone--active={isDragActive}
  class:upload-dropzone--disabled={disabled || isBusy}
  role="button"
  tabindex="0"
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  on:click={openFilePicker}
  on:keydown={(event) => (event.key === 'Enter' || event.key === ' ') && openFilePicker()}
>
  <input
    id={id}
    type="file"
    {accept}
    {multiple}
    on:change={handleInputChange}
    disabled={disabled || isBusy}
  />

  <div class="upload-dropzone__icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 15V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M8.5 10.5L12 7l3.5 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M6 17.5h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  </div>

  {#if activeFileName}
    <div class="upload-dropzone__drag-chip">{activeFileName}</div>
  {/if}

  <p class="upload-dropzone__title">{title}</p>

  <div class="upload-dropzone__divider" aria-hidden="true">
    <span></span>
    <strong>{orLabel}</strong>
    <span></span>
  </div>

  <Button
    type="button"
    variant="outline"
    class="upload-dropzone__browse"
    disabled={disabled || isBusy}
    on:click={handleBrowseClick}
  >
    {browseLabel}
  </Button>
</div>

<style>
  .upload-dropzone {
    position: relative;
    display: grid;
    justify-items: center;
    gap: 0.875rem;
    border: 1px dashed color-mix(in srgb, var(--foreground) 10%, transparent);
    border-radius: 0.95rem;
    background: color-mix(in srgb, var(--card) 74%, var(--muted) 26%);
    padding: clamp(1.25rem, 4vw, 1.8rem) var(--space-3);
    text-align: center;
    transition: border-color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard);
    cursor: pointer;
  }

  .upload-dropzone:hover:not(.upload-dropzone--disabled),
  .upload-dropzone--active {
    border-color: color-mix(in srgb, var(--foreground) 16%, transparent);
    background: color-mix(in srgb, var(--card) 60%, var(--muted) 40%);
    box-shadow: var(--shadow-inline-control);
  }

  .upload-dropzone--disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .upload-dropzone input {
    display: none;
  }

  .upload-dropzone__icon {
    width: 48px;
    height: 48px;
    border-radius: 0.875rem;
    background: var(--muted);
    border: 1px solid color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    color: var(--foreground);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .upload-dropzone__icon svg {
    width: 22px;
    height: 22px;
  }

  .upload-dropzone__drag-chip {
    position: absolute;
    top: 0.6rem;
    right: 0.6rem;
    max-width: min(56%, 420px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: var(--ui-radius-pill);
    background: var(--upload-drag-chip-bg);
    color: var(--upload-drag-chip-text);
    font-size: var(--font-size-xs);
    font-weight: 600;
    padding: 0.32rem 0.55rem;
  }

  .upload-dropzone__title {
    margin: 0;
    color: var(--upload-dropzone-text);
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.45;
    max-width: 36rem;
  }

  .upload-dropzone__divider {
    width: min(420px, 100%);
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: var(--space-3);
  }

  .upload-dropzone__divider span {
    display: block;
    border-top: 1px solid var(--ui-border-subtle);
  }

  .upload-dropzone__divider strong {
    color: var(--upload-dropzone-or);
    font-size: var(--font-size-xs);
    font-weight: 500;
  }

  :global(.upload-dropzone__browse.ui-button) {
    min-width: 140px;
  }

  @media (max-width: 640px) {
    .upload-dropzone {
      gap: var(--space-2);
      padding-inline: var(--space-3);
    }

    .upload-dropzone__drag-chip {
      position: static;
      max-width: 100%;
    }

    .upload-dropzone__title {
      font-size: var(--font-size-sm);
    }

    :global(.upload-dropzone__browse.ui-button) {
      width: 100%;
      min-width: 0;
    }
  }
</style>
