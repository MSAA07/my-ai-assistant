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
  export let description = '';
  export let supportText = '';
  export let orLabel = 'OR';
  export let browseLabel = '';
  export let activeFileName = '';
  export let className = '';
  export let variant = 'default';

  $: isHero = variant === 'hero';
  $: isCompact = variant === 'compact';
  $: isSurface = variant === 'surface';

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

<label
  class={['upload-dropzone', className, $$props.class ?? ''].filter(Boolean).join(' ')}
  class:upload-dropzone--active={isDragActive}
  class:upload-dropzone--disabled={disabled || isBusy}
  class:upload-dropzone--hero={isHero}
  class:upload-dropzone--compact={isCompact}
  class:upload-dropzone--surface={isSurface}
  for={id}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
>
  <input
    id={id}
    type="file"
    {accept}
    {multiple}
    on:change={handleInputChange}
    disabled={disabled || isBusy}
  />

  {#if !isCompact}
    <div class="upload-dropzone__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 15V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <path d="M8.5 10.5L12 7l3.5 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M6 17.5h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>
  {/if}

  {#if activeFileName}
    <div class="upload-dropzone__drag-chip">{activeFileName}</div>
  {/if}

  <p class="upload-dropzone__title">{title}</p>

  {#if description}
    <p class="upload-dropzone__description">{description}</p>
  {/if}

  {#if !isCompact && !isSurface}
    <div class="upload-dropzone__divider" aria-hidden="true">
      <span></span>
      <strong>{orLabel}</strong>
      <span></span>
    </div>
  {/if}

  {#if supportText}
    <p class="upload-dropzone__support">{supportText}</p>
  {/if}

  {#if !isSurface}
    <Button
      type="button"
      variant="outline"
      class="upload-dropzone__browse"
      disabled={disabled || isBusy}
      on:click={handleBrowseClick}
    >
      {browseLabel}
    </Button>
  {/if}
</label>

<style>
  .upload-dropzone {
    position: relative;
    display: grid;
    justify-items: center;
    gap: var(--upload-dropzone-gap);
    border: var(--upload-dropzone-border-width) dashed var(--upload-dropzone-border);
    border-radius: var(--upload-dropzone-radius);
    background: var(--upload-dropzone-bg);
    padding: var(--upload-dropzone-padding-block) var(--upload-dropzone-padding-inline);
    text-align: center;
    transition: border-color var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard);
    cursor: pointer;
  }

  .upload-dropzone--hero {
    gap: var(--ui-space-3);
    border-style: solid;
    border-radius: calc(var(--upload-dropzone-radius) + 0.5rem);
    background:
      radial-gradient(circle at top, color-mix(in srgb, var(--ui-text-primary) 7%, transparent) 0%, transparent 48%),
      linear-gradient(180deg, color-mix(in srgb, var(--ui-surface-card) 94%, transparent) 0%, color-mix(in srgb, var(--ui-surface-secondary) 88%, transparent) 100%);
    box-shadow:
      inset 0 1px 0 color-mix(in srgb, var(--ui-text-primary) 6%, transparent),
      0 12px 30px rgba(0, 0, 0, 0.08);
  }

  .upload-dropzone--compact {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    justify-items: stretch;
    gap: var(--ui-space-3);
    padding: var(--ui-space-3) var(--upload-dropzone-padding-inline);
    text-align: left;
  }

  .upload-dropzone--surface {
    min-height: clamp(14rem, 30vw, 16rem);
    align-content: center;
    justify-items: center;
    gap: var(--ui-space-2);
    border-style: dashed;
    border-width: 1.5px;
    border-radius: var(--ui-radius-lg);
    background: color-mix(in srgb, var(--ui-surface-card) 92%, transparent);
  }

  .upload-dropzone:hover:not(.upload-dropzone--disabled),
  .upload-dropzone--active {
    border-color: var(--upload-dropzone-hover-border);
    background: var(--upload-dropzone-hover-bg);
  }

  .upload-dropzone--hero:hover:not(.upload-dropzone--disabled),
  .upload-dropzone--hero.upload-dropzone--active {
    background:
      radial-gradient(circle at top, color-mix(in srgb, var(--ui-text-primary) 10%, transparent) 0%, transparent 52%),
      linear-gradient(180deg, color-mix(in srgb, var(--ui-surface-card) 90%, transparent) 0%, color-mix(in srgb, var(--ui-surface-secondary) 82%, transparent) 100%);
    box-shadow:
      inset 0 1px 0 color-mix(in srgb, var(--ui-text-primary) 8%, transparent),
      0 16px 38px rgba(0, 0, 0, 0.12);
  }

  .upload-dropzone--surface:hover:not(.upload-dropzone--disabled) {
    border-color: color-mix(in srgb, var(--ui-text-primary) 20%, var(--ui-border-default) 80%);
    background: color-mix(in srgb, var(--ui-surface-secondary) 44%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ui-text-primary) 6%, transparent);
  }

  .upload-dropzone--surface.upload-dropzone--active {
    border-color: color-mix(in srgb, var(--ui-text-primary) 28%, var(--ui-border-default) 72%);
    background: color-mix(in srgb, var(--ui-surface-secondary) 58%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ui-text-primary) 10%, transparent);
  }

  .upload-dropzone--disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .upload-dropzone input {
    display: none;
  }

  .upload-dropzone__icon {
    width: var(--upload-dropzone-icon-size);
    height: var(--upload-dropzone-icon-size);
    border-radius: var(--upload-dropzone-icon-radius);
    background: var(--upload-dropzone-icon-bg);
    border: 1px solid var(--upload-dropzone-icon-border);
    color: var(--upload-dropzone-icon-color);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .upload-dropzone--hero .upload-dropzone__icon {
    width: clamp(3rem, 4vw, 3.75rem);
    height: clamp(3rem, 4vw, 3.75rem);
    border-radius: var(--ui-radius-md);
    background:
      radial-gradient(circle at top left, color-mix(in srgb, var(--ui-text-primary) 12%, transparent) 0%, transparent 52%),
      color-mix(in srgb, var(--ui-surface-secondary) 82%, transparent);
    border-color: color-mix(in srgb, var(--ui-text-primary) 10%, var(--ui-border-default) 90%);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--ui-text-primary) 6%, transparent);
  }

  .upload-dropzone--surface .upload-dropzone__icon {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: var(--ui-radius-md);
    background: color-mix(in srgb, var(--ui-surface-secondary) 78%, transparent);
    border-color: color-mix(in srgb, var(--ui-text-primary) 10%, var(--ui-border-default) 90%);
  }

  .upload-dropzone--compact .upload-dropzone__drag-chip {
    top: var(--ui-space-2);
    inset-inline-end: var(--ui-space-2);
  }

  .upload-dropzone__icon svg {
    width: 22px;
    height: 22px;
  }

  .upload-dropzone--hero .upload-dropzone__icon svg {
    width: 24px;
    height: 24px;
  }

  .upload-dropzone--surface .upload-dropzone__icon svg {
    width: 24px;
    height: 24px;
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
    max-width: 36rem;
    color: var(--upload-dropzone-title);
    font-size: 0.95rem;
    font-weight: 500;
    line-height: 1.45;
  }

  .upload-dropzone--hero .upload-dropzone__title {
    max-width: 28rem;
    font-size: clamp(1rem, 0.95rem + 0.3vw, 1.1rem);
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .upload-dropzone--surface .upload-dropzone__title {
    max-width: 24rem;
    font-size: clamp(1.05rem, 1rem + 0.25vw, 1.15rem);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .upload-dropzone--compact .upload-dropzone__title {
    max-width: none;
    font-size: var(--font-size-sm);
    font-weight: 600;
    align-self: center;
  }

  .upload-dropzone__description {
    margin: 0;
    max-width: 34rem;
    color: var(--ui-text-secondary);
    font-size: 0.88rem;
    line-height: 1.5;
  }

  .upload-dropzone--hero .upload-dropzone__description {
    max-width: 30rem;
    font-size: 0.875rem;
  }

  .upload-dropzone--surface .upload-dropzone__description {
    max-width: 24rem;
    color: var(--ui-text-secondary);
    font-size: var(--font-size-sm);
  }

  .upload-dropzone__support {
    margin: 0;
    color: var(--ui-text-muted);
    font-size: var(--font-size-xs);
    line-height: 1.45;
  }

  .upload-dropzone--compact .upload-dropzone__description {
    max-width: none;
    font-size: var(--font-size-xs);
  }

  .upload-dropzone__divider {
    width: var(--upload-dropzone-divider-width);
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
    color: var(--upload-dropzone-divider-label);
    font-size: var(--font-size-xs);
    font-weight: 500;
  }

  :global(.upload-dropzone__browse.ui-button) {
    min-width: 140px;
  }

  :global(.upload-dropzone--hero .upload-dropzone__browse.ui-button) {
    min-width: 160px;
    height: 2.5rem;
    border-radius: 999px;
    padding-inline: var(--ui-space-4);
    --button-shadow:
      inset 0 0 0 1px transparent,
      0 10px 24px color-mix(in srgb, var(--ui-text-primary) 12%, transparent);
  }

  :global(.upload-dropzone--compact .upload-dropzone__browse.ui-button) {
    min-width: 8.5rem;
    justify-self: end;
    align-self: center;
  }

  @media (max-width: 640px) {
    .upload-dropzone__drag-chip {
      position: static;
      max-width: 100%;
    }

    .upload-dropzone__title {
      font-size: var(--font-size-sm);
    }

    .upload-dropzone__description {
      font-size: var(--font-size-sm);
    }

    :global(.upload-dropzone__browse.ui-button) {
      width: 100%;
      min-width: 0;
    }

    .upload-dropzone--compact {
      grid-template-columns: 1fr;
      justify-items: stretch;
      text-align: center;
    }

    :global(.upload-dropzone--compact .upload-dropzone__browse.ui-button) {
      justify-self: stretch;
    }
  }
</style>
