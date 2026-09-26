import { Outlet } from 'react-router';

export default function LayoutPublico() {
  return (
    <div className="min-h-screen bg-fundo">
      <Outlet />
    </div>
  );
}
