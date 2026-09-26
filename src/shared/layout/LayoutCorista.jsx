import { Outlet } from 'react-router';

export default function LayoutCorista() {
  return (
    <div className="min-h-screen bg-fundo">
      <header className="bg-superficie border-b border-borda px-6 py-4">
        {/* TODO: topbar do corista */}
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
