/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4f8',
          100: '#dbe3f0',
          200: '#bcd0e4',
          300: '#90b2d4',
          400: '#5e8ec0',
          500: '#3e6fa5',
          600: '#2f5687',
          700: '#26456d',
          800: '#1d3353',
          900: '#111d33',
          950: '#0a0e2c', // corporate dark navy
        },
        accent: {
          cyan: '#00d1ff',
          hover: '#00b0d9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
