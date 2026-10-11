import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '../../shared/ui/Card';
import Campo from '../../shared/ui/Campo';
import Botao from '../../shared/ui/Botao';
import { useAuth } from '../../auth/AuthContext';

const schemaLogin = z.object({
  email: z.string().min(1, 'Obrigatório.').email('E-mail inválido.'),
  senha: z.string().min(1, 'Obrigatório.'),
});

function mensagemErroLogin(erro) {
  if (erro.status === 401) return 'E-mail ou senha inválidos.';
  if (erro.status === 423) return 'Conta bloqueada por tentativas erradas. Redefina sua senha.';
  if (erro.status === 403) return erro.detalhe ?? 'Acesso não liberado.';
  return erro.detalhe ?? 'Não foi possível entrar. Tente novamente.';
}

export default function LoginPagina() {
  const { entrar } = useAuth();
  const navegar = useNavigate();
  const [erroGeral, setErroGeral] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schemaLogin) });

  async function onSubmit(valores) {
    setErroGeral('');
    try {
      await entrar(valores.email, valores.senha);
      navegar('/lideranca');
    } catch (erro) {
      setErroGeral(mensagemErroLogin(erro));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fundo px-4">
      <Card titulo="Entrar" className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Campo label="E-mail" type="email" required erro={errors.email?.message} {...register('email')} />
          <Campo label="Senha" type="password" required erro={errors.senha?.message} {...register('senha')} />
          {erroGeral && <p className="text-sm text-erro">{erroGeral}</p>}
          <Botao type="submit" carregando={isSubmitting} className="mt-2">
            Entrar
          </Botao>
        </form>
      </Card>
    </div>
  );
}
