/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      // Color tokens — see docs/UI_DESIGN.md
      colors: {
        // Map background / app shell
        surface: {
          DEFAULT: '#020617',  // slate-950
          raised: '#0f172a',   // slate-900
          overlay: '#1e293b',  // slate-800
        },
        // Primary accent (byway highlight, CTAs)
        accent: {
          DEFAULT: '#16a34a',  // green-600
          light: '#4ade80',    // green-400
        },
        // POI markers
        poi: '#0ea5e9',        // sky-500
      },
    },
  },
  plugins: [],
}
