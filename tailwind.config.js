/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2E5077",   // koyu mavi
        secondary: "#4DA1A9", // turkuaz
        accent: "#79D7BE",    // açık yeşil
        light: "#F6F4F0",     // krem
        paper: "#ffffff",
        ink: "#0f172a"
      },
      boxShadow: { soft: "0 10px 30px rgba(0,0,0,.08)" },
      borderColor: { subtle: "#e5e7eb" }
    },
  },
  plugins: [],
}
