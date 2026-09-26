import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { queryClient } from './app/queryClient';
import { AuthProvider } from './auth/AuthContext';
import { rotas } from './app/rotas';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={rotas} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
