/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': 'var(--primary-dark)',
        'primary-darker': 'var(--primary-darker)',
        'accent-gold': 'var(--accent-gold)',
        'accent-brown': 'var(--accent-brown)',
        'accent-brown-light': 'var(--accent-brown-light)',
        'accent-brown-dark': 'var(--accent-brown-dark)',
        'text-light': 'var(--text-light)',
        'text-dark': 'var(--text-dark)',
        'text-muted': 'var(--text-muted)',
        'error-red': 'var(--error-red)',
        'success-green': 'var(--success-green)',
        'bg-dark': 'var(--bg-dark)',
        'bg-darker': 'var(--bg-darker)',
        'border': 'var(--border)',
      },
      fontFamily: {
        'cinzel': 'var(--font-cinzel)',
        'lora': 'var(--font-lora)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
      },
    },
  },
  plugins: [],
} 