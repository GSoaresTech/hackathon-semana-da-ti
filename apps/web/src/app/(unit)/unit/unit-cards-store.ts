import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CardSummary } from '~/services/cards';

/*
 * Cartões lidos pela recepção, compartilhado por Pré-triagens e Histórico do dia.
 *
 * LGPD: o resumo é dado de saúde. Fica só no `sessionStorage` deste navegador,
 * nunca vai para o banco, e some ao fechar a aba.
 */

type ReadCardStatus = 'waiting' | 'called';

type ReadCard = {
  code: string;
  card: CardSummary;
  status: ReadCardStatus;
  readAt: string;
  calledAt: string | null;
};

interface UnitCardsState {
  cards: ReadCard[];
  selectedCode: string | null;

  /** Devolve `false` quando o cartão já estava na lista (só o seleciona). */
  addCard: (code: string, card: CardSummary) => boolean;
  selectCard: (code: string) => void;
  callCard: (code: string) => void;
}

const useUnitCards = create<UnitCardsState>()(
  persist(
    (set, get) => ({
      cards: [],
      selectedCode: null,

      addCard: (code, card) => {
        // O `code` sai do hash do token: o mesmo cartão sempre tem o mesmo código.
        const exists = get().cards.some((entry) => entry.code === code);

        if (exists) {
          set({ selectedCode: code });
          return false;
        }

        const entry: ReadCard = {
          code,
          card,
          status: 'waiting',
          readAt: new Date().toISOString(),
          calledAt: null,
        };

        set((state) => ({ cards: [...state.cards, entry], selectedCode: code }));
        return true;
      },
      selectCard: (code) => set({ selectedCode: code }),
      callCard: (code) =>
        set((state) => ({
          cards: state.cards.map((entry) =>
            entry.code === code
              ? { ...entry, status: 'called', calledAt: new Date().toISOString() }
              : entry,
          ),
          selectedCode: state.selectedCode === code ? null : state.selectedCode,
        })),
    }),
    {
      name: 'triar:unit-cards',
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ cards, selectedCode }) => ({ cards, selectedCode }),
    },
  ),
);

/** Mesmo papel do `useTriageHydrated`: esperar o `sessionStorage` antes de ler a lista. */
function useUnitCardsHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useUnitCards.persist.onFinishHydration(onChange),
    () => useUnitCards.persist.hasHydrated(),
    () => false,
  );
}

/** Mais urgente primeiro; no mesmo nível, quem foi lido antes. */
function sortByUrgency(cards: ReadCard[]): ReadCard[] {
  return [...cards].sort((a, b) => a.card.level - b.card.level || a.readAt.localeCompare(b.readAt));
}

export type { ReadCard, ReadCardStatus, UnitCardsState };
export { sortByUrgency, useUnitCards, useUnitCardsHydrated };
