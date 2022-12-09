const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx,vue}'],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        mono: ['Inconsolata', ...defaultTheme.fontFamily.mono],
        sans: ['"Source Sans 3"', ...defaultTheme.fontFamily.sans],
        serif: ['Cormorant', ...defaultTheme.fontFamily.serif],
      },
      colors: {
        red: 'rgb(202,38,38)',
        green: 'rgb(36,94,7)',
      },
    },
  },
  plugins: [],
};
