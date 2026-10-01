import Link from 'next/link';

import { Screen, ScreenContent } from '~/components/screen';
import { Button } from '~/components/ui/button';

export default function NotFound() {
  return (
    <Screen>
      <ScreenContent className="items-center justify-center text-center">
        <p className="text-display text-ink-muted">404</p>
        <div>
          <h1 className="text-title text-ink">Página não encontrada</h1>
          <p className="mt-1 text-body text-ink-muted">
            O endereço acessado não existe ou foi movido.
          </p>
        </div>
        <Button asChild block>
          <Link href="/">Voltar ao início</Link>
        </Button>
      </ScreenContent>
    </Screen>
  );
}
