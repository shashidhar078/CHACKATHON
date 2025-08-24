/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyber Luxe Premium Color Palette
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#faf6ff',
          100: '#f2e9ff',
          200: '#e6d6ff',
          300: '#d4b5ff',
          400: '#bc8afd',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        accent: {
          50: '#fef1f7',
          100: '#fee5f1',
          200: '#fecce4',
          300: '#fea2cd',
          400: '#fd6bac',
          500: '#f43f8c',
          600: '#e21c6d',
          700: '#be125a',
          800: '#9f124d',
          900: '#811342',
          950: '#500724',
        },
        // Unified dark theme colors
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Semantic colors - Cyber Luxe Edition (All dark theme)
        background: '#0D0D12',
        surface: '#13131D',
        surfaceElevated: '#1A1A28',
        textPrimary: '#FFFFFF',
        textSecondary: '#A1A1AA',
        textTertiary: '#71717A',
        border: 'rgba(255, 255, 255, 0.08)',
        borderHover: 'rgba(255, 255, 255, 0.15)',
        divider: 'rgba(255, 255, 255, 0.05)',
        overlay: 'rgba(0, 0, 0, 0.7)',
        shadow: 'rgba(0, 0, 0, 0.25)',
        // Vibrant neon accents
        neon: {
          blue: '#00D4FF',
          purple: '#9333EA',
          pink: '#EC4899',
          cyan: '#00FFD1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 20px -3px rgba(0, 0, 0, 0.3), 0 10px 20px -2px rgba(0, 0, 0, 0.2)',
        'medium': '0 4px 30px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        'large': '0 10px 50px -10px rgba(0, 0, 0, 0.5), 0 2px 10px -2px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 25px rgba(0, 212, 255, 0.4)',
        'glow-purple': '0 0 25px rgba(147, 51, 234, 0.4)',
        'glow-pink': '0 0 25px rgba(236, 72, 153, 0.4)',
        'neon': '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #0ff, 0 0 35px #0ff, 0 0 40px #0ff',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
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
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0, -8px, 0)' },
          '70%': { transform: 'translate3d(0, -4px, 0)' },
          '90%': { transform: 'translate3d(0, -2px, 0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.6), 0 0 30px rgba(0, 212, 255, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0ff, 0 0 20px #0ff' },
          '100%': { boxShadow: '0 0 10px #fff, 0 0 15px #fff, 0 0 20px #0ff, 0 0 25px #0ff, 0 0 30px #0ff' },
        }
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}