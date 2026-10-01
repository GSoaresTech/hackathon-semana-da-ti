import Link from 'next/link';

import { Button } from '~/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-6xl font-bold text-muted-foreground">404</p>

      <div>
        <h1 className="text-xl font-semibold text-foreground">Página não encontrada</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          O endereço acessado não existe ou foi movido.
        </p>
      </div>

      <Button asChild className="mt-2">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </main>
  );
}
