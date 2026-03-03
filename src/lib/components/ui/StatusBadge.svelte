<script>
  import { t } from '../../i18n/t.js';

  const map = {
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
      tone: 'danger',
    },
  };

  export let status = 'processing';
  export let label = '';

  $: config = map[status] ?? map.processing;
  $: text = label || t(config.key);
</script>

<span class="status-badge" data-tone={config.tone}>
  <slot>{text}</slot>
</span>

<style>
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    min-block-size: 28px;
    padding: 0 var(--space-2);
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 1px solid transparent;
  }

  .status-badge[data-tone='info'] {
    background: color-mix(in srgb, var(--color-info) 14%, transparent);
    color: color-mix(in srgb, var(--color-info) 80%, #fff 20%);
    border-color: color-mix(in srgb, var(--color-info) 30%, transparent);
  }

  .status-badge[data-tone='success'] {
    background: color-mix(in srgb, var(--color-success) 14%, transparent);
    color: color-mix(in srgb, var(--color-success) 70%, #fff 30%);
    border-color: color-mix(in srgb, var(--color-success) 30%, transparent);
  }

  .status-badge[data-tone='danger'] {
    background: color-mix(in srgb, var(--color-danger) 14%, transparent);
    color: color-mix(in srgb, var(--color-danger) 80%, #fff 20%);
    border-color: color-mix(in srgb, var(--color-danger) 30%, transparent);
  }
</style>
