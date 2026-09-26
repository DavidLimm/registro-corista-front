import { Outlet } from 'react-router';

export default function LayoutLideranca() {
  return (
    <div className="min-h-screen flex bg-fundo">
      <aside className="w-[260px] bg-marinho-escuro text-white shrink-0">
        {/* TODO: navegação da liderança */}
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
