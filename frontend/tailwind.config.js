/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Defining the Aegis AI Brand Palette
        navy: {
          900: '#0f172a',
          950: '#020617', // The primary background color
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        blue: {
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      backgroundImage: {
        // Custom gradient for glassmorphism borders and accents
        'glass-gradient': 'linear-gradient(to right bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'cyan-glow': 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(2, 6, 23, 0) 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      // Ensuring backdrop blur utilities are explicitly available
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '20px',
        '2xl': '40px',
      },
    },
  },
  plugins: [
    // You can add tailwindcss-animate or other plugins here if needed later
  ],
}