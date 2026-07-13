/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1F4D3F",   // koyu zümrüt
        secondary: "#2E7D64", // zümrüt
        accent: "#D9A441",    // altın
        light: "#F8F5EC",     // sıcak krem
        paper: "#ffffff",
        ink: "#0f172a"
      },
      boxShadow: { soft: "0 10px 30px rgba(0,0,0,.08)" },
      borderColor: { subtle: "#e5e7eb" }
    },
  },
  plugins: [],
}
