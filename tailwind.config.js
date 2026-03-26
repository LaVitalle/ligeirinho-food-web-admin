/** @type {import('tailwindcss').Config} */
export default {
  // Diz ao Tailwind onde procurar pelas classes no seu código
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Cores baseadas no protótipo (Tons quentes de app de comida)
      colors: {
        brand: {
          red: '#ea1d2c',    // Vermelho principal (estilo iFood)
          orange: '#f97316', // Laranja para destaques e botões secundários
          light: '#fdf2f2',  // Fundo avermelhado super claro para cards
          dark: '#1e293b',   // Cor para textos principais
        }
      },
      // Tipografia limpa e moderna
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
      },
      // Arredondamentos mais suaves (amigáveis)
      borderRadius: {
        'lg': '0.75rem',
        'xl': '1.25rem',
        '2xl': '2rem',
      }
    },
  },
  plugins: [],
}