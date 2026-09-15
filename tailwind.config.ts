import type { Config } from "tailwindcss";

// Colors are CSS variables (see globals.css) that swap automatically with
// the OS light/dark preference via prefers-color-scheme — every component
// references these token names, so the swap cascades everywhere without
// touching component files.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "rgb(var(--ink-50) / <alpha-value>)",
          100: "rgb(var(--ink-100) / <alpha-value>)",
          300: "rgb(var(--ink-300) / <alpha-value>)",
          400: "rgb(var(--ink-400) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          850: "rgb(var(--ink-850) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
          950: "rgb(var(--ink-950) / <alpha-value>)",
        },
        spark: {
          300: "#C4B0FF",
          400: "#A480FF",
          500: "#8A5CFF",
          600: "#7440E6",
          700: "#5C2ECC",
        },
        gold: {
          400: "#FFC94D",
          500: "#FFB020",
          600: "#E69500",
        },
        // Legacy tokens kept so nothing else breaks; new work uses ink/spark/gold.
        sand: {
          50: "#FBF7F0",
          100: "#F5ECDC",
          200: "#E9D8B8",
          300: "#DABE8C",
          400: "#C9A15F",
          500: "#B3843F",
        },
        indigo: {
          50: "#EEF0FA",
          100: "#D3D8F0",
          400: "#4C5A9E",
          500: "#333F7A",
          600: "#252E5C",
          700: "#1A2143",
          800: "#12162E",
          900: "#0B0D1E",
        },
        clay: {
          400: "#C1613F",
          500: "#A84A2C",
          600: "#8A3A22",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
