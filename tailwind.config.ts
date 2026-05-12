import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0D9488',
          light: '#0FAB96',
          dark: '#0B7E72',
          50: '#F0FBFA',
          100: '#CCF1ED',
          500: '#0D9488',
          600: '#0B7E72',
          700: '#0A6A60',
        },
        gold: {
          DEFAULT: '#CA8A04',
          light: '#E8A715',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        sans: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(13, 148, 136, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
