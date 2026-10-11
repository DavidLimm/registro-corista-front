import { useState } from 'react';
import Tabela from '../../shared/ui/Tabela';
import Badge from '../../shared/ui/Badge';
import Botao from '../../shared/ui/Botao';
import ConfirmDialog from '../../shared/ui/ConfirmDialog';
import { toast } from '../../shared/ui/avisos';
import { useInativarSubdivisao, useReativarSubdivisao, useSubdivisoes } from './hooks';

export default function SubdivisaoLista({ agrupamento, aoEditar }) {
  const { data: subdivisoes = [], isLoading } = useSubdivisoes(agrupamento.id);
  const inativar = useInativarSubdivisao(agrupamento.id);
  const reativar = useReativarSubdivisao(agrupamento.id);
  const [paraInativar, setParaInativar] = useState(null);

  async function confirmarInativar() {
    try {
      await inativar.mutateAsync(paraInativar.id);
      toast.sucesso('Subdivisão inativada.');
    } catch (erro) {
      toast.erro(erro.detalhe ?? 'Não foi possível inativar.');
    } finally {
      setParaInativar(null);
    }
  }

  async function reativarItem(item) {
    try {
      await reativar.mutateAsync(item.id);
      toast.sucesso('Subdivisão reativada.');
    } catch (erro) {
      toast.erro(erro.detalhe ?? 'Não foi possível reativar.');
    }
  }

  const colunas = [
    {
      chave: 'identificacao',
      cabecalho: agrupamento.tipo === 'CAMPO_MISSIONARIO' ? 'Local' : 'Área',
      render: (s) => s.nome ?? `Área ${s.numero}`,
    },
    {
      chave: 'status',
      cabecalho: 'Status',
      render: (s) => <Badge variante={s.ativo ? 'sucesso' : 'neutro'}>{s.ativo ? 'Ativa' : 'Inativa'}</Badge>,
    },
    {
      chave: 'acoes',
      cabecalho: '',
      render: (s) => (
        <div className="flex justify-end gap-2">
          <Botao variante="texto" onClick={() => aoEditar(s)}>
            Editar
          </Botao>
          {s.ativo ? (
            <Botao variante="perigo" onClick={() => setParaInativar(s)}>
              Inativar
            </Botao>
          ) : (
            <Botao variante="secundario" onClick={() => reativarItem(s)}>
              Reativar
            </Botao>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Tabela
        colunas={colunas}
        dados={subdivisoes}
        chaveLinha={(s) => s.id}
        vazio={isLoading ? 'Carregando...' : 'Nenhuma subdivisão cadastrada.'}
      />
      <ConfirmDialog
        aberto={Boolean(paraInativar)}
        titulo="Inativar subdivisão"
        mensagem="Tem certeza? Só é possível se não houver congregação ativa nela."
        variante="perigo"
        textoConfirmar="Inativar"
        aoConfirmar={confirmarInativar}
        aoCancelar={() => setParaInativar(null)}
      />
    </>
  );
}
