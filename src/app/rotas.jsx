import { createBrowserRouter } from 'react-router';
import RotaProtegida from '../auth/RotaProtegida';
import LayoutPublico from '../shared/layout/LayoutPublico';
import LayoutLideranca from '../shared/layout/LayoutLideranca';
import LayoutCorista from '../shared/layout/LayoutCorista';
import LoginPagina from '../features/login/LoginPagina';
import DashboardLideranca from '../features/dashboard/DashboardLideranca';
import DashboardCorista from '../features/dashboard/DashboardCorista';
import NaoEncontrado from '../shared/NaoEncontrado';

export const rotas = createBrowserRouter([
  {
    element: <LayoutPublico />,
    children: [
      { path: '/login', element: <LoginPagina /> },
      // TODO: '/cadastro' e '/cadastro/concluido' entram no passo do cadastro de corista
    ],
  },
  {
    element: <RotaProtegida papeisPermitidos={['ADMIN', 'PASTOR']} />,
    children: [
      {
        path: '/lideranca',
        element: <LayoutLideranca />,
        children: [
          { index: true, element: <DashboardLideranca /> },
          // TODO: coristas, aprovacoes, pessoas, congregacoes, areas, papeis
        ],
      },
    ],
  },
  {
    element: <RotaProtegida papeisPermitidos={['CORISTA']} />,
    children: [
      {
        path: '/corista',
        element: <LayoutCorista />,
        children: [
          { index: true, element: <DashboardCorista /> },
          // TODO: 'meu-cadastro'
        ],
      },
    ],
  },
  { path: '*', element: <NaoEncontrado /> },
]);
