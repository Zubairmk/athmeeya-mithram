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
        gold: {
          DEFAULT: "#C79A46",
          // Same accent, deepened for text on the ivory manuscript
          // background — raw gold is only 2.29:1 there (fails WCAG AA);
          // this variant clears 4.5:1. Keep using plain `gold` for
          // borders/fills and anything on the dark shell, where it
          // already passes.
          ink: "#91642B",
        },
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
