/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f8f4',
          100: '#e1efe6',
          200: '#c5dfd0',
          300: '#9bc6b0',
          400: '#6ba88c',
          500: '#488c6e',
          600: '#357056',
          700: '#2c5946',
          800: '#254739',
          900: '#203c30',
          950: '#0e211a',
        },
        earth: {
          50: '#faf8f5',
          100: '#f4efe8',
          200: '#e8dfd3',
          300: '#d7c7b4',
          400: '#c2ab92',
          500: '#af9175',
          600: '#9b7b62',
          700: '#7e6250',
          800: '#675144',
          900: '#55433a',
          950: '#2e231e',
        },
        sage: {
          50: '#f5f7f5',
          100: '#e6ebe6',
          200: '#cfdbd0',
          300: '#adc2af',
          400: '#85a489',
          500: '#66876a',
          600: '#506c54',
          700: '#405643',
          800: '#354637',
          900: '#2c392e',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
