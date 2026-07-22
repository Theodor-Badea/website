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
       'cyber-bg': '#080510',       // Main page background
       'cyber-card': '#0f0b1e',     // Card element backgrounds
       'cyber-border': '#221a3c',   // Borders and dividers
       'cyber-purple': '#8b5cf6',   // Primary theme purple accent
       'cyber-neon': '#a78bfa',     // Highlight/alert purple text
       'cyber-glow': '#f472b6',     // Pink accents and glow effects

        brand: {
          light: "#c4b5fd", 
          DEFAULT: "#8b5cf6", 
          dark: "#6d28d9", 
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Fira Code", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(168, 85, 247, 0.25)',
        'glow-md': '0 0 20px rgba(168, 85, 247, 0.4)',
        'glow-lg': '0 0 35px rgba(168, 85, 247, 0.6)',
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
