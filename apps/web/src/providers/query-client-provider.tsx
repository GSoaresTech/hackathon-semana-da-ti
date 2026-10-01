'use client';

import {
  QueryClient,
  QueryClientProvider as QueryClientProviderPrimitive,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface QueryClientProviderProps {
  children: React.ReactNode;
}

const QueryClientProvider: React.FC<QueryClientProviderProps> = ({ children }) => {
  // O client precisa nascer dentro de `useState` e não em escopo de módulo:
  // no servidor, um client de módulo seria compartilhado entre requisições de
  // usuários diferentes e vazaria cache de um para o outro.
  const [client] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 30, // 30 minutos
          // O interceptor do axios já renova a sessão em 401 e repete a
          // requisição. Repetir de novo aqui só multiplicaria as chamadas.
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });
  });

  return (
    <QueryClientProviderPrimitive client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProviderPrimitive>
  );
};

export { QueryClientProvider };
