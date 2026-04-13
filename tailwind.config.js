import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,svelte}'],
  darkMode: 'class',
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        ring: 'var(--ring)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        sidebar: 'var(--sidebar)',
        'sidebar-accent': 'var(--sidebar-accent)',
        success: 'var(--success)',
        'success-foreground': 'var(--success-foreground)',
        warning: 'var(--warning)',
        'warning-foreground': 'var(--warning-foreground)',
        info: 'var(--info)',
        'info-foreground': 'var(--info-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 2px)',
        DEFAULT: 'var(--radius)',
        md: 'var(--radius)',
        lg: 'calc(var(--radius) + 2px)',
        xl: 'calc(var(--radius) + 4px)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        popover: 'var(--shadow-popover)',
        dropdown: 'var(--shadow-dropdown)',
        modal: 'var(--shadow-modal)',
        'inline-control': 'var(--shadow-inline-control)',
      },
      fontFamily: {
        sans: ['var(--font-family-base)'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        default: 'var(--motion-default)',
        slow: 'var(--motion-slow)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities, theme }) => {
      addUtilities({
        '.transition-fast': {
          'transition-duration': theme('transitionDuration.fast'),
          'transition-timing-function': theme('transitionTimingFunction.standard'),
        },
        '.transition-default': {
          'transition-duration': theme('transitionDuration.default'),
          'transition-timing-function': theme('transitionTimingFunction.standard'),
        },
        '.transition-slow': {
          'transition-duration': theme('transitionDuration.slow'),
          'transition-timing-function': theme('transitionTimingFunction.standard'),
        },
      });
    }),
  ],
};
