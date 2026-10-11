import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  atualizarSubdivisao,
  criarSubdivisao,
  inativarSubdivisao,
  listarSubdivisoes,
  reativarSubdivisao,
} from './api';

export function useSubdivisoes(agrupamentoId, filtros = {}) {
  return useQuery({
    queryKey: ['subdivisoes', agrupamentoId, filtros],
    queryFn: () => listarSubdivisoes(agrupamentoId, filtros),
    enabled: Boolean(agrupamentoId),
  });
}

function useInvalidarSubdivisoes(agrupamentoId) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['subdivisoes', agrupamentoId] });
}

export function useCriarSubdivisao(agrupamentoId) {
  const invalidar = useInvalidarSubdivisoes(agrupamentoId);
  return useMutation({
    mutationFn: (subdivisao) => criarSubdivisao(agrupamentoId, subdivisao),
    onSuccess: invalidar,
  });
}

export function useAtualizarSubdivisao(agrupamentoId) {
  const invalidar = useInvalidarSubdivisoes(agrupamentoId);
  return useMutation({
    mutationFn: ({ id, subdivisao }) => atualizarSubdivisao(agrupamentoId, id, subdivisao),
    onSuccess: invalidar,
  });
}

export function useInativarSubdivisao(agrupamentoId) {
  const invalidar = useInvalidarSubdivisoes(agrupamentoId);
  return useMutation({
    mutationFn: (id) => inativarSubdivisao(agrupamentoId, id),
    onSuccess: invalidar,
  });
}

export function useReativarSubdivisao(agrupamentoId) {
  const invalidar = useInvalidarSubdivisoes(agrupamentoId);
  return useMutation({
    mutationFn: (id) => reativarSubdivisao(agrupamentoId, id),
    onSuccess: invalidar,
  });
}
