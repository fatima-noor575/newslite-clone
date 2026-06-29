import type { Config } from "tailwindcss";
export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        agro: { 50:"#f0fdf4",500:"#16a34a",600:"#15803d",700:"#14532d" }
      }
    }
  },
  plugins: [],
} satisfies Config;
