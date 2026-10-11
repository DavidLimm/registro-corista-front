import { useState } from 'react';
import Campo from '../../shared/ui/Campo';
import Botao from '../../shared/ui/Botao';
import { toast } from '../../shared/ui/avisos';
import { buscarCep } from './viaCep';

export default function CamposEndereco({ prefixo = 'endereco', register, setValue, getValues, erros = {} }) {
  const [buscando, setBuscando] = useState(false);

  async function aoBuscarCep() {
    const cep = getValues(`${prefixo}.cep`);
    if (!cep) return;
    setBuscando(true);
    try {
      const endereco = await buscarCep(cep);
      if (!endereco) {
        toast.aviso('CEP não encontrado. Preencha o endereço manualmente.');
        return;
      }
      setValue(`${prefixo}.logradouro`, endereco.logradouro, { shouldValidate: true });
      setValue(`${prefixo}.bairro`, endereco.bairro, { shouldValidate: true });
      setValue(`${prefixo}.cidade`, endereco.cidade, { shouldValidate: true });
      setValue(`${prefixo}.uf`, endereco.uf, { shouldValidate: true });
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Campo label="CEP" dica="Opcional" erro={erros.cep?.message} {...register(`${prefixo}.cep`)} />
        </div>
        <Botao type="button" variante="secundario" carregando={buscando} onClick={aoBuscarCep}>
          Buscar CEP
        </Botao>
      </div>

      <Campo label="Logradouro" erro={erros.logradouro?.message} {...register(`${prefixo}.logradouro`)} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Número" erro={erros.numero?.message} {...register(`${prefixo}.numero`)} />
        <Campo label="Complemento" erro={erros.complemento?.message} {...register(`${prefixo}.complemento`)} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Campo label="Bairro" erro={erros.bairro?.message} {...register(`${prefixo}.bairro`)} />
        <Campo label="Cidade" erro={erros.cidade?.message} {...register(`${prefixo}.cidade`)} />
        <Campo label="UF" maxLength={2} erro={erros.uf?.message} {...register(`${prefixo}.uf`)} />
      </div>
    </div>
  );
}
