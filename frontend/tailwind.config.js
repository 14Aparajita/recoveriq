/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Official Razorpay Blue
        rzp: {
          blue:    '#0252ea',
          blue50:  '#eef3fe',
          blue100: '#d5e3fc',
          blue200: '#a9c5fa',
          blue400: '#4d82ef',
          blue600: '#0252ea',
          blue700: '#0144c4',
          blue800: '#0136a0',
          blue900: '#01277d',
          dark:    '#0f172a',
        },
        primary: {
          50:  '#eef3fe',
          100: '#d5e3fc',
          200: '#a9c5fa',
          300: '#7da8f7',
          400: '#4d82ef',
          500: '#1a5fe8',
          600: '#0252ea',
          700: '#0144c4',
          800: '#0136a0',
          900: '#01277d',
          950: '#011453',
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.25s ease-out',
        'shimmer':    'shimmer 2s infinite linear',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-sm':  'bounceSm 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSm: {
          '0%, 100%': { transform: 'translateY(-4px)' },
          '50%':      { transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'card':   '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.04)',
        'card-md': '0 4px 6px -1px rgba(0,0,0,.07), 0 2px 4px -2px rgba(0,0,0,.05)',
        'card-lg': '0 10px 15px -3px rgba(0,0,0,.08), 0 4px 6px -4px rgba(0,0,0,.05)',
        'rzp':    '0 4px 14px 0 rgba(2,82,234,.25)',
        'rzp-lg': '0 8px 30px 0 rgba(2,82,234,.30)',
      },
    },
  },
  plugins: [],
}