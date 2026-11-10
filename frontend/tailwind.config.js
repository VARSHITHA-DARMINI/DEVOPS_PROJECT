/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#101722',
          800: '#182230',
          700: '#202B3B',
          600: '#253346',
        },
        lime: {
          400: '#B8F34A',
          300: '#CEFF6B',
          500: '#9ADE2C',
        },
        cyan: {
          400: '#36CFC9',
          300: '#5DE9E3',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
