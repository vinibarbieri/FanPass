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
        background: "#111111", // Definindo fundo escuro
        'background-secundario': "#202020", // Definindo fundo escuro
        cinza: "#2B2B2B", // Definindo cinza escuro
        'cinza-claro': "#3B3B3B", // Definindo cinza claro
      },
    },
  },
  plugins: [],
};
