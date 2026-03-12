<script>
  import Card from './Card.svelte';

  export let count = 6;
  $: rows = Array.from({ length: Math.max(1, count) }, (_, index) => index);
</script>

<section class="document-list-skeleton" aria-hidden="true">
  {#each rows as row}
    <Card as="article" class="skeleton-card" variant="raised" padding="md">
      <div class="row top">
        <div class="chip"></div>
        <div class="icon"></div>
      </div>
      <div class="title"></div>
      <div class="meta"></div>
      <div class="meta meta-short"></div>
      <div class="row actions">
        <div class="button"></div>
        <div class="button"></div>
      </div>
    </Card>
  {/each}
</section>

<style>
  .document-list-skeleton {
    display: grid;
    gap: var(--space-3);
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  :global(.skeleton-card) {
    display: grid;
    gap: var(--space-2);
    min-height: 214px;
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
  }

  .top {
    margin-bottom: 0.2rem;
  }

  .chip,
  .icon,
  .title,
  .meta,
  .button {
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--color-surface-2) 82%, transparent) 25%,
      color-mix(in srgb, var(--color-surface-2) 46%, white 54%) 50%,
      color-mix(in srgb, var(--color-surface-2) 82%, transparent) 75%
    );
    background-size: 220% 100%;
    animation: skeleton-shimmer 1.8s ease-in-out infinite;
  }

  .chip {
    width: 60px;
    height: 0.78rem;
  }

  .icon {
    width: 28px;
    height: 28px;
    border-radius: 10px;
  }

  .title {
    width: 88%;
    height: 1.1rem;
  }

  .meta {
    width: 70%;
    height: 0.8rem;
  }

  .meta-short {
    width: 58%;
  }

  .actions {
    margin-top: auto;
  }

  .button {
    width: 88px;
    height: 34px;
    border-radius: 9px;
  }

  @media (max-width: 1024px) {
    .document-list-skeleton {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .document-list-skeleton {
      grid-template-columns: 1fr;
    }
  }

  @keyframes skeleton-shimmer {
    0% {
      background-position: 130% 0;
    }

    100% {
      background-position: -100% 0;
    }
  }
</style>
