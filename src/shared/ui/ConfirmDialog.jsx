import { useEffect, useRef } from 'react';
import Botao from './Botao';

export default function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  variante = 'primario',
  aoConfirmar,
  aoCancelar,
}) {
  const refDialogo = useRef(null);

  useEffect(() => {
    const dialogo = refDialogo.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    <dialog ref={refDialogo} onCancel={aoCancelar} className="rounded-card border border-borda p-0">
      <div className="w-[min(90vw,420px)] p-6">
        <h2 className="font-titulo text-lg font-bold text-marinho">{titulo}</h2>
        <p className="mt-2 text-sm text-texto-suave">{mensagem}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Botao variante="secundario" onClick={aoCancelar} type="button">
            {textoCancelar}
          </Botao>
          <Botao variante={variante} onClick={aoConfirmar} type="button">
            {textoConfirmar}
          </Botao>
        </div>
      </div>
    </dialog>
  );
}
