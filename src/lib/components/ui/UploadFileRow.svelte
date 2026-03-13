<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let file;
  export let disabled = false;
  export let removeLabel = 'Remove file';

  $: extensionLabel = (file?.name?.split('.').pop() || 'FILE').slice(0, 4).toUpperCase();

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
  <div class="upload-file-row__icon" aria-hidden="true">{extensionLabel}</div>
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
    gap: var(--space-2);
    border: 1px solid color-mix(in srgb, var(--foreground) 8%, var(--border) 92%);
    border-radius: 0.9rem;
    background: color-mix(in srgb, var(--card) 76%, var(--muted) 24%);
    box-shadow: var(--shadow-inline-control);
    padding: 0.8rem 1rem;
  }

  .upload-file-row__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: calc(var(--radius) - 2px);
    background: color-mix(in srgb, var(--background) 78%, var(--muted) 22%);
    color: var(--muted-foreground);
    font-size: 0.64rem;
    font-weight: 600;
    letter-spacing: 0.03em;
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
