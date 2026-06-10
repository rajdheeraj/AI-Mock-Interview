/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      animation: {
        'fade-in':      'fadeIn 0.5s ease forwards',
        'slide-up':     'slideUp 0.5s ease forwards',
        'slide-in':     'slideIn 0.3s ease forwards',
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'glow':         'glow 2s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity:0 }, to: { opacity:1 } },
        slideUp: { from: { opacity:0, transform:'translateY(20px)' }, to: { opacity:1, transform:'translateY(0)' } },
        slideIn: { from: { opacity:0, transform:'translateX(-10px)' }, to: { opacity:1, transform:'translateX(0)' } },
        glow:    { '0%,100%': { boxShadow:'0 0 20px rgba(59,130,246,0.3)' }, '50%': { boxShadow:'0 0 40px rgba(59,130,246,0.6)' } },
        float:   { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-10px)' } },
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh':    'radial-gradient(at 40% 20%, #1e3a8a 0, transparent 50%), radial-gradient(at 80% 0%, #1d4ed8 0, transparent 50%), radial-gradient(at 0% 50%, #0f172a 0, transparent 50%)',
        'hero-pattern':     "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};