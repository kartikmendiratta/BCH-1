/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ffffff',
        secondary: '#a3a3a3',
        muted: '#525252',
        background: '#000000',
        surface: '#0a0a0a',
        card: '#111111',
        border: '#1f1f1f',
      }
    },
  },
  plugins: [],
}