<script>
  import Badge from './Badge.svelte';
  import { t } from '../../i18n/t.js';

  const map = {
    info: {
      key: 'status.processing',
      tone: 'info',
    },
    processing: {
      key: 'status.processing',
      tone: 'info',
    },
    ready: {
      key: 'status.ready',
      tone: 'success',
    },
    failed: {
      key: 'status.failed',
      tone: 'destructive',
    },
  };

  export let status = 'processing';
  export let label = '';

  $: config = map[status] ?? map.processing;
  $: text = label || t(config.key);
</script>

<Badge tone={config.tone} variant="soft" size="sm" uppercase className="status-badge">
  <slot>{text}</slot>
</Badge>

<style>
  :global(.status-badge) {
    font-size: var(--font-size-xs);
    letter-spacing: 0.05em;
  }
</style>
