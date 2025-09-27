/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      maxWidth: {
        content: "1200px", // nice readable width
        card: "500px", // for About/KPI alignment
      },
      spacing: {
        section: "4rem", // consistent top/bottom padding
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
