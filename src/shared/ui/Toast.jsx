import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { inscrever, removerToast } from './avisos';

const estilosPorTipo = {
  sucesso: 'bg-sucesso-claro text-sucesso',
  erro: 'bg-erro/10 text-erro',
  aviso: 'bg-alerta-claro text-alerta',
};

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => inscrever(setToasts), []);

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex w-[min(90vw,360px)] flex-col gap-2"
      aria-live="polite"
      role="status"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          className={`flex items-start justify-between gap-3 rounded-campo px-4 py-3 text-sm shadow-lg ${estilosPorTipo[item.tipo]}`}
        >
          <p>{item.mensagem}</p>
          <button type="button" onClick={() => removerToast(item.id)} aria-label="Fechar aviso" className="shrink-0">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
