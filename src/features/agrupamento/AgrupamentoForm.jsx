import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Campo from '../../shared/ui/Campo';
import Select from '../../shared/ui/Select';
import Botao from '../../shared/ui/Botao';
import { toast } from '../../shared/ui/avisos';
import { aplicarErros } from '../../api/erros';
import { TIPO_AGRUPAMENTO } from '../../shared/constantes';
import { schemaAgrupamento, construirPayloadAgrupamento } from './schema';
import { useAtualizarAgrupamento, useCriarAgrupamento } from './hooks';

const OPCOES_TIPO = Object.entries(TIPO_AGRUPAMENTO).map(([valor, rotulo]) => ({ valor, rotulo }));

export default function AgrupamentoForm({ agrupamento, aoSalvar, aoCancelar }) {
  const editando = Boolean(agrupamento);
  const criar = useCriarAgrupamento();
  const atualizar = useAtualizarAgrupamento();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schemaAgrupamento),
    defaultValues: {
      tipo: agrupamento?.tipo ?? 'AREA',
      nome: agrupamento?.nome ?? '',
      numero: agrupamento?.numero ?? '',
      pais: agrupamento?.pais ?? '',
    },
  });

  const tipo = watch('tipo');
  const salvando = criar.isPending || atualizar.isPending;

  async function onSubmit(valores) {
    const payload = construirPayloadAgrupamento(valores);
    try {
      if (editando) {
        await atualizar.mutateAsync({ id: agrupamento.id, agrupamento: payload });
        toast.sucesso('Agrupamento atualizado.');
      } else {
        await criar.mutateAsync(payload);
        toast.sucesso('Agrupamento criado.');
      }
      aoSalvar?.();
    } catch (erro) {
      aplicarErros(erro, (campo, mensagem) => setError(campo, { message: mensagem }), toast.erro);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Select
        label="Tipo"
        required
        opcoes={OPCOES_TIPO}
        disabled={editando}
        dica={editando ? 'O tipo não pode ser alterado depois de criado.' : undefined}
        erro={errors.tipo?.message}
        {...register('tipo')}
      />

      {(tipo === 'AREA' || tipo === 'SETOR') && (
        <Campo label="Número" type="number" min="1" required erro={errors.numero?.message} {...register('numero')} />
      )}

      {tipo !== 'AREA' && <Campo label="Nome" required erro={errors.nome?.message} {...register('nome')} />}

      {tipo === 'CAMPO_MISSIONARIO' && <Campo label="País" required erro={errors.pais?.message} {...register('pais')} />}

      <div className="flex justify-end gap-3">
        {aoCancelar && (
          <Botao variante="secundario" type="button" onClick={aoCancelar}>
            Cancelar
          </Botao>
        )}
        <Botao type="submit" carregando={salvando}>
          {editando ? 'Salvar' : 'Criar agrupamento'}
        </Botao>
      </div>
    </form>
  );
}
