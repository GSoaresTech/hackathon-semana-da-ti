import type { Metadata } from 'next';
import Link from 'next/link';

import { Container } from '~/components/container';
import { Title } from '~/components/heading';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';

import { UserData } from './user-data';

export const metadata: Metadata = { title: 'Colaborador' };

export default async function UserPage({ params }: PageProps<'/users/[userId]'>) {
  const { userId } = await params;

  return (
    <Container>
      <header className="mt-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/users">Colaboradores</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Detalhes</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-end justify-between gap-4">
          <div>
            <Title>Colaborador</Title>
            <p className="mt-1 text-sm text-muted-foreground">Dados cadastrais do colaborador.</p>
          </div>

          <Button asChild size="sm">
            <Link href={`/users/${userId}/edit`}>Editar</Link>
          </Button>
        </div>
      </header>

      <Separator orientation="horizontal" className="my-8 w-auto" />

      <UserData userId={userId} />
    </Container>
  );
}
