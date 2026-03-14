<script>
  import Card from './Card.svelte';
  import Badge from './Badge.svelte';

  export let eyebrow = '';
  export let title = '';
  export let subtitle = '';
  export let border = 'strong';
  export let variant = 'standard';
  export let padding = 'lg';
  export let centered = false;
  export let narrow = false;
  export let className = '';

  $: resolvedClass = [
    'ui-page-header',
    centered ? 'ui-page-header--centered' : '',
    narrow ? 'ui-page-header--narrow' : '',
    className,
    $$props.class ?? '',
  ]
    .filter(Boolean)
    .join(' ');
</script>

<Card {...$$restProps} as="header" {variant} {padding} {border} className={resolvedClass}>
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
</Card>

<style>
  :global(.ui-page-header) {
    gap: var(--ui-space-5);
    background: var(--gradient-hero);
  }

  .ui-page-header__main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--ui-space-5);
    flex-wrap: wrap;
  }

  .ui-page-header__copy {
    display: grid;
    gap: var(--ui-space-3);
    min-width: 0;
    flex: 1 1 28rem;
  }

  .ui-page-header__heading {
    display: grid;
    gap: var(--ui-space-2);
    min-width: 0;
  }

  .ui-page-header__heading h1 {
    margin: 0;
    color: var(--ui-text-primary);
    font-size: var(--ui-type-title-md);
    line-height: 1.05;
    letter-spacing: -0.04em;
    text-wrap: balance;
  }

  .ui-page-header__heading p {
    margin: 0;
    max-width: 56ch;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-md);
    line-height: 1.6;
  }

  .ui-page-header__actions {
    display: inline-flex;
    align-items: center;
    gap: var(--ui-space-3);
    flex-wrap: wrap;
  }

  .ui-page-header__meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
