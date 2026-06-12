import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',      // Black
        secondary: '#4D0000',    // Dark Red
        cream: '#FFF9EE',        // Cream
        white: '#FFFFFF',        // White
      },
      backgroundColor: {
        primary: '#000000',
        secondary: '#4D0000',
        cream: '#FFF9EE',
        white: '#FFFFFF',
      },
      textColor: {
        primary: '#000000',
        secondary: '#4D0000',
        cream: '#FFF9EE',
        white: '#FFFFFF',
      },
    },
  },
  plugins: [],
};

export default config;
