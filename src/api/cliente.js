import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
});

api.interceptors.request.use((config) => {
  const token = null; // TODO: obterToken() quando o AuthContext existir
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const pd = erro.response?.data ?? {};
    return Promise.reject({
      status: erro.response?.status ?? 0,
      titulo: pd.title,
      detalhe: pd.detail ?? 'Não foi possível completar a operação.',
      campos: pd.errors ?? [],
    });
  },
);
