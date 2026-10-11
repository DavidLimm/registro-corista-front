export default function Card({ titulo, children, className = '' }) {
  return (
    <div className={`rounded-card border border-borda bg-superficie p-6 md:p-8 ${className}`}>
      {titulo && <h2 className="mb-4 font-titulo text-lg font-bold text-marinho md:text-xl">{titulo}</h2>}
      {children}
    </div>
  );
}
