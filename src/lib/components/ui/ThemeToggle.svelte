<script>
  import { createEventDispatcher } from 'svelte';
  import { Moon, Sun } from '@lucide/svelte';
  import { t } from '../../i18n/t.js';

  export let value = 'dark';

  const dispatch = createEventDispatcher();

  function selectTheme(theme) {
    if (theme === value) return;
    dispatch('change', { theme });
  }

  function handleKeydown(event) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }

    event.preventDefault();

    const nextTheme =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? value === 'dark'
          ? 'light'
          : 'dark'
        : value === 'light'
          ? 'dark'
          : 'light';

    selectTheme(nextTheme);
  }
</script>

<div
  class="theme-toggle"
  role="radiogroup"
  aria-label={t('settings.theme.ariaLabel')}
>
  <button
    type="button"
    role="radio"
    class={`option ${value === 'dark' ? 'active' : ''}`}
    aria-checked={value === 'dark'}
    aria-label={t('settings.theme.dark')}
    on:keydown={handleKeydown}
    on:click={() => selectTheme('dark')}
  >
    <Moon size={16} strokeWidth={2.2} aria-hidden="true" />
  </button>
  <button
    type="button"
    role="radio"
    class={`option ${value === 'light' ? 'active' : ''}`}
    aria-checked={value === 'light'}
    aria-label={t('settings.theme.light')}
    on:keydown={handleKeydown}
    on:click={() => selectTheme('light')}
  >
    <Sun size={16} strokeWidth={2.2} aria-hidden="true" />
  </button>
</div>

<style>
  .theme-toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--ui-space-1);
    padding: 0.18rem;
    border: 1px solid var(--ui-border-default);
    border-radius: var(--ui-radius-md);
    background: color-mix(in srgb, var(--ui-surface-secondary) 70%, transparent);
    box-shadow: var(--ui-shadow-1);
  }

  .option {
    min-height: var(--ui-control-height-sm);
    min-width: var(--ui-control-height-sm);
    display: inline-grid;
    place-items: center;
    border: 1px solid transparent;
    border-radius: var(--ui-radius-sm);
    background: transparent;
    color: var(--ui-text-secondary);
    font-size: var(--ui-type-label);
    font-weight: 600;
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .option:hover {
    color: var(--ui-text-primary);
  }

  .option.active {
    color: var(--ui-text-primary);
    background: var(--ui-surface-card);
    border-color: var(--ui-border-strong);
    box-shadow: var(--ui-shadow-1);
  }

  .option:focus-visible {
    outline: 2px solid var(--color-focus-ring-strong);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    .theme-toggle {
      width: 100%;
    }

    .option {
      flex: 1;
      min-width: 0;
    }
  }
</style>
