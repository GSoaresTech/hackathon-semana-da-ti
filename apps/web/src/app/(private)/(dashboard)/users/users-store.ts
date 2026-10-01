import { create } from 'zustand';

import type { Roles } from '~/libs/constants';

/*
 * STORE DE LISTAGEM — uma por tela de lista, colocada na pasta da rota.
 *
 * O que entra aqui: estado de UI (página atual, busca, filtros, seleção).
 * O que NÃO entra: dado vindo do servidor — isso é do TanStack Query. Duplicar
 * a resposta da API numa store cria duas fontes de verdade que divergem.
 *
 * O objeto `defaultStore` existe para o `reset()` não precisar repetir os
 * valores iniciais (e esquecer um deles quando um filtro novo aparecer).
 *
 * Todo `set` que muda filtro volta para a página 1: manter a página 5 depois de
 * filtrar levaria a uma lista vazia sem explicação.
 */

interface UsersStore {
  page: number;
  search: string;
  situation: number | null;
  role: Roles | null;

  reset: () => void;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setSituation: (situation: number | null) => void;
  setRole: (role: Roles | null) => void;
}

const defaultStore: Pick<UsersStore, 'page' | 'search' | 'situation' | 'role'> = {
  page: 1,
  search: '',
  situation: null,
  role: null,
};

const useUsers = create<UsersStore>((set) => ({
  ...defaultStore,

  reset: () => set(defaultStore),
  setPage: (page) => set({ page }),
  setSearch: (search) => set({ search, page: 1 }),
  setSituation: (situation) => set({ situation, page: 1 }),
  setRole: (role) => set({ role, page: 1 }),
}));

export { useUsers };
