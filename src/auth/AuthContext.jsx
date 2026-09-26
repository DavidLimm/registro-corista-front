import { createContext, useContext, useState } from 'react';
import { PAPEIS } from './papeis';

const AuthContext = createContext(null);

const USUARIO_FAKE_LIDERANCA = {
  id: 'fake-lideranca',
  nome: 'Líder de Teste',
  papel: PAPEIS.ADMIN,
  areas: ['100'],
};

const USUARIO_FAKE_CORISTA = {
  id: 'fake-corista',
  nome: 'Corista de Teste',
  papel: 'CORISTA',
  areas: ['100'],
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  function entrar(comoLideranca = true) {
    setUsuario(comoLideranca ? USUARIO_FAKE_LIDERANCA : USUARIO_FAKE_CORISTA);
  }

  function sair() {
    setUsuario(null);
  }

  const valor = {
    usuario,
    papel: usuario?.papel ?? null,
    areas: usuario?.areas ?? [],
    entrar,
    sair,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return contexto;
}
