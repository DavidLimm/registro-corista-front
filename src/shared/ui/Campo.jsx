import { forwardRef, useId } from 'react';

const Campo = forwardRef(function Campo(
  { label, erro, dica, type = 'text', required = false, className = '', ...props },
  ref,
) {
  const id = useId();
  const idErro = erro ? `${id}-erro` : undefined;
  const idDica = dica ? `${id}-dica` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-texto">
        {label}
        {required && <span className="text-erro"> *</span>}
      </label>
      <input
        id={id}
        ref={ref}
        type={type}
        aria-invalid={erro ? 'true' : undefined}
        aria-describedby={[idDica, idErro].filter(Boolean).join(' ') || undefined}
        className={`h-[46px] rounded-campo border px-3 text-sm text-texto placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dourado ${
          erro ? 'border-erro' : 'border-borda'
        } ${className}`}
        {...props}
      />
      {dica && !erro && (
        <p id={idDica} className="text-xs text-texto-suave">
          {dica}
        </p>
      )}
      {erro && (
        <p id={idErro} className="text-xs text-erro">
          {erro}
        </p>
      )}
    </div>
  );
});

export default Campo;
