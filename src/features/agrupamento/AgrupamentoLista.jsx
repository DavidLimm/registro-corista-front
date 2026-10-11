import { useState } from 'react';
import Card from '../../shared/ui/Card';
import Select from '../../shared/ui/Select';
import Botao from '../../shared/ui/Botao';
import Tabela from '../../shared/ui/Tabela';
import Badge from '../../shared/ui/Badge';
import ConfirmDialog from '../../shared/ui/ConfirmDialog';
import { toast } from '../../shared/ui/avisos';
import { TIPO_AGRUPAMENTO, rotuloAgrupamento } from '../../shared/constantes';
import { useAgrupamentos, useInativarAgrupamento, useReativarAgrupamento } from './hooks';
import AgrupamentoForm from './AgrupamentoForm';
import SubdivisaoPainel from '../subdivisao/SubdivisaoPainel';

const OPCOES_TIPO = Object.entries(TIPO_AGRUPAMENTO).map(([valor, rotulo]) => ({ valor, rotulo }));
const OPCOES_STATUS = [
  { valor: 'true', rotulo: 'Ativo' },
  { valor: 'false', rotulo: 'Inativo' },
];

export default function AgrupamentoLista() {
  const [tipo, setTipo] = useState('');
  const [ativo, setAtivo] = useState('');
  const [formAberto, setFormAberto] = useState(false);
  const [agrupamentoEditando, setAgrupamentoEditando] = useState(null);
  const [paraInativar, setParaInativar] = useState(null);
  const [agrupamentoSelecionado, setAgrupamentoSelecionado] = useState(null);

  const filtros = { tipo: tipo || undefined, ativo: ativo === '' ? undefined : ativo === 'true' };
  const { data: agrupamentos = [], isLoading } = useAgrupamentos(filtros);
  const inativar = useInativarAgrupamento();
  const reativar = useReativarAgrupamento();

  function abrirNovo() {
    setAgrupamentoEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(agrupamento) {
    setAgrupamentoEditando(agrupamento);
    setFormAberto(true);
  }

  function fecharForm() {
    setFormAberto(false);
    setAgrupamentoEditando(null);
  }

  async function confirmarInativar() {
    try {
      await inativar.mutateAsync(paraInativar.id);
      toast.sucesso('Agrupamento inativado.');
    } catch (erro) {
      toast.erro(erro.detalhe ?? 'Não foi possível inativar.');
    } finally {
      setParaInativar(null);
    }
  }

  async function reativarItem(agrupamento) {
    try {
      await reativar.mutateAsync(agrupamento.id);
      toast.sucesso('Agrupamento reativado.');
    } catch (erro) {
      toast.erro(erro.detalhe ?? 'Não foi possível reativar.');
    }
  }

  const colunas = [
    { chave: 'rotulo', cabecalho: 'Agrupamento', render: rotuloAgrupamento },
    { chave: 'tipo', cabecalho: 'Tipo', render: (a) => TIPO_AGRUPAMENTO[a.tipo] },
    {
      chave: 'status',
      cabecalho: 'Status',
      render: (a) => <Badge variante={a.ativo ? 'sucesso' : 'neutro'}>{a.ativo ? 'Ativo' : 'Inativo'}</Badge>,
    },
    {
      chave: 'acoes',
      cabecalho: '',
      render: (a) => (
        <div className="flex justify-end gap-2">
          {a.tipo !== 'AREA' && (
            <Botao variante="texto" onClick={() => setAgrupamentoSelecionado(a)}>
              Subdivisões
            </Botao>
          )}
          <Botao variante="texto" onClick={() => abrirEdicao(a)}>
            Editar
          </Botao>
          {a.ativo ? (
            <Botao variante="perigo" onClick={() => setParaInativar(a)}>
              Inativar
            </Botao>
          ) : (
            <Botao variante="secundario" onClick={() => reativarItem(a)}>
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
        <h1 className="font-titulo text-3xl font-bold text-marinho">Agrupamentos</h1>
        <Botao onClick={abrirNovo}>Novo agrupamento</Botao>
      </div>

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            label="Tipo"
            placeholder="Todos"
            opcoes={OPCOES_TIPO}
            value={tipo}
            onChange={(evento) => setTipo(evento.target.value)}
          />
          <Select
            label="Status"
            placeholder="Todos"
            opcoes={OPCOES_STATUS}
            value={ativo}
            onChange={(evento) => setAtivo(evento.target.value)}
          />
        </div>

        <Tabela
          colunas={colunas}
          dados={agrupamentos}
          chaveLinha={(a) => a.id}
          vazio={isLoading ? 'Carregando...' : 'Nenhum agrupamento encontrado.'}
        />
      </Card>

      {agrupamentoSelecionado && (
        <SubdivisaoPainel agrupamento={agrupamentoSelecionado} aoFechar={() => setAgrupamentoSelecionado(null)} />
      )}

      {formAberto && (
        <Card titulo={agrupamentoEditando ? 'Editar agrupamento' : 'Novo agrupamento'}>
          <AgrupamentoForm agrupamento={agrupamentoEditando} aoSalvar={fecharForm} aoCancelar={fecharForm} />
        </Card>
      )}

      <ConfirmDialog
        aberto={Boolean(paraInativar)}
        titulo="Inativar agrupamento"
        mensagem={paraInativar ? `Tem certeza que deseja inativar "${rotuloAgrupamento(paraInativar)}"?` : ''}
        variante="perigo"
        textoConfirmar="Inativar"
        aoConfirmar={confirmarInativar}
        aoCancelar={() => setParaInativar(null)}
      />
    </div>
  );
}
