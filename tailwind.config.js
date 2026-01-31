/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0F172A',
        teal: '#10B981',
        amber: '#F59E0B',
        danger: '#EF4444',
        background: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
}
