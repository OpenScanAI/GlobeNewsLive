import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'void': '#060810',
        'surface': '#0a0e14',
        'elevated': '#0f1520',
        'panel': '#141e2a',
        'border-subtle': 'rgba(42, 58, 74, 0.3)',
        'border-default': 'rgba(42, 58, 74, 0.5)',
        'accent-green': '#00ff88',
        'accent-blue': '#00ccff',
        'accent-red': '#ff2244',
        'accent-orange': '#ff6633',
        'accent-gold': '#ffaa00',
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
        body: ['var(--font-geist)', 'var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        geist: ['var(--font-geist)', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: []
}
export default config
