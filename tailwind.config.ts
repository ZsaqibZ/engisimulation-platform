import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Engineering Blue (Primary Brand)
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb', // Main Action Color
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        // Software Specific Identity Colors
        matlab: {
          bg: '#fff1f0', // Light Red background
          text: '#cf1322', // Deep Red text
          border: '#ffa39e'
        },
        python: {
          bg: '#f0f5ff', // Light Blue
          text: '#1d39c4', // Deep Blue
          border: '#adc6ff'
        },
        ansys: {
          bg: '#fffbe6', // Light Gold
          text: '#d48806', // Deep Gold
          border: '#ffe58f'
        },
        labview: {
          bg: '#f6ffed', // Light Green
          text: '#389e0d', // Deep Green
          border: '#b7eb8f'
        },
        solidworks: {
           bg: '#fff0f6', // Light Pink/Red
           text: '#c41d7f', 
           border: '#ffadd2'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Ensure you have this plugin installed
  ],
};
export default config;