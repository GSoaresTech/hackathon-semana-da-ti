'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { deleteSession } from '~/services/sessions';

/**
 * Componente de efeito: não renderiza nada, só executa o logout.
 *
 * O `useRef` impede que o Strict Mode (que monta duas vezes em dev) dispare
 * dois `DELETE /sessions`.
 *
 * Limpa o cache do React Query em qualquer desfecho — mesmo se o backend
 * falhar, os dados do usuário anterior não podem sobrar na tela seguinte.
 */
const SignOutEffect: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    deleteSession()
      .catch(() => {
        // Sessão já inválida no servidor: seguir para o login mesmo assim.
      })
      .finally(() => {
        queryClient.removeQueries();
        router.replace('/signin');
      });
  }, [queryClient, router]);

  return null;
};

export { SignOutEffect };
