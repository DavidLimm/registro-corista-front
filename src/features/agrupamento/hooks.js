import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  atualizarAgrupamento,
  criarAgrupamento,
  inativarAgrupamento,
  listarAgrupamentos,
  obterAgrupamento,
  reativarAgrupamento,
} from './api';

export function useAgrupamentos(filtros = {}) {
  return useQuery({
    queryKey: ['agrupamentos', filtros],
    queryFn: () => listarAgrupamentos(filtros),
  });
}

export function useAgrupamento(id) {
  return useQuery({
    queryKey: ['agrupamentos', 'detalhe', id],
    queryFn: () => obterAgrupamento(id),
    enabled: Boolean(id),
  });
}

function useInvalidarAgrupamentos() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['agrupamentos'] });
}

export function useCriarAgrupamento() {
  const invalidar = useInvalidarAgrupamentos();
  return useMutation({
    mutationFn: criarAgrupamento,
    onSuccess: invalidar,
  });
}

export function useAtualizarAgrupamento() {
  const invalidar = useInvalidarAgrupamentos();
  return useMutation({
    mutationFn: ({ id, agrupamento }) => atualizarAgrupamento(id, agrupamento),
    onSuccess: invalidar,
  });
}

export function useInativarAgrupamento() {
  const invalidar = useInvalidarAgrupamentos();
  return useMutation({
    mutationFn: inativarAgrupamento,
    onSuccess: invalidar,
  });
}

export function useReativarAgrupamento() {
  const invalidar = useInvalidarAgrupamentos();
  return useMutation({
    mutationFn: reativarAgrupamento,
    onSuccess: invalidar,
  });
}
