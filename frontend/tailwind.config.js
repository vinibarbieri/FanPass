/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // cobre o arquivo HTML
    "./src/**/*.{js,jsx,ts,tsx}", // cobre tudo no src
  ],
  theme: {
    extend: {
      colors: {
        vermelho: "#FF595C", // Definindo vermelho claro para botões
        cinza: "#2B2B2B", // Definindo cinza escuro
      },
    },
  },
  plugins: [],
};
