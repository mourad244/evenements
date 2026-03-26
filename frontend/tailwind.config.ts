import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f8ff",
          100: "#e8efff",
          200: "#c8d8ff",
          300: "#9ebcff",
          400: "#7197ff",
          500: "#456ef5",
          600: "#2f54d3",
          700: "#2643aa",
          800: "#233a89",
          900: "#22336f"
        },
        ink: "#0f172a",
        mist: "#f8fafc",
        line: "#dbe4f0"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(15, 23, 42, 0.08)"
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top left, rgba(69, 110, 245, 0.14), transparent 32%), linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)"
      }
    }
  },
  plugins: []
};

export default config;
