/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3B82F6',
        'secondary': '#10B981',
        'danger': '#EF4444',
        'warning': '#F59E0B',
      },
    },
  },
  plugins: [],
}
