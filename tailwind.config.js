/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(210, 40%, 98%)",
        card: "#fff",
        primary: { DEFAULT: "#1480d6", foreground: "#ffffff" },
        muted: { DEFAULT: "hsl(215 16% 94%)", foreground: "hsl(215 16% 40%)" },
        border: "rgba(2,6,23,.08)",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,.06)",
        ocean: "0 8px 32px rgba(20,128,214,.25)",
      },
    },
  },
  plugins: [],
};
