<Card class="dashboard-skeleton-card" variant="raised" padding="md" aria-hidden="true">
  <div class="value"></div>
  <div class="label"></div>
</Card>

<script>
  import Card from './Card.svelte';
</script>

<style>
  :global(.dashboard-skeleton-card) {
    min-height: 128px;
    text-align: center;
  }

  .value,
  .label {
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--color-surface-2) 80%, transparent) 25%,
      color-mix(in srgb, var(--color-surface-2) 40%, white 60%) 50%,
      color-mix(in srgb, var(--color-surface-2) 80%, transparent) 75%
    );
    background-size: 220% 100%;
    animation: skeleton-shimmer 1.8s ease-in-out infinite;
    margin-inline: auto;
  }

  .value {
    height: 2.5rem;
    width: 62%;
    margin-bottom: 0.65rem;
  }

  .label {
    height: 0.95rem;
    width: 74%;
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
