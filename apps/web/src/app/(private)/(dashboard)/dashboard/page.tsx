import type { Metadata } from 'next';

import { Container } from '~/components/container';
import { Title } from '~/components/heading';
import { Separator } from '~/components/ui/separator';

export const metadata: Metadata = { title: 'Início' };

export default function DashboardPage() {
  return (
    <Container>
      <header className="mt-4">
        <Title>Início</Title>
        <p className="mt-1 text-sm text-muted-foreground">Visão geral do sistema.</p>
      </header>

      <Separator orientation="horizontal" className="my-8 w-auto" />

      <p className="text-sm text-muted-foreground">
        Ponto de partida do template. Use a tela de{' '}
        <strong className="text-foreground">Colaboradores</strong> como molde para novos CRUDs.
      </p>
    </Container>
  );
}
