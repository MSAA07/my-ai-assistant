<script>
  import Badge from './Badge.svelte';

  export let eyebrow = '';
  export let title = '';
  export let subtitle = '';
  export let framed = false;
  export let border = 'strong';
  export let variant = 'standard';
  export let padding = 'lg';
  export let centered = false;
  export let narrow = false;
  export let className = '';

  $: resolvedClass = [
    'ui-page-header',
    framed ? 'ui-page-header--framed' : '',
    centered ? 'ui-page-header--centered' : '',
    narrow ? 'ui-page-header--narrow' : '',
    className,
    $$props.class ?? '',
  ]
    .filter(Boolean)
    .join(' ');
</script>

<header
  {...$$restProps}
  class={resolvedClass}
  data-variant={variant}
  data-padding={padding}
  data-border={border}
>
  <div class="ui-page-header__main">
    <div class="ui-page-header__copy">
      {#if $$slots.eyebrow}
        <slot name="eyebrow" />
      {:else if eyebrow}
        <Badge tone="neutral" variant="outline" size="sm" uppercase>{eyebrow}</Badge>
      {/if}

      {#if title || $$slots.title}
        <div class="ui-page-header__heading">
          {#if $$slots.title}
            <slot name="title" />
          {:else}
            <h1>{title}</h1>
          {/if}

          {#if $$slots.subtitle}
            <slot name="subtitle" />
          {:else if subtitle}
            <p>{subtitle}</p>
          {/if}
        </div>
      {/if}
    </div>

    {#if $$slots.actions}
      <div class="ui-page-header__actions">
        <slot name="actions" />
      </div>
    {/if}
  </div>

  {#if $$slots.meta}
    <div class="ui-page-header__meta">
      <slot name="meta" />
    </div>
  {/if}
</header>

<style>
  :global(.ui-page-header) {
    display: grid;
    gap: var(--ui-page-header-gap);
    min-width: 0;
    padding: var(--ui-page-header-padding);
  }

  :global(.ui-page-header--framed) {
    --ui-page-header-padding: var(--ui-space-5);
    border: 1px solid color-mix(in srgb, var(--ui-text-primary) 10%, var(--ui-border-default) 90%);
    border-radius: var(--ui-radius-lg);
    background:
      radial-gradient(circle at top right, color-mix(in srgb, var(--ui-text-primary) 7%, transparent) 0%, transparent 42%),
      linear-gradient(180deg, color-mix(in srgb, var(--ui-surface-card) 96%, var(--ui-surface-secondary) 4%) 0%, var(--ui-surface-card) 100%);
    box-shadow: var(--ui-shadow-1);
  }

  .ui-page-header__main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--ui-space-4);
    flex-wrap: wrap;
  }

  .ui-page-header__copy {
    display: grid;
    gap: var(--ui-page-header-eyebrow-gap);
    min-width: 0;
    flex: 1 1 28rem;
  }

  .ui-page-header__heading {
    display: grid;
    gap: var(--ui-space-1);
    min-width: 0;
  }

  .ui-page-header__heading h1 {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: var(--study-flow-title-size);
    line-height: 1.08;
    letter-spacing: 0;
    text-wrap: balance;
  }

  .ui-page-header__heading p {
    margin: 0;
    max-width: 54ch;
    color: var(--ui-text-secondary);
    font-size: var(--study-flow-subtitle-size);
    line-height: 1.55;
  }

  .ui-page-header__actions {
    display: inline-flex;
    align-items: center;
    gap: var(--ui-space-2);
    flex-wrap: wrap;
  }

  .ui-page-header__meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--ui-page-header-meta-column-min), 1fr));
    gap: var(--ui-space-3);
  }

  :global(.ui-page-header--centered .ui-page-header__main) {
    justify-content: center;
    text-align: center;
  }

  :global(.ui-page-header--centered .ui-page-header__copy) {
    justify-items: center;
  }

  :global(.ui-page-header--centered .ui-page-header__actions) {
    justify-content: center;
  }

  :global(.ui-page-header--narrow) {
    max-width: var(--size-content-narrow);
    margin-inline: auto;
  }

  @media (max-width: 640px) {
    :global(.ui-page-header--framed) {
      --ui-page-header-padding: var(--ui-space-4);
    }

    .ui-page-header__actions {
      width: 100%;
    }

    .ui-page-header__actions :global(.ui-button) {
      flex: 1 1 auto;
    }

    .ui-page-header__meta {
      grid-template-columns: 1fr;
    }
  }
</style>
