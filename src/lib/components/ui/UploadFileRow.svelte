<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let file;
  export let disabled = false;
  export let removeLabel = 'Remove file';

  function formatSize(sizeInBytes) {
    if (!Number.isFinite(sizeInBytes) || sizeInBytes < 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = sizeInBytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }

    const rounded = unitIndex === 0 ? Math.round(value) : value.toFixed(1);
    return `${rounded} ${units[unitIndex]}`;
  }

  function handleRemove() {
    if (disabled) return;
    dispatch('remove');
  }
</script>

<div class="upload-file-row">
  <div class="upload-file-row__icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M8 3.75h5.5L18 8.25V19a1.75 1.75 0 0 1-1.75 1.75h-8.5A1.75 1.75 0 0 1 6 19V5.5A1.75 1.75 0 0 1 7.75 3.75Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M13 3.75V8.5h4.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </div>
  <div class="upload-file-row__meta">
    <p class="upload-file-row__name">{file?.name || ''}</p>
    <p class="upload-file-row__size">{formatSize(file?.size ?? 0)}</p>
  </div>
  <button
    type="button"
    class="upload-file-row__remove"
    aria-label={removeLabel}
    title={removeLabel}
    on:click={handleRemove}
    disabled={disabled}
  >
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
    </svg>
  </button>
</div>

<style>
  .upload-file-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border: 1px solid var(--upload-file-row-border);
    border-radius: 0.75rem;
    background: var(--upload-file-row-bg);
    padding: 0.8rem 1rem;
  }

  .upload-file-row__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    background: color-mix(in srgb, var(--ui-surface-secondary) 92%, transparent);
    color: var(--muted-foreground);
    flex: 0 0 auto;
  }

  .upload-file-row__icon svg {
    width: 1rem;
    height: 1rem;
  }

  .upload-file-row__meta {
    min-width: 0;
    display: grid;
    gap: 0.15rem;
    flex: 1;
  }

  .upload-file-row__name,
  .upload-file-row__size {
    margin: 0;
  }

  .upload-file-row__name {
    color: var(--upload-file-name);
    font-size: var(--font-size-sm);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .upload-file-row__size {
    color: var(--upload-file-size);
    font-size: var(--font-size-xs);
  }

  .upload-file-row__remove {
    border: 0;
    width: 30px;
    height: 30px;
    border-radius: var(--ui-radius-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--upload-file-remove);
    background: transparent;
    transition: color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard);
  }

  .upload-file-row__remove:hover:not(:disabled) {
    color: var(--upload-file-remove-hover);
    background: color-mix(in srgb, var(--color-danger) 15%, transparent);
  }

  .upload-file-row__remove:focus-visible {
    outline: none;
    box-shadow: var(--ui-focus-ring);
  }

  .upload-file-row__remove:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .upload-file-row__remove svg {
    width: 13px;
    height: 13px;
  }
</style>
