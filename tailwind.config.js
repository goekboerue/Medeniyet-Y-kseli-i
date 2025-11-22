/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        gold: '#FFD700',
        land: '#8B4513',
        pop: '#4682B4',
        tech: '#9370DB',
      },
      keyframes: {
        'float-up': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-20px) scale(0.9)' },
        },
        'sway': {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        'rain': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '20%': { opacity: '0.5' },
          '100%': { transform: 'translateY(60px)', opacity: '0' },
        },
        'snow': {
          '0%': { transform: 'translateY(-10px) translateX(-5px)', opacity: '0' },
          '20%': { opacity: '0.8' },
          '100%': { transform: 'translateY(100%) translateX(15px) rotate(45deg)', opacity: '0' },
        },
        'scan': {
          '0%': { top: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        'twinkle': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        'upgrade-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)', borderColor: 'rgba(16, 185, 129, 1)' },
          '70%': { boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)', borderColor: 'rgba(16, 185, 129, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)', borderColor: 'rgba(75, 85, 99, 1)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-up': 'float-up 0.8s ease-out forwards',
        'sway': 'sway 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'rain': 'rain 0.8s linear infinite',
        'snow': 'snow 3s linear infinite',
        'scan': 'scan 3s linear infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'upgrade': 'upgrade-pulse 0.6s ease-out',
        'pop-in': 'pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }
    },
  },
  plugins: [],
}