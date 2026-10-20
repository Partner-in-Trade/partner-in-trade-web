/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pit: {
          bg: '#0B0E14',
          card: '#121722',
          border: '#1E2638',
          accent: '#6366F1',
          profit: '#10B981',
          loss: '#F43F5E',
        }
      }
    },
  },
  plugins: [],
};