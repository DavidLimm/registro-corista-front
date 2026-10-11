import { createBrowserRouter } from 'react-router';
import RotaProtegida from '../auth/RotaProtegida';
import { PERMISSOES } from '../auth/permissoes';
import LayoutPublico from '../shared/layout/LayoutPublico';
import LayoutLideranca from '../shared/layout/LayoutLideranca';
import LayoutCorista from '../shared/layout/LayoutCorista';
import LoginPagina from '../features/login/LoginPagina';
import DashboardLideranca from '../features/dashboard/DashboardLideranca';
import DashboardCorista from '../features/dashboard/DashboardCorista';
import NaoEncontrado from '../shared/NaoEncontrado';
import NaoAutorizado from '../shared/NaoAutorizado';

export const rotas = createBrowserRouter([
  {
    element: <LayoutPublico />,
    children: [
      { path: '/login', element: <LoginPagina /> },
      // TODO: '/cadastro' e '/cadastro/concluido' entram no passo do cadastro de corista
    ],
  },
  {
    element: <RotaProtegida permissoesPermitidas={[PERMISSOES.DASHBOARD_LER]} />,
    children: [
      {
        path: '/lideranca',
        element: <LayoutLideranca />,
        children: [
          { index: true, element: <DashboardLideranca /> },
          // TODO: coristas, aprovacoes, afastamentos, pessoas, congregacoes, agrupamentos, usuarios, escopo, papeis
        ],
      },
    ],
  },
  {
    element: <RotaProtegida />,
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
  { path: '/sem-permissao', element: <NaoAutorizado /> },
  { path: '*', element: <NaoEncontrado /> },
]);
