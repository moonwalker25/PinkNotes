/** @type {import('tailwindcss').Config} */

const config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
        pinknotes: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
      },

      boxShadow: {
        "pn-sm": "0 1px 2px rgba(15, 23, 42, 0.04)",
        "pn-card":
          "0 4px 16px rgba(15, 23, 42, 0.06)",
      },

      borderRadius: {
        "pn-card": "1rem",
        "pn-large": "1.5rem",
      },

      animation: {
        bounce: "bounce 1s infinite",
      },
    },
  },

  plugins: [],
};

module.exports = config;