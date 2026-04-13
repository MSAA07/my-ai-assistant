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
      tone: 'warning',
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

<Badge tone={config.tone} variant="soft" size="sm" className="status-badge">
  <slot>{text}</slot>
</Badge>

<style>
  :global(.status-badge) {
    min-height: 1.5rem;
    padding-inline: 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.6875rem;
    letter-spacing: 0;
  }
</style>
