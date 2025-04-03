/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4DA8FF',
          DEFAULT: '#1E88E5',
          dark: '#0D47A1',
        },
        secondary: {
          light: '#FF8A65',
          DEFAULT: '#F4511E',
          dark: '#BF360C',
        },
      },
    },
  },
  plugins: [],
}
