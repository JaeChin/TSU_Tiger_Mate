import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: "#fdf2f3",
          100: "#fce7e8",
          200: "#f8d0d4",
          300: "#f2aab1",
          400: "#e97a86",
          500: "#dc4f60",
          600: "#c82e45",
          700: "#a82138",
          800: "#8c1e33",
          900: "#6B0F1A",
          950: "#3e0710",
        },
        gold: {
          50: "#fffef0",
          100: "#fffccc",
          200: "#fff899",
          300: "#fff266",
          400: "#FFE533",
          500: "#FFD700",
          600: "#D4B200",
          700: "#A88D00",
          800: "#7A6600",
          900: "#524400",
          950: "#2E2600",
        },
        surface: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0A0A0A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Outfit", "sans-serif"],
        body: ["var(--font-body)", "DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
