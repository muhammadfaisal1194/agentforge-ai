import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0F",
        card: "#13131F",
        border: "#2A2A3E",
        primary: "#8B5CF6",
        accent: "#06B6D4",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        agents: {
          researcher: "#06B6D4",
          analyst: "#8B5CF6",
          writer: "#10B981",
          reviewer: "#F59E0B",
          orchestrator: "#EC4899",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
        "bounce-subtle": "bounce 2s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
