import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.05)"
      }
    }
  },
  plugins: []
};

export default config;

