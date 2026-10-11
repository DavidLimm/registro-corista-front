import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  atualizarCongregacao,
  criarCongregacao,
  inativarCongregacao,
  listarCongregacoes,
  obterCongregacao,
  reativarCongregacao,
} from './api';

export function useCongregacoes(filtros = {}) {
  return useQuery({
    queryKey: ['congregacoes', filtros],
    queryFn: () => listarCongregacoes(filtros),
  });
}

export function useCongregacao(id) {
  return useQuery({
    queryKey: ['congregacoes', 'detalhe', id],
    queryFn: () => obterCongregacao(id),
    enabled: Boolean(id),
  });
}

function useInvalidarCongregacoes() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['congregacoes'] });
}

export function useCriarCongregacao() {
  const invalidar = useInvalidarCongregacoes();
  return useMutation({
    mutationFn: criarCongregacao,
    onSuccess: invalidar,
  });
}

export function useAtualizarCongregacao() {
  const invalidar = useInvalidarCongregacoes();
  return useMutation({
    mutationFn: ({ id, congregacao }) => atualizarCongregacao(id, congregacao),
    onSuccess: invalidar,
  });
}

export function useInativarCongregacao() {
  const invalidar = useInvalidarCongregacoes();
  return useMutation({
    mutationFn: inativarCongregacao,
    onSuccess: invalidar,
  });
}

export function useReativarCongregacao() {
  const invalidar = useInvalidarCongregacoes();
  return useMutation({
    mutationFn: reativarCongregacao,
    onSuccess: invalidar,
  });
}
