// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   darkMode: 'class',
//   content: ['./src/**/*.{js,jsx,ts,tsx}'],
//   theme: {
//     extend: {
//       fontFamily: {
//         sans:    ['Inter', 'system-ui', 'sans-serif'],
//         display: ['Cal Sans', 'Inter', 'sans-serif'],
//         mono:    ['JetBrains Mono', 'monospace'],
//       },
//       colors: {
//         brand: {
//           50:  '#eff6ff',
//           100: '#dbeafe',
//           400: '#60a5fa',
//           500: '#3b82f6',
//           600: '#2563eb',
//           700: '#1d4ed8',
//           900: '#1e3a8a',
//         },
//         surface: {
//           50:  '#f8fafc',
//           100: '#f1f5f9',
//           800: '#1e293b',
//           900: '#0f172a',
//           950: '#020617',
//         },
//       },
//       animation: {
//         'fade-in':      'fadeIn 0.5s ease forwards',
//         'slide-up':     'slideUp 0.5s ease forwards',
//         'slide-in':     'slideIn 0.3s ease forwards',
//         'pulse-slow':   'pulse 3s ease-in-out infinite',
//         'glow':         'glow 2s ease-in-out infinite',
//         'float':        'float 6s ease-in-out infinite',
//       },
//       keyframes: {
//         fadeIn:  { from: { opacity:0 }, to: { opacity:1 } },
//         slideUp: { from: { opacity:0, transform:'translateY(20px)' }, to: { opacity:1, transform:'translateY(0)' } },
//         slideIn: { from: { opacity:0, transform:'translateX(-10px)' }, to: { opacity:1, transform:'translateX(0)' } },
//         glow:    { '0%,100%': { boxShadow:'0 0 20px rgba(59,130,246,0.3)' }, '50%': { boxShadow:'0 0 40px rgba(59,130,246,0.6)' } },
//         float:   { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-10px)' } },
//       },
//       backgroundImage: {
//         'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
//         'gradient-mesh':    'radial-gradient(at 40% 20%, #1e3a8a 0, transparent 50%), radial-gradient(at 80% 0%, #1d4ed8 0, transparent 50%), radial-gradient(at 0% 50%, #0f172a 0, transparent 50%)',
//         'hero-pattern':     "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
//       },
//     },
//   },
//   plugins: [],
// };


/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand:   { DEFAULT:'#6366f1', light:'#818cf8', dark:'#4f46e5' },
        accent:  { DEFAULT:'#8b5cf6', light:'#a78bfa', dark:'#7c3aed' },
        surface: { 50:'#f8fafc', 100:'#f1f5f9', 800:'#1e293b', 900:'#0f172a', 950:'#020617' },
        card:    '#111827',
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'scale-in':   'scaleIn 0.3s ease forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'counter':    'counter 1s ease forwards',
        'wave':       'wave 1.5s ease-in-out infinite',
        'slide-in':   'slideIn 0.3s ease forwards',
      },
      keyframes: {
        fadeUp:    { from:{ opacity:0, transform:'translateY(16px)' }, to:{ opacity:1, transform:'translateY(0)' } },
        fadeIn:    { from:{ opacity:0 }, to:{ opacity:1 } },
        scaleIn:   { from:{ opacity:0, transform:'scale(0.95)' }, to:{ opacity:1, transform:'scale(1)' } },
        glowPulse: { '0%,100%':{ boxShadow:'0 0 20px rgba(99,102,241,0.2)' }, '50%':{ boxShadow:'0 0 40px rgba(99,102,241,0.5)' } },
        float:     { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-8px)' } },
        wave:      { '0%,100%':{ transform:'scaleY(0.5)' }, '50%':{ transform:'scaleY(1.5)' } },
        slideIn:   { from:{ opacity:0, transform:'translateX(-10px)' }, to:{ opacity:1, transform:'translateX(0)' } },
      },
      backgroundImage: {
        'gradient-brand':  'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'gradient-cool':   'linear-gradient(135deg, #6366f1, #06b6d4)',
        'gradient-warm':   'linear-gradient(135deg, #f59e0b, #ef4444)',
        'gradient-green':  'linear-gradient(135deg, #22c55e, #16a34a)',
        'dot-pattern':     "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366f1' fill-opacity='0.06'%3E%3Ccircle cx='20' cy='20' r='1.5'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'brand':     '0 0 30px rgba(99,102,241,0.3)',
        'brand-sm':  '0 0 15px rgba(99,102,241,0.2)',
        'glass':     '0 8px 32px rgba(0,0,0,0.4)',
        'card':      '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};