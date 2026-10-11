const estilosPorVariante = {
  neutro: 'bg-suave text-texto-suave',
  info: 'bg-info-claro text-marinho',
  alerta: 'bg-alerta-claro text-alerta',
  sucesso: 'bg-sucesso-claro text-sucesso',
  erro: 'bg-erro/10 text-erro',
};

export default function Badge({ variante = 'neutro', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${estilosPorVariante[variante]} ${className}`}
    >
      {children}
    </span>
  );
}
