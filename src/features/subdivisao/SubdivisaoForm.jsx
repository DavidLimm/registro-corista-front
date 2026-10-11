import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Campo from '../../shared/ui/Campo';
import Botao from '../../shared/ui/Botao';
import { toast } from '../../shared/ui/avisos';
import { aplicarErros } from '../../api/erros';
import { useAtualizarSubdivisao, useCriarSubdivisao } from './hooks';

const schemaPorTipo = {
  CAMPO_MISSIONARIO: z.object({ nome: z.string().min(1, 'Obrigatório.').max(150) }),
  FILIAL: z.object({
    numero: z.union([z.string(), z.number()]).refine((valor) => Number(valor) > 0, 'Deve ser maior que zero.'),
  }),
  SETOR: z.object({
    numero: z.union([z.string(), z.number()]).refine((valor) => Number(valor) > 0, 'Deve ser maior que zero.'),
  }),
};

export default function SubdivisaoForm({ agrupamento, subdivisao, aoSalvar, aoCancelar }) {
  const editando = Boolean(subdivisao);
  const usaNome = agrupamento.tipo === 'CAMPO_MISSIONARIO';
  const criar = useCriarSubdivisao(agrupamento.id);
  const atualizar = useAtualizarSubdivisao(agrupamento.id);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schemaPorTipo[agrupamento.tipo]),
    defaultValues: {
      nome: subdivisao?.nome ?? '',
      numero: subdivisao?.numero ?? '',
    },
  });

  const salvando = criar.isPending || atualizar.isPending;

  async function onSubmit(valores) {
    const payload = usaNome ? { nome: valores.nome } : { numero: Number(valores.numero) };
    try {
      if (editando) {
        await atualizar.mutateAsync({ id: subdivisao.id, subdivisao: payload });
        toast.sucesso('Subdivisão atualizada.');
      } else {
        await criar.mutateAsync(payload);
        toast.sucesso('Subdivisão criada.');
      }
      aoSalvar?.();
    } catch (erro) {
      aplicarErros(erro, (campo, mensagem) => setError(campo, { message: mensagem }), toast.erro);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {usaNome ? (
        <Campo label="Nome do local" required erro={errors.nome?.message} {...register('nome')} />
      ) : (
        <Campo
          label="Número da área"
          type="number"
          min="1"
          required
          erro={errors.numero?.message}
          {...register('numero')}
        />
      )}

      <div className="flex justify-end gap-3">
        {aoCancelar && (
          <Botao variante="secundario" type="button" onClick={aoCancelar}>
            Cancelar
          </Botao>
        )}
        <Botao type="submit" carregando={salvando}>
          {editando ? 'Salvar' : 'Adicionar'}
        </Botao>
      </div>
    </form>
  );
}
