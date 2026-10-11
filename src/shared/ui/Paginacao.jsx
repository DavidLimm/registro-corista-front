import { ChevronLeft, ChevronRight } from 'lucide-react';
import Botao from './Botao';

export default function Paginacao({ pagina, totalPaginas, aoMudar }) {
  if (totalPaginas <= 1) return null;

  return (
    <nav className="flex items-center justify-between" aria-label="Paginação">
      <Botao variante="texto" disabled={pagina <= 0} onClick={() => aoMudar(pagina - 1)}>
        <ChevronLeft className="size-4" aria-hidden="true" />
        Anterior
      </Botao>
      <span className="text-sm text-texto-suave">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <Botao variante="texto" disabled={pagina >= totalPaginas - 1} onClick={() => aoMudar(pagina + 1)}>
        Próxima
        <ChevronRight className="size-4" aria-hidden="true" />
      </Botao>
    </nav>
  );
}
