/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0B0B0D',
        secondary: '#F2F2F2',
        accent: '#C92A3A',
        neutral: {
          900: '#141417',
          700: '#2A2A2E',
          500: '#6E6E73',
          300: '#B9B9BD',
          100: '#E8E8EA',
        },
        'bg-soft': '#0F1012',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
