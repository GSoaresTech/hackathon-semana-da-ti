import type { Metadata } from 'next';

import { Container } from '~/components/container';
import { RouteGuard } from '~/components/guard/route-guard';
import { Title } from '~/components/heading';
import { Separator } from '~/components/ui/separator';
import { Roles } from '~/libs/constants';

export const metadata: Metadata = { title: 'Configurações' };

export default function SettingsPage() {
  return (
    // O `proxy.ts` já barra quem não tem papel para esta rota. O RouteGuard
    // cobre a navegação no client, que não passa pelo proxy.
    <RouteGuard roles={[Roles.SYSTEM, Roles.ADMINISTRATOR]}>
      <Container>
        <header className="mt-4">
          <Title>Configurações</Title>
          <p className="mt-1 text-sm text-muted-foreground">Preferências gerais do sistema.</p>
        </header>

        <Separator orientation="horizontal" className="my-8 w-auto" />

        <p className="text-sm text-muted-foreground">Exemplo de tela restrita por papel.</p>
      </Container>
    </RouteGuard>
  );
}
