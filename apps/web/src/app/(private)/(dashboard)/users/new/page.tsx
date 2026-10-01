import type { Metadata } from 'next';

import { Container } from '~/components/container';
import { CreateUserForm } from '~/components/forms/create-user-form';
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

export const metadata: Metadata = { title: 'Novo colaborador' };

export default function NewUserPage() {
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
                <BreadcrumbPage>Novo</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Title>Novo colaborador</Title>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre um colaborador e defina seu acesso inicial.
          </p>
        </header>

        <Separator orientation="horizontal" className="my-8 w-auto" />

        <CreateUserForm />
      </Container>
    </RouteGuard>
  );
}
