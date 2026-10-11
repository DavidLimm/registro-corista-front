import axios from 'axios';
import { obterToken, notificarSessaoExpirada } from '../auth/token';

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ''}/v1/api`,
});

api.interceptors.request.use((config) => {
  const token = obterToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.response?.status === 401) {
      notificarSessaoExpirada();
    }
    const pd = erro.response?.data ?? {};
    return Promise.reject({
      status: erro.response?.status ?? 0,
      titulo: pd.title,
      detalhe: pd.detail ?? 'Não foi possível completar a operação.',
      campos: pd.errors ?? [],
    });
  },
);
