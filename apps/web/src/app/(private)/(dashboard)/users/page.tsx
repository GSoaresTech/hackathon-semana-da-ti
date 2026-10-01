import type { Metadata } from 'next';

import { Container } from '~/components/container';
import { Title } from '~/components/heading';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import { Separator } from '~/components/ui/separator';

import { UsersActions } from './users-actions';
import { UsersActiveFilters } from './users-active-filters';
import { UsersList } from './users-list';

export const metadata: Metadata = { title: 'Colaboradores' };

/*
 * PÁGINA DE LISTAGEM — o molde de toda tela de lista.
 *
 * O `page.tsx` é Server Component: não leva 'use client', não busca dados e
 * não tem estado. Ele só exporta `metadata` e compõe o cabeçalho com os filhos
 * client. Toda interatividade mora nos arquivos irmãos `users-*.tsx`.
 *
 * Os arquivos são prefixados com o nome do recurso (`users-list.tsx`, não
 * `list.tsx`) para continuarem distinguíveis nas abas do editor e na busca.
 */
export default function UsersPage() {
  return (
    <Container>
      <header className="mt-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbPage className="text-muted-foreground">Pessoas</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Colaboradores</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Title>Colaboradores</Title>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie os colaboradores cadastrados e seus acessos.
        </p>
      </header>

      <Separator orientation="horizontal" className="my-8 w-auto" />

      <UsersActions />
      <UsersActiveFilters />
      <UsersList />
    </Container>
  );
}
