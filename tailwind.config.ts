import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        shell: {
          DEFAULT: "#16332E",
          muted: "#9FB8B0",
        },
        gold: "#C79A46",
        manuscript: "#F7F1DF",
        ink: {
          DEFAULT: "#2B2419",
          muted: "#5C5342",
        },
      },
      fontFamily: {
        amiri: ["var(--font-amiri)", "serif"],
        malayalam: ["var(--font-malayalam)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
