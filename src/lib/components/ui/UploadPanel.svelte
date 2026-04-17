<script>
  import { createEventDispatcher } from 'svelte';
  import Badge from './Badge.svelte';
  import Button from './Button.svelte';
  import EmptyState from './EmptyState.svelte';
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
  export let eyebrow = '';
  export let variant = 'default';
  export let dropzoneTitle = '';
  export let dropzoneDescription = '';
  export let dropzoneOr = 'OR';
  export let browseLabel = '';
  export let supportLabel = '';
  export let supportTitle = '';
  export let benefitLabel = '';
  export let benefitItems = [];
  export let showCounter = true;
  export let cancelLabel = '';
  export let submitLabel = '';
  export let submitBusyLabel = '';
  export let removeFileLabel = '';
  export let errorMessage = '';
  export let detailsSummary = '';

  $: canSubmit = Array.isArray(files) && files.length > 0 && !busy;
  $: showFooter = busy || files.length > 0 || showCounter;
  $: isHero = variant === 'hero';
  $: isCompact = variant === 'compact';
  $: panelClassName = ['upload-panel', isHero ? 'upload-panel--hero' : isCompact ? 'upload-panel--compact' : 'upload-panel--default']
    .filter(Boolean)
    .join(' ');
  $: ariaLabel = title || dropzoneTitle || browseLabel;

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

<section class={['upload-panel-shell', className, $$props.class ?? ''].filter(Boolean).join(' ')} aria-label={ariaLabel}>
  {#if isHero}
    <EmptyState variant="hero" {eyebrow} {title} {description}>
      <div slot="support" class="upload-panel__hero-support">
        {#if supportTitle}
          <p class="upload-panel__hero-support-copy">{supportTitle}</p>
        {/if}
        {#if benefitItems.length > 0}
          <div class="upload-panel__hero-chips" aria-label={benefitLabel}>
            {#each benefitItems as item (item)}
              <Badge tone="neutral" variant="outline" size="sm">{item}</Badge>
            {/each}
          </div>
        {/if}

        <div class="upload-panel upload-panel--hero">
          <UploadDropzone
            id="upload-panel-input"
            {accept}
            {multiple}
            disabled={busy}
            isBusy={busy}
            title={dropzoneTitle}
            description={dropzoneDescription}
            orLabel={dropzoneOr}
            {browseLabel}
            variant="hero"
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
        </div>
      </div>
      <span slot="icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 15V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M8.5 10.5L12 7l3.5 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M6 17.5h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </span>
    </EmptyState>
  {:else}
    <div class={panelClassName}>
      {#if title || description}
        <div class="upload-panel__header">
          <div class="upload-panel__titles">
            {#if title}<h2>{title}</h2>{/if}
            {#if description}<p>{description}</p>{/if}
          </div>
        </div>
      {/if}

      <UploadDropzone
        id="upload-panel-input"
        {accept}
        {multiple}
        disabled={busy}
        isBusy={busy}
        title={dropzoneTitle}
        description={dropzoneDescription}
        orLabel={dropzoneOr}
        {browseLabel}
        variant={isCompact ? 'compact' : 'default'}
        on:filesSelected={handleFilesSelected}
      />

      {#if supportLabel}
        <p class="upload-panel__support">{supportLabel}</p>
      {/if}

      {#if isCompact && detailsSummary}
        <details class="upload-panel__details">
          <summary>{detailsSummary}</summary>
          {#if supportTitle}
            <p class="upload-panel__details-copy">{supportTitle}</p>
          {/if}
          {#if benefitItems.length > 0}
            <div class="upload-panel__hero-chips" aria-label={benefitLabel}>
              {#each benefitItems as item (item)}
                <Badge tone="neutral" variant="outline" size="sm">{item}</Badge>
              {/each}
            </div>
          {/if}
        </details>
      {/if}

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
    </div>
  {/if}

</section>

<style>
  .upload-panel-shell {
    display: grid;
    gap: var(--upload-panel-gap);
  }

  .upload-panel {
    display: grid;
    gap: var(--upload-panel-gap);
    padding: var(--upload-panel-padding);
    border-radius: var(--ui-radius-md);
    border: 1px solid var(--upload-panel-border);
    background: var(--upload-panel-bg);
    box-shadow: var(--upload-panel-shadow);
  }

  .upload-panel--hero {
    gap: var(--ui-space-3);
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
    width: 100%;
    max-width: 100%;
  }

  .upload-panel--default,
  .upload-panel--compact {
    box-shadow: none;
  }

  .upload-panel--compact {
    gap: var(--ui-space-3);
    padding: var(--ui-space-3);
  }

  .upload-panel__header {
    display: grid;
    gap: var(--ui-space-1);
  }

  .upload-panel__hero-support {
    display: grid;
    gap: var(--ui-space-2);
    justify-items: center;
    width: 100%;
  }

  .upload-panel__hero-support-copy {
    margin: 0;
    max-width: 40ch;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
    line-height: 1.55;
    text-align: center;
  }

  .upload-panel__hero-chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--ui-space-2);
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
    line-height: 1.45;
  }

  .upload-panel__support {
    color: var(--upload-panel-support);
    font-size: var(--font-size-xs);
    text-align: center;
    line-height: 1.4;
  }

  .upload-panel--compact .upload-panel__support {
    text-align: left;
  }

  .upload-panel__details {
    display: grid;
    gap: var(--ui-space-2);
    color: var(--ui-text-secondary);
  }

  .upload-panel__details summary {
    cursor: pointer;
    color: var(--ui-text-muted);
    font-size: var(--font-size-xs);
    font-weight: 600;
    list-style: none;
  }

  .upload-panel__details summary::-webkit-details-marker {
    display: none;
  }

  .upload-panel__details-copy {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--font-size-xs);
    line-height: 1.5;
  }

  .upload-panel__error {
    margin: 0;
    color: var(--upload-panel-error);
    font-size: var(--font-size-sm);
    line-height: 1.5;
  }

  .upload-panel__files {
    display: grid;
    gap: var(--ui-space-2);
  }

  :global(.upload-panel-shell .empty-state) {
    width: 100%;
  }

  :global(.upload-panel-shell .upload-dropzone--hero) {
    margin-top: 0;
  }

  .upload-panel__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-space-3);
    border-top: 1px solid var(--upload-footer-border);
    padding-top: var(--ui-space-3);
  }

  .upload-panel--compact .upload-panel__footer {
    padding-top: var(--ui-space-2);
  }

  .upload-panel__counter {
    color: var(--upload-panel-support);
    font-size: var(--font-size-xs);
  }

  .upload-panel__actions {
    display: flex;
    gap: var(--ui-space-2);
  }

  :global(.upload-panel__cancel.ui-button) {
    min-width: 6.5rem;
  }

  :global(.upload-panel__submit.ui-button) {
    min-width: 6.5rem;
    box-shadow: none;
  }

  :global(.upload-panel-shell .upload-panel__submit.ui-button) {
    min-width: 9rem;
    border-radius: 999px;
  }

  :global(.upload-panel-shell .upload-panel__cancel.ui-button) {
    border-radius: 999px;
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

    .upload-panel--compact .upload-panel__support {
      text-align: center;
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
