<script>
  import Card from './Card.svelte';
</script>

<div class="document-detail-skeleton" aria-hidden="true">
  <div class="head back"></div>
  <div class="head title"></div>
  <div class="meta-row">
    <div class="head chip"></div>
    <div class="head chip chip-short"></div>
    <div class="head chip chip-mid"></div>
  </div>

  <Card as="section" class="panel" variant="base" padding="md">
    <div class="line line-strong"></div>
    <div class="line"></div>
    <div class="line line-mid"></div>
  </Card>

  <section class="grid">
    {#each Array.from({ length: 3 }) as _, index}
      <Card as="article" class="card" variant="base" padding="md">
        <div class="line line-card-title"></div>
        <div class="line line-card-body"></div>
        <div class="line line-card-body short"></div>
        <div class="cta"></div>
      </Card>
    {/each}
  </section>
</div>

<style>
  .document-detail-skeleton {
    display: grid;
    gap: 1rem;
  }

  .head,
  .line,
  .cta {
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--ui-surface-raised) 84%, transparent) 25%,
      color-mix(in srgb, var(--ui-surface-raised) 68%, white 32%) 50%,
      color-mix(in srgb, var(--ui-surface-raised) 84%, transparent) 75%
    );
    background-size: 220% 100%;
    animation: skeleton-shimmer 1.8s ease-in-out infinite;
  }

  .back {
    width: 116px;
    height: 0.9rem;
  }

  .title {
    width: min(540px, 92%);
    height: 1.8rem;
  }

  .meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .chip {
    width: 66px;
    height: 2rem;
    border-radius: 0.375rem;
  }

  .chip-short {
    width: 84px;
  }

  .chip-mid {
    width: 132px;
  }

  :global(.panel),
  :global(.card) {
    display: grid;
    gap: var(--space-2);
  }

  .line {
    height: 0.8rem;
  }

  .line-strong {
    height: 1.05rem;
    width: 42%;
  }

  .line-mid {
    width: 68%;
  }

  .grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .line-card-title {
    width: 66%;
    height: 1rem;
  }

  .line-card-body {
    width: 94%;
  }

  .line-card-body.short {
    width: 72%;
  }

  .cta {
    width: 106px;
    height: 34px;
    border-radius: 10px;
    margin-top: 0.4rem;
  }

  @media (max-width: 1024px) {
    .grid {
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
