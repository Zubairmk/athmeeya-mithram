import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAFBF8",
        surface: "#FFFFFF",
        line: "#E4E8E1",
        ink: {
          DEFAULT: "#13201A",
          muted: "#5B6960",
          faint: "#8C978F",
        },
        green: {
          DEFAULT: "#0E5C43",
          deep: "#0A4433",
          soft: "#E3EFE9",
          line: "#BFDBCE",
        },
        gold: {
          DEFAULT: "#C79A46",
          light: "#E7C77E",
          soft: "#F4E9D3",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
        amiri: ["var(--font-amiri)", "serif"],
        malayalam: ["var(--font-malayalam)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
