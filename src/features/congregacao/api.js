import { api } from '../../api/cliente';

export async function listarCongregacoes({ agrupamentoId, subdivisaoId, ativa } = {}) {
  const { data } = await api.get('/congregacoes', { params: { agrupamentoId, subdivisaoId, ativa } });
  return data;
}

export async function obterCongregacao(id) {
  const { data } = await api.get(`/congregacoes/${id}`);
  return data;
}

export async function criarCongregacao(congregacao) {
  const { data } = await api.post('/congregacoes', congregacao);
  return data;
}

export async function atualizarCongregacao(id, congregacao) {
  const { data } = await api.put(`/congregacoes/${id}`, congregacao);
  return data;
}

export async function inativarCongregacao(id) {
  await api.delete(`/congregacoes/${id}`);
}

export async function reativarCongregacao(id) {
  const { data } = await api.patch(`/congregacoes/${id}/reativar`);
  return data;
}
