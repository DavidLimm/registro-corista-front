import { Loader2 } from 'lucide-react';

const estilosPorVariante = {
  primario: 'bg-marinho text-white hover:bg-marinho-medio focus-visible:ring-dourado',
  secundario: 'border border-dourado bg-dourado-claro/35 text-dourado-escuro hover:bg-dourado-claro focus-visible:ring-dourado',
  perigo: 'bg-erro text-white hover:bg-erro/90 focus-visible:ring-erro',
  texto: 'text-marinho hover:bg-suave focus-visible:ring-dourado',
};

export default function Botao({
  variante = 'primario',
  carregando = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      className={`inline-flex h-[46px] items-center justify-center gap-2 rounded-campo px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${estilosPorVariante[variante]} ${className}`}
      {...props}
    >
      {carregando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
