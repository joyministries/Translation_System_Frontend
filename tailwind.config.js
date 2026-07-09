/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        mono: ['Menlo', 'Monaco', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2d8fcb',
          600: '#1a6fa8',
          700: '#15578a',
          800: '#0f3d62',
          900: '#0a2540',
        },
      },
    },
  },
  plugins: [],
};
