import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        glow: "0 0 105px 105px rgba(45,21,62,0.9)",
      },
      keyframes: {
        "blink-animation": {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "blink-1": "blink-animation 2s infinite 0.9s",
        "blink-2": "blink-animation 2s infinite 0.8s",
        "blink-3": "blink-animation 2s infinite 0.7s",
        "blink-4": "blink-animation 2s infinite 0.6s",
        "blink-5": "blink-animation 2s infinite 0.5s",
        "blink-6": "blink-animation 2s infinite 0.4s",
        "blink-7": "blink-animation 2s infinite 0.3s",
        "blink-8": "blink-animation 2s infinite 0.2s",
        "blink-9": "blink-animation 2s infinite 0.1s",
      },
    },
  },
  plugins: [],
};
export default config;
