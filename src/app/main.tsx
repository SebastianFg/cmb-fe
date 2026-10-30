import { QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { queryClient } from '@/config/query-client';
import { routes } from '@/router';
import '@/styles/tailwind.css';
import { Suspense } from 'react';
import Spinner from '@/shared/components/spinner/spinner';

const AppRoutes = () => useRoutes(routes);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Toaster richColors position="top-right" closeButton />
      <Suspense fallback={<Spinner fullScreen />}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  </QueryClientProvider>,
);
