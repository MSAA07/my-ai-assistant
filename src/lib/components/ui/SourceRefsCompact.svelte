<script>
  import Badge from './Badge.svelte';

  export let refs = [];
  export let label = 'Sources';
  export let maxVisible = 6;

  $: normalizedRefs = Array.isArray(refs)
    ? refs
      .filter((ref) => ref && typeof ref === 'object')
      .map((ref) => ({
        excerptId: typeof ref.excerptId === 'string' ? ref.excerptId.trim() : '',
        page: Number.isFinite(Number(ref.page)) ? Number(ref.page) : null,
        start: Number.isFinite(Number(ref.start)) ? Number(ref.start) : null,
        end: Number.isFinite(Number(ref.end)) ? Number(ref.end) : null
      }))
    : [];

  $: visibleRefs = normalizedRefs.slice(0, maxVisible);
  $: hiddenCount = Math.max(normalizedRefs.length - visibleRefs.length, 0);

  function formatReference(ref, index) {
    const parts = [];

    if (ref.page !== null) {
      parts.push(`p.${ref.page}`);
    }

    if (ref.start !== null || ref.end !== null) {
      const left = ref.start !== null ? ref.start : '?';
      const right = ref.end !== null ? ref.end : '?';
      parts.push(`chars ${left}-${right}`);
    }

    if (ref.excerptId) {
      parts.push(`#${ref.excerptId.slice(0, 8)}`);
    }

    if (parts.length === 0) {
      return `Ref ${index + 1}`;
    }

    return parts.join(' · ');
  }
</script>

{#if normalizedRefs.length > 0}
  <div class="source-refs" aria-label={label}>
    <span class="source-refs-label">{label}</span>
    <div class="source-ref-list">
      {#each visibleRefs as ref, index}
        <Badge size="sm" tone="neutral" className="source-ref-chip">{formatReference(ref, index)}</Badge>
      {/each}
      {#if hiddenCount > 0}
        <Badge size="sm" tone="neutral" className="source-ref-chip source-ref-chip--muted">+{hiddenCount} more</Badge>
      {/if}
    </div>
  </div>
{/if}

<style>
  .source-refs {
    display: grid;
    gap: 0.4rem;
  }

  .source-refs-label {
    font-size: 0.76rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    font-weight: 600;
  }

  .source-ref-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .source-ref-chip {
    white-space: nowrap;
  }

  .source-ref-chip--muted {
    color: var(--color-text-muted);
  }
</style>
