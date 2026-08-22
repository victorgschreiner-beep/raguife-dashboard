import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Caminho relativo — garante que os assets carreguem corretamente quando o
  // build for hospedado como GitHub Pages de projeto (usuario.github.io/repo/),
  // e continua funcionando normalmente em qualquer outro host estático.
  base: './',
  server: {
    host: true,
    port: 5173
  }
})
