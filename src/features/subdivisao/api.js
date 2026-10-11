import { api } from '../../api/cliente';

export async function listarSubdivisoes(agrupamentoId, { ativo } = {}) {
  const { data } = await api.get(`/agrupamentos/${agrupamentoId}/subdivisoes`, { params: { ativo } });
  return data;
}

export async function obterSubdivisao(agrupamentoId, id) {
  const { data } = await api.get(`/agrupamentos/${agrupamentoId}/subdivisoes/${id}`);
  return data;
}

export async function criarSubdivisao(agrupamentoId, subdivisao) {
  const { data } = await api.post(`/agrupamentos/${agrupamentoId}/subdivisoes`, subdivisao);
  return data;
}

export async function atualizarSubdivisao(agrupamentoId, id, subdivisao) {
  const { data } = await api.put(`/agrupamentos/${agrupamentoId}/subdivisoes/${id}`, subdivisao);
  return data;
}

export async function inativarSubdivisao(agrupamentoId, id) {
  await api.delete(`/agrupamentos/${agrupamentoId}/subdivisoes/${id}`);
}

export async function reativarSubdivisao(agrupamentoId, id) {
  const { data } = await api.patch(`/agrupamentos/${agrupamentoId}/subdivisoes/${id}/reativar`);
  return data;
}
