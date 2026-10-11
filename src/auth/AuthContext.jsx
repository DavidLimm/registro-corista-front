import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/cliente';
import { definirToken, definirAoExpirarSessao } from './token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null); // { email, roles }

  useEffect(() => {
    definirAoExpirarSessao(() => setSessao(null));
  }, []);

  async function entrar(email, senha) {
    const { data } = await api.post('/auth/login', { email, senha });
    definirToken(data.token);
    setSessao({ email: data.email, roles: data.roles });
  }

  function sair() {
    definirToken(null);
    setSessao(null);
  }

  const valor = {
    usuario: sessao ? { email: sessao.email } : null,
    permissoes: sessao?.roles ?? [],
    entrar,
    sair,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook de contexto, convive com o Provider de propósito
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return contexto;
}
