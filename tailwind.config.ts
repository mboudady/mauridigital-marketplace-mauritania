import type { Config } from "tailwindcss";

// Design direction: a Sahel-inspired marketplace palette — warm sand and
// deep indigo (echoing Mauritanian textiles and the Sahara at dusk), not the
// generic SaaS blue-and-white. Serif display for warmth/trust, clean sans
// for UI density (product grids, dashboards).
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
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
