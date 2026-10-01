'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Screen, ScreenContent } from '~/components/screen';
import { Button } from '~/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Screen>
      <ScreenContent className="items-center justify-center text-center">
        <div>
          <h1 className="text-title text-ink">Algo deu errado</h1>
          <p className="mt-1 text-body text-ink-muted">
            Não foi possível carregar esta página. Em caso de dúvida, ligue 192.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <Button block onClick={reset}>
            Tentar novamente
          </Button>
          <Button block variant="secondary" asChild>
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </ScreenContent>
    </Screen>
  );
}
