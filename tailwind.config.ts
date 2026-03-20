import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          forest: "#1a3a2a",
          sage: "#2d5a3d",
          light: "#4a7c5c",
          gold: "#c5a55a",
          cream: "#f5f0e8",
          warm: "#faf7f2",
          dark: "#0f1f17",
          text: "#1a1a1a",
          muted: "#6b7280",
        },
        portal: {
          bg: "#f8fafc",
          sidebar: "#0f1f17",
          card: "#ffffff",
          accent: "#2d5a3d",
          hover: "#e8f0eb",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ['"Source Sans 3"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
