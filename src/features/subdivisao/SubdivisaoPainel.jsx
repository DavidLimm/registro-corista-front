import { useState } from 'react';
import Card from '../../shared/ui/Card';
import Botao from '../../shared/ui/Botao';
import { rotuloAgrupamento } from '../../shared/constantes';
import SubdivisaoLista from './SubdivisaoLista';
import SubdivisaoForm from './SubdivisaoForm';

export default function SubdivisaoPainel({ agrupamento, aoFechar }) {
  const [formAberto, setFormAberto] = useState(false);
  const [subdivisaoEditando, setSubdivisaoEditando] = useState(null);

  function abrirNova() {
    setSubdivisaoEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(subdivisao) {
    setSubdivisaoEditando(subdivisao);
    setFormAberto(true);
  }

  function fecharForm() {
    setFormAberto(false);
    setSubdivisaoEditando(null);
  }

  return (
    <Card titulo={`Subdivisões de ${rotuloAgrupamento(agrupamento)}`}>
      <div className="mb-4 flex justify-end gap-3">
        <Botao variante="secundario" onClick={aoFechar}>
          Fechar
        </Botao>
        <Botao onClick={abrirNova}>Nova subdivisão</Botao>
      </div>

      <SubdivisaoLista agrupamento={agrupamento} aoEditar={abrirEdicao} />

      {formAberto && (
        <div className="mt-6 border-t border-borda pt-6">
          <SubdivisaoForm
            agrupamento={agrupamento}
            subdivisao={subdivisaoEditando}
            aoSalvar={fecharForm}
            aoCancelar={fecharForm}
          />
        </div>
      )}
    </Card>
  );
}
