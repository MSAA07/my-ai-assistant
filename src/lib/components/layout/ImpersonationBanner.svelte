<script>
  import { Eye } from '@lucide/svelte';
  import Button from '../ui/Button.svelte';

  export let userName = '';
  export let userEmail = '';
  export let stopping = false;
</script>

<aside class="impersonation-banner" role="status">
  <span class="banner-icon" aria-hidden="true"><Eye /></span>
  <p>
    <strong>Viewing as {userName || userEmail || 'user'}</strong>
    {#if userName && userEmail}<span>{userEmail}</span>{/if}
    <span>Support session ends after 60 minutes.</span>
  </p>
  <Button type="button" variant="warning" size="sm" loading={stopping} on:click>
    Return to admin
  </Button>
</aside>

<style>
  .impersonation-banner {
    position: sticky;
    inset-block-start: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    gap: var(--ui-space-3);
    min-width: 0;
    padding: var(--ui-space-2) var(--layout-shell-padding-inline);
    border-block: 1px solid color-mix(in srgb, var(--ui-accent-warning) 35%, var(--ui-border-default) 65%);
    background: color-mix(in srgb, var(--ui-accent-warning) 12%, var(--ui-surface-overlay) 88%);
    color: var(--ui-text-primary);
  }

  .banner-icon {
    display: inline-flex;
    color: var(--ui-accent-warning);
  }

  .banner-icon :global(svg) {
    width: 1.1rem;
    height: 1.1rem;
  }

  p {
    display: flex;
    flex: 1;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.25rem var(--ui-space-2);
    min-width: 0;
    margin: 0;
    font-size: var(--ui-type-body-sm);
  }

  p span {
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-label);
  }

  @media (max-width: 640px) {
    .impersonation-banner {
      align-items: flex-start;
      padding-inline: var(--ui-space-3);
    }

    p {
      display: grid;
    }
  }
</style>
