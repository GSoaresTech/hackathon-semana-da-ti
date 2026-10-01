import type { Metadata } from 'next';

import { Container } from '~/components/container';
import { UpdateUserForm } from '~/components/forms/update-user-form';
import { RouteGuard } from '~/components/guard/route-guard';
import { Title } from '~/components/heading';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import { Separator } from '~/components/ui/separator';
import { Roles } from '~/libs/constants';

export const metadata: Metadata = { title: 'Editar colaborador' };

export default async function EditUserPage({ params }: PageProps<'/users/[userId]/edit'>) {
  // No Next 16 `params` é uma Promise e precisa de await.
  const { userId } = await params;

  return (
    <RouteGuard roles={[Roles.SYSTEM, Roles.ADMINISTRATOR, Roles.HR]} redirectTo="/users">
      <Container>
        <header className="mt-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/users">Colaboradores</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Editar</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Title>Editar colaborador</Title>
          <p className="mt-1 text-sm text-muted-foreground">
            Atualize os dados de contato do colaborador.
          </p>
        </header>

        <Separator orientation="horizontal" className="my-8 w-auto" />

        <UpdateUserForm userId={userId} />
      </Container>
    </RouteGuard>
  );
}
