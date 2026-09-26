import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthContext';

export default function RotaProtegida({ papeisPermitidos }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // TODO: quando os papéis estiverem definidos, validar papeisPermitidos aqui.
  // A autorização real sempre vem do backend; isto é só UX.

  return <Outlet />;
}
