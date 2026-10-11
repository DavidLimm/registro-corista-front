export default function Chip({ selecionado = false, children, className = '', ...props }) {
  return (
    <button
      type="button"
      aria-pressed={selecionado}
      className={`h-9 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dourado ${
        selecionado ? 'border-marinho bg-marinho text-white' : 'border-borda bg-superficie text-texto'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
