'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { QUERIES } from '~/libs/queries';
import { getSession } from '~/services/sessions';

/**
 * Sessão do usuário logado.
 *
 * Se a sessão caiu (cookie expirado ou inválido), manda para `/signout`, que
 * limpa o cache do React Query antes de voltar para o login — sem isso, dados
 * do usuário anterior sobreviveriam à troca de conta.
 */
function useSession() {
  const router = useRouter();

  const result = useQuery({
    queryKey: [QUERIES.GET_SESSION],
    queryFn: getSession,
    retry: false,
  });

  useEffect(() => {
    if (result.isError) router.replace('/signout');
  }, [result.isError, router]);

  return result;
}

export { useSession };
