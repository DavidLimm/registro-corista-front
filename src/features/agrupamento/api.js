import { api } from '../../api/cliente';

export async function listarAgrupamentos({ tipo, ativo } = {}) {
  const { data } = await api.get('/agrupamentos', { params: { tipo, ativo } });
  return data;
}

export async function obterAgrupamento(id) {
  const { data } = await api.get(`/agrupamentos/${id}`);
  return data;
}

export async function criarAgrupamento(agrupamento) {
  const { data } = await api.post('/agrupamentos', agrupamento);
  return data;
}

export async function atualizarAgrupamento(id, agrupamento) {
  const { data } = await api.put(`/agrupamentos/${id}`, agrupamento);
  return data;
}

export async function inativarAgrupamento(id) {
  await api.delete(`/agrupamentos/${id}`);
}

export async function reativarAgrupamento(id) {
  const { data } = await api.patch(`/agrupamentos/${id}/reativar`);
  return data;
}
