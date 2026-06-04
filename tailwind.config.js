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
        // Aureate palette — Material 3 expressive-style token set
        // sourced from the Stitch design. Cream + antique gold +
        // deep green. Aligns with the brand lockup (green mountains +
        // saffron sun). Use Tailwind utilities like
        // `bg-aureate-surface`, `text-aureate-on-surface`,
        // `border-aureate-outline-variant`.
        aureate: {
          'primary': '#765a0a',
          'primary-container': '#c4a14e',
          'primary-fixed': '#ffdf9a',
          'primary-fixed-dim': '#e8c26b',
          'on-primary': '#ffffff',
          'on-primary-container': '#4c3800',
          'on-primary-fixed': '#251a00',
          'on-primary-fixed-variant': '#5a4300',
          'secondary': '#2b6954',
          'secondary-container': '#adedd3',
          'secondary-fixed': '#b0f0d6',
          'secondary-fixed-dim': '#95d3ba',
          'on-secondary': '#ffffff',
          'on-secondary-container': '#306d58',
          'on-secondary-fixed': '#002117',
          'on-secondary-fixed-variant': '#0b513d',
          'tertiary': '#755b1a',
          'tertiary-container': '#c1a15a',
          'tertiary-fixed': '#ffdf9c',
          'tertiary-fixed-dim': '#e5c277',
          'on-tertiary': '#ffffff',
          'on-tertiary-container': '#4c3800',
          'on-tertiary-fixed': '#251a00',
          'on-tertiary-fixed-variant': '#5b4302',
          'background': '#fdf9e9',
          'on-background': '#1d1c13',
          'surface': '#fdf9e9',
          'surface-dim': '#dedacb',
          'surface-bright': '#fdf9e9',
          'surface-variant': '#e6e3d3',
          'surface-tint': '#765a0a',
          'surface-container-lowest': '#ffffff',
          'surface-container-low': '#f8f4e4',
          'surface-container': '#f2eede',
          'surface-container-high': '#ece8d9',
          'surface-container-highest': '#e6e3d3',
          'on-surface': '#1d1c13',
          'on-surface-variant': '#4d4638',
          'inverse-surface': '#323126',
          'inverse-on-surface': '#f5f1e1',
          'inverse-primary': '#e8c26b',
          'outline': '#7f7666',
          'outline-variant': '#d0c5b3',
          'error': '#ba1a1a',
          'on-error': '#ffffff',
          'error-container': '#ffdad6',
          'on-error-container': '#93000a',
        },
      },
      fontFamily: {
        // Aureate typography stack — Source Serif 4 for body,
        // Playfair Display for headlines, Montserrat for labels.
        // All wired in app/layout.tsx via next/font/google with
        // restricted weights.
        'aureate-display': ['var(--font-playfair)', 'Georgia', 'serif'],
        'aureate-headline': ['var(--font-playfair)', 'Georgia', 'serif'],
        'aureate-body': ['var(--font-source-serif-4)', 'Georgia', 'serif'],
        'aureate-label': ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Aureate type scale lifted from the Stitch tokens. Use as
        // `text-aureate-display-lg` etc. Mobile-specific variant for
        // the largest display size to avoid horizontal overflow.
        'aureate-display-lg': ['64px', { lineHeight: '72px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'aureate-display-lg-mobile': ['44px', { lineHeight: '52px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'aureate-headline-lg': ['40px', { lineHeight: '48px', fontWeight: '600' }],
        'aureate-headline-lg-mobile': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'aureate-headline-md': ['28px', { lineHeight: '36px', fontWeight: '500' }],
        'aureate-body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'aureate-body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'aureate-label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.1em', fontWeight: '600' }],
      },
      spacing: {
        // Layout primitives from the Stitch tokens. Use
        // `px-aureate-desktop` for the standard editorial gutter,
        // `gap-aureate-gutter` for grid spacing.
        'aureate-desktop': '64px',
        'aureate-mobile': '20px',
        'aureate-gutter': '24px',
        'aureate-unit': '8px',
      },
      maxWidth: {
        'aureate-container': '1280px',
      },
      transitionTimingFunction: {
        // Cubic for the reveal-on-scroll motion. Lifted from the
        // mockup styles for consistency across primitives.
        'aureate-reveal': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
