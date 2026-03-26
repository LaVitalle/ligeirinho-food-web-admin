import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor de Resposta (Response Interceptor)
api.interceptors.response.use(
  (response) => {
    // Aqui nós pegamos o 'data' principal do Axios, que contém o body enviado pelo NestJS
    // E já desestruturamos no formato exato que o professor exigiu
    const { data, status, message } = response.data;

    // Retornamos o objeto limpo. Agora, quem chamar a API não precisa mais lidar com a "casca" do Axios.
    return { data, status, message };
  },
  (error) => {
    // Tratamento de Erros: Se o NestJS retornar um erro (ex: 404, 400), 
    // ele provavelmente enviou a resposta no mesmo formato { data, status, message }.
    // Nós interceptamos esse erro e mantemos o mesmo padrão para facilitar o tratamento no front.
    if (error.response && error.response.data) {
      const { data, status, message } = error.response.data;
      
      // Dica: No futuro, você pode colocar um alerta global de erro aqui usando a variável 'message'
      // Exemplo: toast.error(message || 'Ocorreu um erro no servidor');

      return Promise.reject({ data, status, message });
    }

    // Se o erro for de rede (back-end fora do ar, internet caiu), repassamos o erro original
    return Promise.reject(error);
  }
);