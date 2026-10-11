import { forwardRef, useId } from 'react';

const Select = forwardRef(function Select(
  { label, erro, dica, opcoes = [], placeholder, required = false, className = '', ...props },
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
      <select
        id={id}
        ref={ref}
        aria-invalid={erro ? 'true' : undefined}
        aria-describedby={[idDica, idErro].filter(Boolean).join(' ') || undefined}
        className={`h-[46px] rounded-campo border bg-superficie px-3 text-sm text-texto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dourado ${
          erro ? 'border-erro' : 'border-borda'
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
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

export default Select;
