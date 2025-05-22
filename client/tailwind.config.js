/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EBF5FF',
          100: '#D6EBFF',
          200: '#ADD6FF',
          300: '#84C2FF',
          400: '#5BADFF',
          500: '#0A84FF', // Primary blue
          600: '#0064D0',
          700: '#0052AB',
          800: '#003F85',
          900: '#002D60',
        },
        success: {
          50: '#E6F9EF',
          100: '#CCF3DF',
          200: '#99E7BF',
          300: '#66DB9F',
          400: '#30D158', // Green
          500: '#28BB4E',
          600: '#20A444',
          700: '#188D39',
          800: '#10752F',
          900: '#085E24',
        },
        warning: {
          50: '#FFFAEB',
          100: '#FFF5D6',
          200: '#FFEAAD',
          300: '#FFE085',
          400: '#FFD65C',
          500: '#FF9F0A', // Amber
          600: '#DB8500',
          700: '#B26B00',
          800: '#8A5200',
          900: '#613900',
        },
        error: {
          50: '#FFEBEB',
          100: '#FFD6D6',
          200: '#FFADAD',
          300: '#FF8585',
          400: '#FF5C5C',
          500: '#FF453A', // Red
          600: '#DB2B20',
          700: '#B22018',
          800: '#8A1610',
          900: '#610D09',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      spacing: {
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}