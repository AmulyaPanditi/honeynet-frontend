/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#070b12',
          surface: '#0d131f',
          card: '#111827',
          cardHover: '#162033',
          border: '#1f293d',
          borderLight: '#2b3952',
          text: '#f1f5f9',
          muted: '#8191ab',
          cyan: '#06b6d4',
          cyanGlow: 'rgba(6, 182, 212, 0.15)',
          emerald: '#10b981',
          emeraldGlow: 'rgba(16, 185, 129, 0.15)',
          amber: '#f59e0b',
          amberGlow: 'rgba(245, 158, 11, 0.15)',
          rose: '#f43f5e',
          roseGlow: 'rgba(244, 63, 94, 0.15)',
          purple: '#a855f7',
          purpleGlow: 'rgba(168, 85, 247, 0.15)',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 18px -3px rgba(6, 182, 212, 0.35)',
        'glow-rose': '0 0 18px -3px rgba(244, 63, 94, 0.35)',
        'glow-purple': '0 0 18px -3px rgba(168, 85, 247, 0.35)',
        'glow-emerald': '0 0 18px -3px rgba(16, 185, 129, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
