import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "#faf9f7", dim: "#f2f0ec", deep: "#e8e5df" },
        ink: { DEFAULT: "#1a1815", soft: "#4a463f", faint: "#8a847a" },
        accent: { DEFAULT: "#b4783c", soft: "#d9a86e", deep: "#8a5728", wash: "#f6efe6" },
        good: { DEFAULT: "#1b7a4d", soft: "#e6f4ec" },
        bad: { DEFAULT: "#b03030", soft: "#fbeaea" },
        line: { DEFAULT: "rgba(26,24,21,0.10)", bright: "rgba(26,24,21,0.16)" },
      },
      fontFamily: {
        sans: ["var(--font-host)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,24,21,0.04), 0 24px 60px -24px rgba(26,24,21,0.10)",
        "card-lg": "0 2px 4px rgba(26,24,21,0.05), 0 40px 90px -40px rgba(26,24,21,0.16)",
      },
    },
  },
  plugins: [],
};
export default config;
