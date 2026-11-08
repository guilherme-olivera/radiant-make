/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        radiant: {
          50: '#fdf8f6',
          100: '#f9eee9',
          200: '#f3d9ce',
          300: '#e59a85',
          400: '#d96c56',
          500: '#c54e38',
          gold: '#c59d5f',
          dark: '#2c1e21',
          pink: '#e84a75',
          rose: '#fdf2f4'
        }
      }
    },
  },
  plugins: [],
}

