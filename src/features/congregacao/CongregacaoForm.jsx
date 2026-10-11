import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from '../../shared/ui/Select';
import Campo from '../../shared/ui/Campo';
import Botao from '../../shared/ui/Botao';
import Card from '../../shared/ui/Card';
import { toast } from '../../shared/ui/avisos';
import { aplicarErros } from '../../api/erros';
import { TIPO_AGRUPAMENTO, rotuloAgrupamento } from '../../shared/constantes';
import { useAgrupamentos } from '../agrupamento/hooks';
import { useSubdivisoes } from '../subdivisao/hooks';
import CamposEndereco from '../endereco/CamposEndereco';
import { construirPayloadCongregacao, schemaCongregacao } from './schema';
import { useAtualizarCongregacao, useCriarCongregacao } from './hooks';

const OPCOES_TIPO = Object.entries(TIPO_AGRUPAMENTO).map(([valor, rotulo]) => ({ valor, rotulo }));

export default function CongregacaoForm({ congregacao, aoSalvar, aoCancelar }) {
  const editando = Boolean(congregacao);
  const criar = useCriarCongregacao();
  const atualizar = useAtualizarCongregacao();

  const [tipo, setTipo] = useState(congregacao?.agrupamento?.tipo ?? '');
  const [agrupamentoId, setAgrupamentoId] = useState(congregacao?.agrupamento?.id ?? '');

  const { data: agrupamentos = [] } = useAgrupamentos({ tipo: tipo || undefined, ativo: true });
  const { data: subdivisoes = [] } = useSubdivisoes(agrupamentoId, { ativo: true });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schemaCongregacao),
    defaultValues: {
      subdivisaoId: congregacao?.subdivisao?.id ?? '',
      nome: congregacao?.nome ?? '',
      endereco: {
        logradouro: congregacao?.endereco?.logradouro ?? '',
        numero: congregacao?.endereco?.numero ?? '',
        complemento: congregacao?.endereco?.complemento ?? '',
        bairro: congregacao?.endereco?.bairro ?? '',
        cidade: congregacao?.endereco?.cidade ?? '',
        uf: congregacao?.endereco?.uf ?? '',
        cep: congregacao?.endereco?.cep ?? '',
      },
    },
  });

  useEffect(() => {
    // Tipo AREA: a subdivisão é implícita (uma só, sem número nem nome) — já seleciona sozinha.
    if (tipo === 'AREA' && subdivisoes.length === 1) {
      setValue('subdivisaoId', subdivisoes[0].id);
    }
  }, [tipo, subdivisoes, setValue]);

  const salvando = criar.isPending || atualizar.isPending;

  async function onSubmit(valores) {
    const payload = construirPayloadCongregacao(valores);
    try {
      if (editando) {
        await atualizar.mutateAsync({ id: congregacao.id, congregacao: payload });
        toast.sucesso('Congregação atualizada.');
      } else {
        await criar.mutateAsync(payload);
        toast.sucesso('Congregação criada.');
      }
      aoSalvar?.();
    } catch (erro) {
      aplicarErros(erro, (campo, mensagem) => setError(campo, { message: mensagem }), toast.erro);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Select
          label="Tipo de agrupamento"
          placeholder="Selecione"
          opcoes={OPCOES_TIPO}
          value={tipo}
          onChange={(evento) => {
            setTipo(evento.target.value);
            setAgrupamentoId('');
            setValue('subdivisaoId', '');
          }}
        />
        <Select
          label="Agrupamento"
          placeholder={tipo ? 'Selecione' : 'Escolha o tipo primeiro'}
          disabled={!tipo}
          opcoes={agrupamentos.map((a) => ({ valor: a.id, rotulo: rotuloAgrupamento(a) }))}
          value={agrupamentoId}
          onChange={(evento) => {
            setAgrupamentoId(evento.target.value);
            setValue('subdivisaoId', '');
          }}
        />
        {tipo !== 'AREA' && (
          <Select
            label="Subdivisão"
            placeholder={agrupamentoId ? 'Selecione' : 'Escolha o agrupamento primeiro'}
            disabled={!agrupamentoId}
            opcoes={subdivisoes.map((s) => ({ valor: s.id, rotulo: s.nome ?? `Área ${s.numero}` }))}
            erro={errors.subdivisaoId?.message}
            {...register('subdivisaoId')}
          />
        )}
      </div>

      <Campo label="Nome da congregação" required erro={errors.nome?.message} {...register('nome')} />

      <Card titulo="Endereço (opcional)">
        <CamposEndereco register={register} setValue={setValue} getValues={getValues} erros={errors.endereco ?? {}} />
      </Card>

      <div className="flex justify-end gap-3">
        {aoCancelar && (
          <Botao variante="secundario" type="button" onClick={aoCancelar}>
            Cancelar
          </Botao>
        )}
        <Botao type="submit" carregando={salvando}>
          {editando ? 'Salvar' : 'Criar congregação'}
        </Botao>
      </div>
    </form>
  );
}
