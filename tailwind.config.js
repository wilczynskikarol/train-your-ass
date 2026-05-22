/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Theme-aware colours — driven by CSS custom properties on body.theme-f / body.theme-m
        'th-bg':            'var(--th-bg)',
        'th-bg-subtle':     'var(--th-bg-subtle)',
        'th-surface':       'var(--th-surface)',
        'th-surface-alt':   'var(--th-surface-alt)',
        'th-ink':           'var(--th-ink)',
        'th-ink-mid':       'var(--th-ink-mid)',
        'th-ink-mute':      'var(--th-ink-mute)',
        'th-ink-faint':     'var(--th-ink-faint)',
        'th-accent':        'var(--th-accent)',
        'th-accent-deep':   'var(--th-accent-deep)',
        'th-accent-soft':   'var(--th-accent-soft)',
        'th-accent-tint':   'var(--th-accent-tint)',
        'th-success':       'var(--th-success)',
        'th-warn':          'var(--th-warn)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        ui:      ['var(--font-ui)'],
        num:     ['var(--font-num)'],
      },
      boxShadow: {
        'th-sm': 'var(--shadow-sm)',
        'th-md': 'var(--shadow-md)',
        'th-lg': 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
};
