import { useState } from 'react';
import Card from '../../shared/ui/Card';
import Select from '../../shared/ui/Select';
import Botao from '../../shared/ui/Botao';
import Tabela from '../../shared/ui/Tabela';
import Badge from '../../shared/ui/Badge';
import ConfirmDialog from '../../shared/ui/ConfirmDialog';
import { toast } from '../../shared/ui/avisos';
import { rotuloAgrupamento } from '../../shared/constantes';
import { useAgrupamentos } from '../agrupamento/hooks';
import { useCongregacoes, useInativarCongregacao, useReativarCongregacao } from './hooks';
import CongregacaoForm from './CongregacaoForm';

const OPCOES_STATUS = [
  { valor: 'true', rotulo: 'Ativa' },
  { valor: 'false', rotulo: 'Inativa' },
];

export default function CongregacaoLista() {
  const [agrupamentoId, setAgrupamentoId] = useState('');
  const [ativa, setAtiva] = useState('');
  const [formAberto, setFormAberto] = useState(false);
  const [congregacaoEditando, setCongregacaoEditando] = useState(null);
  const [paraInativar, setParaInativar] = useState(null);

  const { data: agrupamentos = [] } = useAgrupamentos({ ativo: true });
  const filtros = {
    agrupamentoId: agrupamentoId || undefined,
    ativa: ativa === '' ? undefined : ativa === 'true',
  };
  const { data: congregacoes = [], isLoading } = useCongregacoes(filtros);
  const inativar = useInativarCongregacao();
  const reativar = useReativarCongregacao();

  function abrirNova() {
    setCongregacaoEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(congregacao) {
    setCongregacaoEditando(congregacao);
    setFormAberto(true);
  }

  function fecharForm() {
    setFormAberto(false);
    setCongregacaoEditando(null);
  }

  async function confirmarInativar() {
    try {
      await inativar.mutateAsync(paraInativar.id);
      toast.sucesso('Congregação inativada.');
    } catch (erro) {
      toast.erro(erro.detalhe ?? 'Não foi possível inativar.');
    } finally {
      setParaInativar(null);
    }
  }

  async function reativarItem(congregacao) {
    try {
      await reativar.mutateAsync(congregacao.id);
      toast.sucesso('Congregação reativada.');
    } catch (erro) {
      toast.erro(erro.detalhe ?? 'Não foi possível reativar.');
    }
  }

  const colunas = [
    { chave: 'nome', cabecalho: 'Congregação' },
    { chave: 'agrupamento', cabecalho: 'Agrupamento', render: (c) => rotuloAgrupamento(c.agrupamento) },
    {
      chave: 'subdivisao',
      cabecalho: 'Subdivisão',
      render: (c) => c.subdivisao.nome ?? (c.subdivisao.numero ? `Área ${c.subdivisao.numero}` : '—'),
    },
    {
      chave: 'status',
      cabecalho: 'Status',
      render: (c) => <Badge variante={c.ativa ? 'sucesso' : 'neutro'}>{c.ativa ? 'Ativa' : 'Inativa'}</Badge>,
    },
    {
      chave: 'acoes',
      cabecalho: '',
      render: (c) => (
        <div className="flex justify-end gap-2">
          <Botao variante="texto" onClick={() => abrirEdicao(c)}>
            Editar
          </Botao>
          {c.ativa ? (
            <Botao variante="perigo" onClick={() => setParaInativar(c)}>
              Inativar
            </Botao>
          ) : (
            <Botao variante="secundario" onClick={() => reativarItem(c)}>
              Reativar
            </Botao>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-titulo text-3xl font-bold text-marinho">Congregações</h1>
        <Botao onClick={abrirNova}>Nova congregação</Botao>
      </div>

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            label="Agrupamento"
            placeholder="Todos"
            opcoes={agrupamentos.map((a) => ({ valor: a.id, rotulo: rotuloAgrupamento(a) }))}
            value={agrupamentoId}
            onChange={(evento) => setAgrupamentoId(evento.target.value)}
          />
          <Select
            label="Status"
            placeholder="Todas"
            opcoes={OPCOES_STATUS}
            value={ativa}
            onChange={(evento) => setAtiva(evento.target.value)}
          />
        </div>

        <Tabela
          colunas={colunas}
          dados={congregacoes}
          chaveLinha={(c) => c.id}
          vazio={isLoading ? 'Carregando...' : 'Nenhuma congregação encontrada.'}
        />
      </Card>

      {formAberto && (
        <Card titulo={congregacaoEditando ? 'Editar congregação' : 'Nova congregação'}>
          <CongregacaoForm congregacao={congregacaoEditando} aoSalvar={fecharForm} aoCancelar={fecharForm} />
        </Card>
      )}

      <ConfirmDialog
        aberto={Boolean(paraInativar)}
        titulo="Inativar congregação"
        mensagem={paraInativar ? `Tem certeza que deseja inativar "${paraInativar.nome}"?` : ''}
        variante="perigo"
        textoConfirmar="Inativar"
        aoConfirmar={confirmarInativar}
        aoCancelar={() => setParaInativar(null)}
      />
    </div>
  );
}
