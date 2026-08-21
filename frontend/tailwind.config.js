/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ef233c',
          dark: '#b3122a',
          bright: '#ff4d5e',
        },
        surface: '#12141c',
        'surface-hover': '#171a24',
        elevated: '#0e1016',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // já temos nosso próprio reset/base em styles.scss; evita conflito
  },
};
