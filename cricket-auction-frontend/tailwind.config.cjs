/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['Bebas Neue', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          glow: 'hsl(var(--primary-glow))',
          dark: 'hsl(var(--primary-dark))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))'
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))'
        },
        'cat-a': {
          DEFAULT: 'hsl(var(--cat-a))',
          light: 'hsl(var(--cat-a-light))',
          dark: 'hsl(var(--cat-a-dark))'
        },
        'cat-b': {
          DEFAULT: 'hsl(var(--cat-b))',
          light: 'hsl(var(--cat-b-light))',
          dark: 'hsl(var(--cat-b-dark))'
        },
        'cat-c': {
          DEFAULT: 'hsl(var(--cat-c))',
          light: 'hsl(var(--cat-c-light))',
          dark: 'hsl(var(--cat-c-dark))'
        },
        'cat-d': {
          DEFAULT: 'hsl(var(--cat-d))',
          light: 'hsl(var(--cat-d-light))',
          dark: 'hsl(var(--cat-d-dark))'
        },
        netflix: {
          red: '#E50914',
          black: '#141414',
          dark: '#181818',
          gray: '#2F2F2F'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-100px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(100px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(50px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(229, 9, 20, 0.3)' },
          '50%': { boxShadow: '0 0 50px rgba(229, 9, 20, 0.6)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in-left': 'slide-in-left 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.6s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite'
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(229, 9, 20, 0.3)',
        'glow': '0 0 20px rgba(229, 9, 20, 0.4)',
        'glow-lg': '0 0 40px rgba(229, 9, 20, 0.5)',
        'glow-xl': '0 0 60px rgba(229, 9, 20, 0.6)',
        'netflix': '0 0 30px rgba(229, 9, 20, 0.3)',
        'card-hover': '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(229, 9, 20, 0.2)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
