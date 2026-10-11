import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthContext';
import { temAlgumaPermissao } from './permissoes';

export default function RotaProtegida({ permissoesPermitidas }) {
  const { usuario, permissoes } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (permissoesPermitidas?.length && !temAlgumaPermissao(permissoes, permissoesPermitidas)) {
    return <Navigate to="/sem-permissao" replace />;
  }

  // A autorização real sempre vem do backend (403/404); isto é só UX.

  return <Outlet />;
}
