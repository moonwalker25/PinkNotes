/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        bounce: 'bounce 1s infinite',
      },
    },
  },
  plugins: [],
};

module.exports = config;
