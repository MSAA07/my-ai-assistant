<script>
  import { ArrowUpDown, ChevronDown, ChevronUp } from '@lucide/svelte';
  import DataSurface from '../../lib/components/ui/DataSurface.svelte';

  export let title = '';
  export let rows = [];
  export let type = 'users';
  export let description = 'Sorted by USD spend.';
  export let paginated = false;
  export let pageSize = 10;
  export let itemLabel = 'rows';
  export let compact = false;

  const numberColumns = ['events', 'inputTokens', 'outputTokens', 'totalTokens', 'costUsd', 'costSar'];
  let sortKey = 'costUsd';
  let sortDirection = 'desc';
  let page = 1;
  let previousRows = rows;

  $: if (rows !== previousRows) {
    previousRows = rows;
    page = 1;
  }
  $: config = getConfig(type);
  $: surfaceClass = [
    'usage-breakdown-surface',
    type === 'features' || type === 'models' ? 'usage-breakdown-surface--fit-table' : ''
  ]
    .filter(Boolean)
    .join(' ');
  $: sortedRows = sortRows(rows, sortKey, sortDirection);
  $: totalRows = sortedRows.length;
  $: totalPages = paginated ? Math.max(1, Math.ceil(totalRows / pageSize)) : 1;
  $: if (page > totalPages) page = totalPages;
  $: hasPreviousPage = page > 1;
  $: hasNextPage = page < totalPages;
  $: visibleRows = paginated
    ? sortedRows.slice((page - 1) * pageSize, page * pageSize)
    : sortedRows;
  $: showingStart = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  $: showingEnd = Math.min(page * pageSize, totalRows);

  function getConfig(tableType) {
    const baseColumns = [
      { key: 'label', label: 'Name/Email' },
      { key: 'events', label: 'Events' },
      { key: 'inputTokens', label: 'Input Tokens' },
      { key: 'outputTokens', label: 'Output Tokens' },
      { key: 'totalTokens', label: 'Total Tokens' },
      { key: 'costUsd', label: 'USD Cost' },
      { key: 'costSar', label: 'SAR Cost' }
    ];

    if (tableType === 'documents') {
      return {
        tableMinWidth: '980px',
        emptyMessage: 'No document usage for this period.',
        columns: [{ ...baseColumns[0], label: 'Document Name' }, ...baseColumns.slice(1)]
      };
    }

    if (tableType === 'features') {
      return {
        tableMinWidth: '100%',
        emptyMessage: 'No feature usage for this period.',
        columns: [
          { key: 'label', label: 'Feature Name' },
          { key: 'events', label: 'Events' },
          { key: 'inputTokens', label: 'Input' },
          { key: 'outputTokens', label: 'Output' },
          { key: 'totalTokens', label: 'Total Tokens' },
          { key: 'costUsd', label: 'USD' },
          { key: 'costSar', label: 'SAR' }
        ]
      };
    }

    if (tableType === 'models') {
      return {
        tableMinWidth: '100%',
        emptyMessage: 'No model usage for this period.',
        columns: [
          { key: 'label', label: 'Model' },
          { key: 'events', label: 'Events' },
          { key: 'inputTokens', label: 'Input' },
          { key: 'outputTokens', label: 'Output' },
          { key: 'totalTokens', label: 'Total Tokens' },
          { key: 'costUsd', label: 'USD' },
          { key: 'costSar', label: 'SAR' }
        ]
      };
    }

    return {
      tableMinWidth: '980px',
      emptyMessage: 'No user usage for this period.',
      columns: baseColumns
    };
  }

  function formatUsd(value) {
    const amount = Number(value || 0);
    const digits = amount >= 1 ? 2 : 4;
    return `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    })}`;
  }

  function formatSar(value) {
    return `${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} SAR`;
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString();
  }

  function getUserPrimary(row) {
    return row.user?.name || row.user?.email || row.userId || '-';
  }

  function getUserSecondary(row) {
    if (row.user?.name && row.user?.email) return row.user.email;
    if (row.user?.email && row.userId) return row.userId;
    return '';
  }

  function getDocumentPrimary(row) {
    return row.document?.originalName || row.documentId || '-';
  }

  function getDocumentSecondary(row) {
    return '';
  }

  function getLabel(row) {
    if (type === 'documents') return getDocumentPrimary(row);
    if (type === 'features') return row.featureKey || '-';
    if (type === 'models') return row.model || '-';
    return getUserPrimary(row);
  }

  function getSecondaryLabel(row) {
    if (type === 'documents') return getDocumentSecondary(row);
    if (type === 'users') return getUserSecondary(row);
    return '';
  }

  function getCellValue(row, key) {
    if (key === 'label') return getLabel(row);
    if (key === 'costUsd') return formatUsd(row.costUsd);
    if (key === 'costSar') return formatSar(row.costSar);
    return formatNumber(row[key]);
  }

  function getSortValue(row, key) {
    if (key === 'label') return String(getLabel(row)).toLowerCase();
    return Number(row[key] || 0);
  }

  function sortRows(sourceRows, key, direction) {
    const multiplier = direction === 'asc' ? 1 : -1;
    return [...sourceRows].sort((left, right) => {
      const leftValue = getSortValue(left, key);
      const rightValue = getSortValue(right, key);

      if (typeof leftValue === 'string' || typeof rightValue === 'string') {
        return String(leftValue).localeCompare(String(rightValue)) * multiplier;
      }

      if (leftValue === rightValue) return 0;
      return (leftValue > rightValue ? 1 : -1) * multiplier;
    });
  }

  function handleSort(column) {
    if (sortKey === column.key) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = column.key;
      sortDirection = column.key === 'label' ? 'asc' : 'desc';
    }
    page = 1;
  }

  function ariaSort(column) {
    if (sortKey !== column.key) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  }

  function nextPage() {
    if (!hasNextPage) return;
    page += 1;
  }

  function previousPage() {
    if (!hasPreviousPage) return;
    page -= 1;
  }
