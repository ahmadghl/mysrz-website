/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Sourced from the lockup SVG so the whole site palette
          // matches the logo art.
          primary: '#15301F', // wordmark dark green (was #1a1a1a near-black)
          accent: '#D9A227',  // logo saffron sun + separator line (was #d4af37)
          paper: '#F1F6E6',   // logo snow-cap cream (was #faf9f6)
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
