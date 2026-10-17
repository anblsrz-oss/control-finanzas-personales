/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Sans humanista tipo señalética de metro; numerales tabulares vía .tabular en index.css.
        sans: ['"Source Sans 3 Variable"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Rampa de marca vía variables CSS (personalizable por admin en runtime).
        brand: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
        },
        // Superficies principales (fondo de página y de tarjetas/paneles).
        canvas: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        // Grises con tinte de esmalte azul medianoche (reemplaza el slate neutro de Tailwind).
        slate: {
          50: '#f3f5fa',
          100: '#e8ecf5',
          200: '#d5dcec',
          300: '#b5c0d9',
          400: '#8593b3',
          500: '#5f6e91',
          600: '#46557a',
          700: '#2b375a',
          800: '#1a2447',
          900: '#0f1731',
          950: '#080d20',
        },
        // Tintas de línea del diagrama: una por cuenta/categoría.
        line: {
          scarlet: 'rgb(var(--line-scarlet) / <alpha-value>)',
          cobalt: 'rgb(var(--line-cobalt) / <alpha-value>)',
          amber: 'rgb(var(--line-amber) / <alpha-value>)',
          green: 'rgb(var(--line-green) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}
