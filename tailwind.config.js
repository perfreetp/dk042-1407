/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        sans: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-from-bottom-2': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-from-bottom-4': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'zoom-in-95': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 300ms ease-out both',
        'slide-in-from-bottom-2': 'slide-in-from-bottom-2 300ms ease-out both',
        'slide-in-from-bottom-4': 'slide-in-from-bottom-4 500ms ease-out both',
        'zoom-in-95': 'zoom-in-95 200ms ease-out both',
        shimmer: 'shimmer 2s infinite',
      },
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a4bbfc',
          400: '#7b94f8',
          500: '#596df3',
          600: '#3e4ce7',
          700: '#323bcd',
          800: '#2a33a5',
          900: '#272f82',
          950: '#1a1e50',
        },
      },
    },
  },
  plugins: [],
};
