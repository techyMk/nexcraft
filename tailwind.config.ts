import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        bg: "#050816",
        surface: "#0B1120",
        "surface-2": "#111827",
        border: "rgba(255,255,255,0.08)",
        text: "#F8FAFC",
        "text-2": "#94A3B8",
        primary: {
          DEFAULT: "#5B8CFF",
          50: "#EEF3FF",
          100: "#DDE7FF",
          200: "#BCD0FF",
          300: "#9AB8FF",
          400: "#79A0FF",
          500: "#5B8CFF",
          600: "#3B82F6",
          700: "#2563EB",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        accent: {
          DEFAULT: "#3B82F6",
          purple: "#7C3AED",
          cyan: "#00D4FF",
        },
        success: "#22C55E",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-space)", "Space Grotesk", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "18px",
        "2xl": "22px",
        "3xl": "28px",
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg,#3B82F6 0%,#5B8CFF 35%,#7C3AED 100%)",
        "gradient-electric": "linear-gradient(135deg,#5B8CFF 0%,#7C3AED 100%)",
        "gradient-glow": "linear-gradient(135deg,#00D4FF 0%,#3B82F6 100%)",
        "gradient-dark": "linear-gradient(180deg,#050816 0%,#0F172A 100%)",
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 60px -10px rgba(91,140,255,0.5)",
        "glow-purple": "0 0 60px -10px rgba(124,58,237,0.5)",
        soft: "0 10px 40px -10px rgba(0,0,0,0.6)",
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 60px -20px rgba(0,0,0,0.7)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-x": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "pulse-slow": {
          "0%,100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "gradient-x": "gradient-x 8s ease infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
