<script>
  export let label = '';
  export let forId = '';
  export let hint = '';
  export let error = '';
  export let required = false;
  export let disabled = false;
  export let className = '';

  $: hasError = Boolean(error);
  $: resolvedClass = ['ui-field', className, $$props.class ?? ''].filter(Boolean).join(' ');
</script>

<div
  {...$$restProps}
  class={resolvedClass}
  data-invalid={hasError}
  data-disabled={disabled}
>
  {#if label}
    <label class="ui-field__label" for={forId || undefined}>
      <span>{label}</span>
      {#if required}
        <span class="ui-field__required" aria-hidden="true">*</span>
      {/if}
    </label>
  {/if}

  <div class="ui-field__control">
    <slot />
  </div>

  {#if error}
    <p class="ui-field__meta ui-field__meta--error">{error}</p>
  {:else if hint}
    <p class="ui-field__meta">{hint}</p>
  {/if}
</div>

<style>
  .ui-field {
    display: grid;
    gap: 0.38rem;
  }

  .ui-field[data-disabled='true'] {
    opacity: 0.72;
  }

  .ui-field__label {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    margin: 0;
    color: var(--color-text-secondary);
    font-weight: 500;
    font-size: var(--font-size-xs);
    letter-spacing: 0.01em;
  }

  .ui-field__required {
    color: var(--color-danger);
  }

  .ui-field__control {
    border-radius: var(--ui-radius-sm);
    border: 1px solid var(--ui-border-subtle);
    background: var(--ui-surface-base);
    transition: border-color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard);
  }

  .ui-field__control:focus-within {
    border-color: var(--ui-border-accent);
    box-shadow: var(--ui-focus-ring-strong);
    background: var(--ui-surface-raised);
  }

  .ui-field[data-invalid='true'] .ui-field__control {
    border-color: color-mix(in srgb, var(--color-danger) 42%, var(--color-border) 58%);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-danger) 26%, transparent);
  }

  .ui-field__control :global(input),
  .ui-field__control :global(textarea),
  .ui-field__control :global(select) {
    width: 100%;
    min-height: 2.5rem;
    padding: 0.5rem 0.68rem;
    border: none;
    border-radius: inherit;
    background: transparent;
    color: var(--color-text-primary);
    font: inherit;
    line-height: 1.35;
    font-size: var(--font-size-sm);
  }

  .ui-field__control :global(textarea) {
    min-height: 100px;
    resize: vertical;
  }

  @media (max-width: 768px) {
    .ui-field__control :global(textarea) {
      font-size: 1rem;
      line-height: 1.4;
    }

    .ui-field__control :global(input),
    .ui-field__control :global(select) {
      min-height: 2.75rem;
    }
  }

  .ui-field__control :global(input:focus),
  .ui-field__control :global(textarea:focus),
  .ui-field__control :global(select:focus) {
    outline: none;
  }

  .ui-field__control :global(input::placeholder),
  .ui-field__control :global(textarea::placeholder) {
    color: var(--color-text-faint);
  }

  .ui-field__meta {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .ui-field__meta--error {
    color: color-mix(in srgb, var(--color-danger) 72%, var(--color-text-secondary) 28%);
  }
</style>
