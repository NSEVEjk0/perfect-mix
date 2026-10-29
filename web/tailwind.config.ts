import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F6F3",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#1A1A1A",
          soft: "#6B6B6B",
          faint: "#9A9A9A",
        },
        forest: {
          DEFAULT: "#0F3D2E",
          hover: "#0B2F24",
        },
        good: {
          DEFAULT: "#1B7A4E",
          soft: "#E8F5EE",
        },
        moderate: {
          DEFAULT: "#B45309",
          soft: "#FEF3E8",
        },
        bad: {
          DEFAULT: "#B91C1C",
          soft: "#FEE2E2",
        },
        line: {
          DEFAULT: "#E8E6E1",
          bright: "#EFEDE8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "14px",
        input: "8px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(26,26,26,0.04), 0 8px 24px -8px rgba(26,26,26,0.06)",
        "soft-hover": "0 2px 4px rgba(26,26,26,0.05), 0 16px 40px -12px rgba(26,26,26,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
