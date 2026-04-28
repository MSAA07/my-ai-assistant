<script>
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';

  export let title = '';
  export let rows = [];
  export let nameKey = '';
  export let labelKey = '';
  export let idKey = '';
  export let description = 'Sorted by USD cost.';
  export let compact = false;

  function formatUsd(value) {
    return `$${Number(value || 0).toFixed(4)}`;
  }

  function formatSar(value) {
    return `${Number(value || 0).toFixed(2)} SAR`;
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString();
  }

  function getRowLabel(row) {
    if (labelKey) return row[labelKey] || '-';
    if (nameKey === 'user') return row.user?.email || row.user?.name || row[idKey] || '-';
    if (nameKey === 'document') return row.document?.originalName || row[idKey] || '-';
    return row[idKey] || '-';
  }
</script>

<DataSurface {title} {description} {compact} tableMinWidth="720px">
  <svelte:fragment slot="table">
    {#if rows.length > 0}
      <table class="ui-data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Events</th>
            <th>Input</th>
            <th>Output</th>
            <th>Total</th>
            <th>USD</th>
            <th>SAR</th>
          </tr>
        </thead>
        <tbody>
          {#each rows as row}
            <tr>
              <td><strong>{getRowLabel(row)}</strong></td>
              <td>{formatNumber(row.events)}</td>
              <td>{formatNumber(row.inputTokens)}</td>
              <td>{formatNumber(row.outputTokens)}</td>
              <td>{formatNumber(row.totalTokens)}</td>
              <td>{formatUsd(row.costUsd)}</td>
              <td>{formatSar(row.costSar)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p class="ui-data-state-note">No rows for this filter.</p>
    {/if}
  </svelte:fragment>
</DataSurface>
