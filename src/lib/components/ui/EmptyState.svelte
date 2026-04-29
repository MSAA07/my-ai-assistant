<script>
  import Badge from './Badge.svelte';
  import { t } from '../../i18n/t.js';
  import Card from './Card.svelte';

  export let title = t('emptyState.title');
  export let subtitle = '';
  export let description = '';
  export let icon = '✨';
  export let eyebrow = '';
  export let variant = 'standard';

  $: resolvedDescription = description || subtitle || t('emptyState.subtitle');
  $: isHero = variant === 'hero';
  $: resolvedCardVariant = isHero ? 'study' : 'standard';
  $: resolvedBorder = isHero ? 'default' : 'dashed';
  $: resolvedPadding = isHero ? 'lg' : 'lg';
</script>

<Card
  as="section"
  variant={resolvedCardVariant}
  border={resolvedBorder}
  padding={resolvedPadding}
  className={['empty-state', isHero ? 'empty-state--hero' : ''].filter(Boolean).join(' ')}
  role="status"
>
  <div class="empty-state__inner">
    <div class="empty-state__icon" aria-hidden="true">
      <slot name="icon">{icon}</slot>
    </div>

    {#if eyebrow || $$slots.eyebrow}
      <div class="empty-state__eyebrow">
        {#if $$slots.eyebrow}
          <slot name="eyebrow" />
        {:else}
          <Badge tone="neutral" variant="outline" size="sm" uppercase>{eyebrow}</Badge>
        {/if}
      </div>
    {/if}

    <div class="empty-state__copy">
      <h2>{title}</h2>
      <p>{resolvedDescription}</p>
    </div>

    {#if $$slots.support}
      <div class="empty-state__support">
        <slot name="support" />
      </div>
    {/if}

    {#if $$slots.actions || $$slots.default}
      <div class="empty-state__actions">
        <slot name="actions"></slot>
        <slot />
      </div>
    {/if}
  </div>
</Card>

<style>
  :global(.empty-state) {
    --empty-state-icon-size: 52px;
    --empty-state-width: 680px;
    --card-gap: var(--ui-space-4);
    width: min(100%, var(--empty-state-width));
    margin-inline: auto;
    justify-items: center;
    color: var(--ui-text-secondary);
    min-width: 0;
    text-align: center;
  }

  :global(.empty-state--hero) {
    --empty-state-icon-size: 56px;
    --empty-state-width: 760px;
    --card-gap: var(--ui-space-4);
    background:
      radial-gradient(circle at top, color-mix(in srgb, var(--ui-text-primary) 8%, transparent) 0%, transparent 42%),
      linear-gradient(180deg, color-mix(in srgb, var(--ui-surface-card) 95%, var(--ui-surface-secondary) 5%) 0%, var(--ui-surface-card) 100%);
    box-shadow: var(--ui-shadow-1);
  }

  .empty-state__inner {
    display: grid;
    gap: var(--ui-space-3);
    justify-items: center;
    width: 100%;
  }

  .empty-state__icon {
    inline-size: var(--empty-state-icon-size);
    block-size: var(--empty-state-icon-size);
    border-radius: var(--ui-radius-md);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    color: var(--ui-text-primary);
    background:
      radial-gradient(circle at top left, color-mix(in srgb, var(--ui-text-primary) 12%, transparent) 0%, transparent 46%),
      color-mix(in srgb, var(--ui-surface-secondary) 76%, transparent);
    border: 1px solid color-mix(in srgb, var(--ui-text-primary) 10%, var(--ui-border-default) 90%);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--ui-text-primary) 6%, transparent);
  }

  .empty-state__icon :global(svg) {
    width: 1.65rem;
    height: 1.65rem;
  }

  .empty-state__eyebrow {
    display: flex;
    justify-content: center;
  }

  .empty-state__copy {
    display: grid;
    gap: var(--ui-space-2);
    justify-items: center;
  }

  h2 {
    margin: 0;
    font-size: var(--ui-type-title-sm);
    font-weight: 600;
    letter-spacing: 0;
    color: var(--ui-text-primary);
  }

  p {
    margin: 0;
    font-size: var(--ui-type-body-md);
    color: var(--ui-text-secondary);
    line-height: 1.6;
    max-inline-size: 48ch;
  }

  :global(.empty-state--hero h2) {
    font-size: var(--study-flow-title-size);
  }

  :global(.empty-state--hero p) {
    font-size: var(--study-flow-subtitle-size);
  }

  .empty-state__support {
    display: grid;
    gap: var(--ui-space-3);
    justify-items: center;
    width: 100%;
  }

  .empty-state__support :global(*) {
    max-width: 100%;
  }

  .empty-state__actions {
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--ui-space-3);
    justify-content: center;
  }

  @media (max-width: 640px) {
    :global(.empty-state) {
      --empty-state-width: 100%;
    }

    .empty-state__icon {
      font-size: 1.15rem;
    }

    :global(.empty-state--hero h2) {
      font-size: var(--ui-type-title-sm);
    }
  }
</style>
