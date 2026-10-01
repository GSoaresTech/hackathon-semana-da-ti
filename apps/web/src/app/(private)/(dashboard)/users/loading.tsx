import { Container } from '~/components/container';
import { Separator } from '~/components/ui/separator';
import { Skeleton } from '~/components/ui/skeleton';

/**
 * Estado de carregamento da rota (Suspense boundary do App Router).
 *
 * Cobre o carregamento do próprio segmento — não substitui o `isPending` do
 * React Query dentro da lista, que é o que trata a troca de página e de filtro.
 */
export default function UsersLoading() {
  return (
    <Container>
      <header className="mt-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-80" />
      </header>

      <Separator orientation="horizontal" className="my-8 w-auto" />

      <Skeleton className="h-9 w-full" />
      <Skeleton className="mt-8 h-[28rem] w-full" />
    </Container>
  );
}
