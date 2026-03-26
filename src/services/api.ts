import axios from 'axios';

// Cria uma instância customizada do Axios
export const api = axios.create({
  // Puxa a URL do arquivo .env. Se não achar, usa um padrão de fallback.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
  
  // (Opcional) Define um tempo limite. Se o back-end demorar mais de 10s para responder, ele cancela e dá erro.
  timeout: 10000,
  
  // (Opcional) Já deixa preparado para aceitar JSON por padrão
  headers: {
    'Content-Type': 'application/json',
  }
});
