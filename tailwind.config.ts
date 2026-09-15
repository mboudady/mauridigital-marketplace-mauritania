import type { Config } from "tailwindcss";

// Dark, native-app palette: near-black surfaces (not literally #000, for
// depth) with a single vivid accent. Deliberately NOT TikTok's cyan/pink
// duotone — that's their trademarked visual identity — but the same
// register: dark, high-contrast, cinematic for video, calm for dashboards.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#F4F4F6",
          100: "#E4E4E8",
          300: "#9C9CA8",
          400: "#6E6E7A",
          500: "#4A4A54",
          600: "#333339",
          700: "#232327",
          800: "#18181B",
          850: "#141416",
          900: "#0E0E10",
          950: "#08080A",
        },
        spark: {
          // primary accent — electric violet
          300: "#C4B0FF",
          400: "#A480FF",
          500: "#8A5CFF",
          600: "#7440E6",
          700: "#5C2ECC",
        },
        gold: {
          // secondary accent — ratings, highlights, live badge
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
