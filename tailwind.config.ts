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
        // ThyNetwork-style vivid palette (food-forward)
        brand: "#0fb36a",       // fresh herb green
        accent: "#ff8a00",      // mango orange
        "accent-2": "#e91e63",  // beet pink
        "accent-3": "#3f51b5",  // blue plate
        ink: "#121212",
        muted: "#5a5a5a",
        bg: "#fffdf8",          // warm, food-friendly white
        card: "#ffffff",
      },
      borderRadius: {
        brand: "14px",
        '10': "10px",
        '12': "12px",
      },
      boxShadow: {
        brand: "0 10px 30px rgba(0, 0, 0, 0.07)",
      },
      ringColor: {
        brand: "rgba(15, 179, 106, 0.25)",
      },
      backdropSaturate: {
        '140': '1.4',
      },
    },
  },
  plugins: [],
};

export default config;