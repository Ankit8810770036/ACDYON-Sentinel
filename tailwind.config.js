/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // High-Contrast Light Mode Palette Tokens
        midnight: '#EAEFF5',       // Primary Base: Cool slate-gray background for crisp card pop & contrast
        steel: {
          DEFAULT: '#FFFFFF',      // Secondary Base: Pure White cards & containers
          border: '#CBD5E1',       // Crisp Slate-300 borders
          hover: '#F1F5F9',
        },
        frost: '#0F172A',          // Text Main: Deep Slate-900 headings & body text
        slateMuted: '#64748B',     // Text Muted: Slate-500 secondary text & captions
        electric: {
          DEFAULT: '#0066FF',      // Accent Glow: Corporate Blue active links & states
          hover: '#297fff',
          glow: 'rgba(0, 102, 255, 0.15)',
        },
        sentinel: {
          DEFAULT: '#FF5722',      // Action Alert: Sentinel Orange CTA & warnings
          hover: '#ff6f42',
          glow: 'rgba(255, 87, 34, 0.2)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
