/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6C5CE7',
          dark: '#5A4DE1',
          light: '#A29BFE'
        }
      },
      boxShadow: {
        glow: '0 0 40px rgba(108,92,231,0.35)'
      },
      animation: {
        float: 'float 10s ease-in-out infinite',
        drift: 'drift 16s linear infinite'
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(-4px)' },
          '50%': { transform: 'translateY(4px)' }
        },
        drift: {
          '0%': { transform: 'translateX(-10%)' },
          '100%': { transform: 'translateX(110%)' }
        }
      }
    }
  },
  plugins: []
};