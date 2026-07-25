import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)', surface: 'var(--color-surface)', surfaceMuted: 'var(--color-surface-muted)', ink: 'var(--color-ink)', textMuted: 'var(--color-text-muted)', border: 'var(--color-border)', context: 'var(--color-context)', contextDark: 'var(--color-context-dark)', reference: 'var(--color-reference)', success: 'var(--color-success)', warning: 'var(--color-warning)', danger: 'var(--color-danger)', info: 'var(--color-info)'
      },
      fontFamily: { display: ['Sora', 'Inter', 'system-ui', 'sans-serif'], body: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { lc: '14px', xl: '20px' },
      boxShadow: { card: '0 4px 12px rgba(29, 34, 37, 0.06)' },
    },
  },
  plugins: [],
} satisfies Config
