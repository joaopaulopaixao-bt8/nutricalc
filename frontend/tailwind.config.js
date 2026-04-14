/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        lime: { 400: "#a3e635", 500: "#84cc16", 600: "#65a30d" },
        dark: { 900: "#0a0e1a", 800: "#0f172a", 700: "#1e293b" },
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
