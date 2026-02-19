/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2196F3",
        secondary: "#4CAF50",
        danger: "#f44336",
      },
    },
  },
  plugins: [],
}