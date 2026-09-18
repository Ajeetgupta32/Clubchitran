/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },
        paper: {
          50: '#FDFCFB',
          100: '#FAF8F5', // primary warm archival canvas
          200: '#F4EFEA', // secondary warm section/card tint
          300: '#E8E2D5', // hairline print border
          400: '#DDD5C5',
          500: '#C2B8A3'
        },
        lens: {
          DEFAULT: '#1C1917', // camera body obsidian
          muted: '#292524',
          amber: '#C25E2E', // warm lens coating
          copper: '#B45309',
          gold: '#C59B27',
          sage: '#3F5E4D'
        },
        ink: {
          DEFAULT: '#1C1917',
          secondary: '#57534E',
          muted: '#78716C'
        }
      }
    },
  },
  plugins: [],
}
