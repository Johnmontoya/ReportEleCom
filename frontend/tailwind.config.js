/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#e0e8ff",
          100: "#b9c7ff",
          400: "#7c93ff",
          500: "#5a75fd",
          600: "#4455d8",
          700: "#3641b4",
          800: "#272e88",
          900: "#1b1e5a",
          950: "#0e1132",
        },
        accent: {
          400: "#ff6bb3",
          500: "#ee4997",
          600: "#d02878",
        },
        dark: {
          800: "#1A1D27",
          900: "#0D0F16",
          950: "#07080b",
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 8s ease-in-out infinite alternate',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { opacity: '0.4', transform: 'scale(1)' },
          '100%': { opacity: '0.6', transform: 'scale(1.1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
