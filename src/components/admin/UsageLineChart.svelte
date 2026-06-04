<script>
  import { onDestroy, onMount } from 'svelte';
  import Chart from 'chart.js/auto';

  export let points = [];
  export let groupBy = 'day';

  let canvas;
  let chart;
  let themeObserver;

  $: preparedPoints = points.map((point) => ({
    ...point,
    label: formatBucket(point.bucketStart, groupBy),
    tooltipLabel: formatTooltipBucket(point.bucketStart, groupBy),
    costUsd: Number(point.costUsd || 0)
  }));
  $: if (chart) renderChart();

  function formatBucket(value, bucketType) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    if (bucketType === 'month') {
      return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    }

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function formatTooltipBucket(value, bucketType) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    if (bucketType === 'month') {
      return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatUsd(value) {
    const amount = Number(value || 0);
    const digits = amount >= 1 ? 2 : 4;
    return `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    })}`;
  }

  function withAlpha(color, alpha) {
    if (color.startsWith('rgba(')) {
      return color.replace(/rgba\(([^)]+),\s*[\d.]+\)/, `rgba($1, ${alpha})`);
    }
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    return color;
  }

  function getChartColors() {
    const styles = getComputedStyle(canvas);
    const rootStyles = getComputedStyle(document.documentElement);
    const primary = styles.color || 'rgb(250, 250, 250)';
    const muted = rootStyles.getPropertyValue('--foundation-text-muted').trim() || 'rgb(115, 115, 115)';
    const border = rootStyles.getPropertyValue('--foundation-border').trim() || 'rgb(42, 42, 42)';
    const surface = rootStyles.getPropertyValue('--foundation-surface-overlay').trim() || 'rgb(31, 31, 31)';
    const page = rootStyles.getPropertyValue('--foundation-bg').trim() || 'rgb(0, 0, 0)';

    return { primary, muted, border, surface, page };
  }

  function renderChart() {
    if (!chart || !canvas) return;

    const colors = getChartColors();
    chart.data.labels = preparedPoints.map((point) => point.label);
    chart.data.datasets[0].data = preparedPoints.map((point) => point.costUsd);
    chart.data.datasets[0].borderColor = colors.primary;
    chart.data.datasets[0].pointBackgroundColor = colors.primary;
    chart.data.datasets[0].pointBorderColor = colors.page;
    chart.data.datasets[0].backgroundColor = (context) => {
      const { chart: activeChart } = context;
      const { ctx, chartArea } = activeChart;
      if (!chartArea) return withAlpha(colors.primary, 0.14);

      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      gradient.addColorStop(0, withAlpha(colors.primary, 0.18));
      gradient.addColorStop(1, withAlpha(colors.primary, 0.01));
      return gradient;
    };
    chart.options.color = colors.muted;
    chart.options.scales.x.grid.color = withAlpha(colors.border, 0.5);
    chart.options.scales.x.ticks.color = colors.muted;
    chart.options.scales.y.ticks.color = colors.muted;
    chart.options.plugins.tooltip.backgroundColor = colors.surface;
    chart.options.plugins.tooltip.borderColor = colors.border;
    chart.options.plugins.tooltip.titleColor = colors.primary;
    chart.options.plugins.tooltip.bodyColor = colors.primary;
    chart.update();
  }

  onMount(() => {
    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'USD Cost',
            data: [],
            borderWidth: 2,
            cubicInterpolationMode: 'monotone',
            fill: true,
            pointHoverRadius: 5,
            pointRadius: 3,
            pointBorderWidth: 2,
            tension: 0.35
          }
        ]
      },
      options: {
        animation: false,
        maintainAspectRatio: false,
        responsive: true,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            borderWidth: 1,
            displayColors: false,
            padding: 12,
            callbacks: {
              title(items) {
                const point = preparedPoints[items[0]?.dataIndex];
                return point?.tooltipLabel || '';
              },
              label(item) {
                return `Cost: ${formatUsd(item.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            border: {
              display: false
            },
            grid: {
              drawBorder: false
            },
            ticks: {
              autoSkip: true,
              maxRotation: 0
            }
          },
          y: {
            beginAtZero: true,
            border: {
              display: false
            },
            grid: {
              display: false
            },
            ticks: {
              callback(value) {
                return formatUsd(value);
              }
            }
          }
        }
      }
    });

    renderChart();
    themeObserver = new MutationObserver(renderChart);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'dir']
    });
  });

  onDestroy(() => {
    themeObserver?.disconnect();
    chart?.destroy();
  });
</script>

<canvas bind:this={canvas} aria-label="Cost over time chart"></canvas>

<style>
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    color: var(--ui-text-primary);
  }
</style>
