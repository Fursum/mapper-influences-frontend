const fallbackFontStack = [
  'Comfortaa Variable',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Roboto',
  'Oxygen',
  'Ubuntu',
  'Cantarell',
  'Fira Sans',
  'Droid Sans',
  'Helvetica Neue',
  'sans-serif',
];

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primaryColor)',
        secondary: 'var(--secondaryColor)',
        'primary-bg': 'var(--primaryColorBg)',
        'secondary-bg': 'var(--secondaryColorBg)',
        'login-bg': 'var(--loginScreenBg)',
        'button-bg': 'var(--buttonBg)',
        'button-outline': 'var(--buttonOutline)',
        'button-text': 'var(--buttonText)',
        text: 'var(--textColor)',
        'text-faded': 'var(--textColor-faded)',
        'text-primary': 'var(--primaryTextColor)',
        'text-secondary': 'var(--secondaryTextColor)',
        background: 'var(--bgColor-1)',
        'background-content': 'var(--bgColor-content)',
        'background-card': 'var(--bgColor-3)',
        'background-card-hover': 'var(--bgColor-3-hover)',
        reset: 'var(--reset)',
        'reset-bg': 'var(--resetBg)',
        danger: 'var(--danger)',
        'danger-bg': 'var(--dangerBg)',
        shadow: 'var(--shadowColor)',
        'shadow-hover': 'var(--shadowColor-hover)',
        white: 'var(--white)',
      },
      fontFamily: {
        fallback: fallbackFontStack,
        inter: ['Inter Variable', ...fallbackFontStack],
      },
    },
  },
  plugins: [],
};
