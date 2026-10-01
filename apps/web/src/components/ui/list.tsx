'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { createContext, useContext, useMemo } from 'react';

import { Button } from '~/components/ui/button';
import { cn } from '~/libs/utils';

/**
 * Listagem paginada — a "tabela" padrão do projeto.
 *
 * É o EXEMPLO CANÔNICO do padrão de subcomponentes da casa:
 *
 * - Uma família de exports irmãos com prefixo comum (`ListRoot`, `ListHead`,
 *   `ListItem`, …), num único arquivo, com um único `export { }` no fim.
 * - O estado compartilhado (aqui, o template de colunas) viaja por um Context
 *   local ao módulo, não por prop drilling.
 * - NÃO usamos dot-notation (`List.Item`) nem `Object.assign`. Exports nomeados
 *   preservam tree-shaking e o "go to definition" do editor.
 *
 * Usa `ul`/`li` com CSS grid em vez de `<table>` porque as linhas precisam
 * conter botões, menus e badges — coisas que quebram o layout de tabela.
 *
 * Uso:
 *   <ListRoot cols="grid-cols-[auto_10rem_6rem_2rem]">
 *     <ListContent>
 *       <ListHead>…</ListHead>
 *       <ListItem>…</ListItem>
 *     </ListContent>
 *     <ListFooter total={…} page={…} pages={…} onPageChange={setPage} />
 *   </ListRoot>
 */

interface ListContextValue {
  cols: string;
}

const ListContext = createContext<ListContextValue | null>(null);

function useListContext(component: string): ListContextValue {
  const context = useContext(ListContext);

  if (!context) {
    throw new Error(`<${component} /> precisa estar dentro de <ListRoot />`);
  }

  return context;
}

interface ListRootProps {
  children: React.ReactNode;
  /** Template de colunas do Tailwind, ex.: `grid-cols-[auto_10rem_2rem]`. */
  cols: string;
}

const ListRoot: React.FC<ListRootProps> = ({ children, cols }) => {
  const value = useMemo(() => ({ cols }), [cols]);

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
};

interface ListContentProps {
  children: React.ReactNode;
  className?: string;
}

const ListContent: React.FC<ListContentProps> = ({ children, className }) => {
  return (
    <div className="-mx-6 flex w-screen flex-col overflow-x-auto sm:mx-0 sm:w-full">
      <ul className={cn('w-max min-w-full overflow-hidden rounded-lg border', className)}>
        {children}
      </ul>
    </div>
  );
};

interface ListRowProps {
  children: React.ReactNode;
  className?: string;
}

const ListHead: React.FC<ListRowProps> = ({ children, className }) => {
  const { cols } = useListContext('ListHead');

  return (
    <li
      className={cn(
        'grid gap-4 border-b bg-muted px-2 py-2 text-sm font-semibold text-muted-foreground',
        cols,
        className,
      )}
    >
      {children}
    </li>
  );
};

const ListItem: React.FC<ListRowProps> = ({ children, className }) => {
  const { cols } = useListContext('ListItem');

  return (
    <li
      className={cn(
        'grid gap-4 border-b px-2 py-2 text-sm font-medium text-foreground transition-colors last:border-b-0 even:bg-muted/40 hover:bg-muted *:inline-flex *:items-center',
        cols,
        className,
      )}
    >
      {children}
    </li>
  );
};

/**
 * Linha invisível que ocupa espaço. Preenchendo a lista até o tamanho da página
 * o rodapé não sobe quando a última página vem incompleta.
 */
const ListItemEmpty: React.FC<{ className?: string }> = ({ className }) => {
  const { cols } = useListContext('ListItemEmpty');

  return (
    <li
      aria-hidden
      className={cn(
        'grid gap-4 border-b px-2 py-2 text-sm last:border-b-0 even:bg-muted/40',
        cols,
        className,
      )}
    >
      <p className="pointer-events-none select-none text-transparent">—</p>
    </li>
  );
};

/** Janela de páginas ao redor da atual: 1 … 4 5 [6] 7 8 … 20 */
function getPortals({ page, totalPages }: { page: number; totalPages: number }) {
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => i + start);
}

interface ListFooterProps {
  className?: string;
  total?: number;
  page?: number;
  pages?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
}

const ListFooter: React.FC<ListFooterProps> = ({
  className,
  total,
  page,
  pages,
  perPage,
  onPageChange,
}) => {
  const currentPage = page ?? 1;
  const totalPages = pages ?? 1;

  const { portals, dotsBefore, dotsAfter, showFirst, showLast } = useMemo(() => {
    const list = getPortals({ page: currentPage, totalPages });

    return {
      portals: list,
      showFirst: (list.at(0) ?? 1) > 1,
      dotsBefore: (list.at(0) ?? 1) > 2,
      dotsAfter: (list.at(-1) ?? totalPages) < totalPages - 1,
      showLast: list.at(-1) !== totalPages,
    };
  }, [currentPage, totalPages]);

  return (
    <div className={cn('mt-6 flex flex-col items-center gap-4 sm:flex-row', className)}>
      <p className="text-sm text-muted-foreground">
        Mostrando {(perPage ?? 0).toLocaleString('pt-BR')} de {(total ?? 0).toLocaleString('pt-BR')}{' '}
        registros
      </p>

      <nav aria-label="Paginação" className="flex items-center gap-2 sm:ml-auto">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeftIcon size={16} />
          <span className="hidden sm:block">Anterior</span>
        </Button>

        {showFirst && (
          <Button size="sm" variant="outline" onClick={() => onPageChange?.(1)}>
            1
          </Button>
        )}
        {dotsBefore && <span className="px-1 text-sm text-muted-foreground">...</span>}

        {portals.map((portal) => (
          <Button
            key={portal}
            size="sm"
            variant={portal === currentPage ? 'ghost' : 'outline'}
            aria-current={portal === currentPage ? 'page' : undefined}
            disabled={portal === currentPage}
            onClick={() => onPageChange?.(portal)}
          >
            {portal.toLocaleString('pt-BR')}
          </Button>
        ))}

        {dotsAfter && <span className="px-1 text-sm text-muted-foreground">...</span>}
        {showLast && totalPages > 1 && (
          <Button size="sm" variant="outline" onClick={() => onPageChange?.(totalPages)}>
            {totalPages.toLocaleString('pt-BR')}
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <span className="hidden sm:block">Próxima</span>
          <ChevronRightIcon size={16} />
        </Button>
      </nav>
    </div>
  );
};

export { ListContent, ListFooter, ListHead, ListItem, ListItemEmpty, ListRoot };
