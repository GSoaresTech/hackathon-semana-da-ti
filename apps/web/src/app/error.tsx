'use client';

import Link from 'next/link';
import { useEffect } from 'react';

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
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-6xl font-bold text-muted-foreground">500</p>

      <div>
        <h1 className="text-xl font-semibold text-foreground">Algo deu errado</h1>
        <p className="mt-1 text-sm text-muted-foreground">Não foi possível carregar esta página.</p>
      </div>

      <div className="mt-2 flex gap-2">
        <Button onClick={reset}>Tentar novamente</Button>
        <Button variant="outline" asChild>
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </main>
  );
}