</script>

<DataSurface {title} {description} {compact} padding="md" tableMinWidth={config.tableMinWidth} className={surfaceClass}>
  <svelte:fragment slot="table">
    {#if rows.length > 0}
      <table class="ui-data-table usage-breakdown-table">
        <thead>
          <tr>
            {#each config.columns as column}
              <th aria-sort={ariaSort(column)}>
                <button
                  type="button"
                  class="sort-button"
                  class:sort-button--active={sortKey === column.key}
                  on:click={() => handleSort(column)}
                >
                  <span>{column.label}</span>
                  <span class="sort-icon" aria-hidden="true">
                    {#if sortKey === column.key}
                      {#if sortDirection === 'asc'}
                        <ChevronUp />
                      {:else}
                        <ChevronDown />
                      {/if}
                    {:else}
                      <ArrowUpDown />
                    {/if}
                  </span>
                </button>
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each visibleRows as row}
            <tr>
              {#each config.columns as column}
                <td class:metric-cell={numberColumns.includes(column.key)}>
                  {#if column.key === 'label'}
                    <div class="identity-cell">
                      <strong class="bidi-isolate">{getLabel(row)}</strong>
                      {#if getSecondaryLabel(row)}
                        <span class="bidi-isolate">{getSecondaryLabel(row)}</span>
                      {/if}
                    </div>
                  {:else}
                    {getCellValue(row, column.key)}
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>

      {#if paginated}
        <div class="pagination-bar">
          <p>Showing {showingStart}-{showingEnd} of {totalRows} {itemLabel}</p>
          <div class="pagination-actions">
            <button type="button" class="pagination-button" on:click={previousPage} disabled={!hasPreviousPage}>Previous</button>
            <button type="button" class="pagination-button" on:click={nextPage} disabled={!hasNextPage}>Next</button>
          </div>
        </div>
      {/if}
    {:else}
      <div class="table-empty-state">
        <p>{config.emptyMessage}</p>
      </div>
    {/if}
  </svelte:fragment>
</DataSurface>

<style>
  :global(.usage-breakdown-surface) {
    border-radius: var(--ui-radius-lg);
  }

  :global(.usage-breakdown-surface--fit-table .ui-data-surface__table-wrap) {
    overflow-x: hidden;
  }

  :global(.usage-breakdown-surface--fit-table .usage-breakdown-table) {
    table-layout: fixed;
  }

  :global(.usage-breakdown-surface--fit-table .identity-cell strong) {
    overflow-wrap: anywhere;
  }

  .sort-button {
    display: inline-flex;
    align-items: center;
    gap: var(--ui-space-1);
    max-width: 100%;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
    letter-spacing: inherit;
    padding: 0;
    text-align: start;
    text-transform: inherit;
  }

  .sort-button:hover,
  .sort-button--active {
    color: var(--ui-text-primary);
  }

  .sort-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: currentColor;
    opacity: 0.7;
  }

  .sort-icon :global(svg) {
    width: 0.8rem;
    height: 0.8rem;
    stroke-width: 2;
  }

  .identity-cell {
    display: grid;
    gap: 0.15rem;
    min-width: 0;
  }

  .identity-cell strong {
    color: var(--ui-text-primary);
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .identity-cell span {
    color: var(--ui-text-muted);
    font-size: var(--ui-type-label);
    overflow-wrap: anywhere;
  }

  .metric-cell {
    color: var(--ui-text-primary);
    font-family: var(--font-family-mono);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .pagination-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-space-3);
    padding-top: var(--ui-space-3);
    border-top: 1px solid var(--ui-border-default);
  }

  .pagination-bar p {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
  }

  .pagination-actions {
    display: inline-flex;
    align-items: center;
    gap: var(--ui-space-2);
  }

  .pagination-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.25rem;
    border: 1px solid color-mix(in srgb, var(--ui-text-primary) 36%, var(--ui-border-default) 64%);
    border-radius: var(--ui-radius-md);
    background: transparent;
    color: var(--ui-text-primary);
    cursor: pointer;
    font-size: var(--ui-type-body-sm);
    font-weight: 600;
    padding: 0 0.75rem;
    transition:
      background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard),
      opacity var(--motion-fast) var(--ease-standard);
  }

  .pagination-button:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ui-text-primary) 8%, transparent);
  }

  .pagination-button:disabled {
    border-color: var(--ui-border-default);
    background: transparent;
    color: var(--ui-text-muted);
    cursor: not-allowed;
    opacity: 0.45;
  }

  .table-empty-state {
    display: grid;
    place-items: center;
    min-height: 9rem;
    border: 1px dashed var(--ui-border-default);
    border-radius: var(--ui-radius-md);
    background: color-mix(in srgb, var(--ui-surface-secondary) 48%, transparent);
    padding: var(--ui-space-5);
    text-align: center;
  }

  .table-empty-state p {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-body-sm);
  }

  @media (max-width: 640px) {
    .pagination-bar {
      display: grid;
    }

    .pagination-actions {
      width: 100%;
    }

    .pagination-button {
      flex: 1;
    }
  }
</style>
