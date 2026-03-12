<script>
  import Card from './Card.svelte';
</script>

<div class="settings-skeleton" aria-hidden="true">
  <div class="heading"></div>
  <div class="subheading"></div>

  {#each Array.from({ length: 3 }) as _, index}
    <Card as="section" class="section" variant="base" padding="md">
      <div class="line title"></div>
      <div class="line"></div>
      <div class="line short"></div>
      <div class="action"></div>
    </Card>
  {/each}
</div>

<style>
  .settings-skeleton {
    display: grid;
    gap: var(--space-4);
  }

  .heading,
  .subheading,
  .line,
  .action {
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

  .heading {
    width: 180px;
    height: 1.7rem;
  }

  .subheading {
    width: min(520px, 80%);
    height: 0.9rem;
  }

  :global(.section) {
    display: grid;
    gap: var(--space-2);
  }

  .line {
    height: 0.85rem;
  }

  .line.title {
    height: 1.05rem;
    width: 40%;
  }

  .line.short {
    width: 58%;
  }

  .action {
    width: 130px;
    height: 34px;
    border-radius: 9px;
    margin-top: 0.45rem;
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
