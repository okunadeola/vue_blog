/** @type {import('tailwindcss').Config} */
import TailwindScrollbar from 'tailwind-scrollbar'

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  // purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        SourceSan: ['Source+Sans+3', 'system-ui', 'sans-serif'],
        SourceSerifPro: ['SourceSerifPro', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [TailwindScrollbar()],
}
