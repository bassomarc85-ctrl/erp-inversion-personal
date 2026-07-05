import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0B0E11",
        surface: "#12161B",
        surfacealt: "#171C22",
        border: "#232A32",
        ink: "#E7EAEE",
        muted: "#8B94A1",
        accent: "#3E6E63",
        accentlight: "#5C9285",
        profit: "#3DDC84",
        loss: "#E5484D",
        alert: "#F5A623",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
