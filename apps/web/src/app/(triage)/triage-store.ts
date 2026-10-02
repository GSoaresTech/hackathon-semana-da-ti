import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Network } from '~/libs/constants';
import type { EmergencyResult, TriageAnswers, TriageResult } from '~/services/triage';

/*
 * Estado do fluxo de triagem, compartilhado pelas telas de `(triage)`.
 *
 * Persistido em `sessionStorage` para sobreviver a um recarregamento sem sair
 * do aparelho: nada disto vai para banco (LGPD) e some ao fechar a aba.
 */

type Coords = { lat: number; lng: number };
type GeolocationStatus = 'idle' | 'granted' | 'denied';

type Destination = { id: string | null; name: string; travelMinutes: number | null };

interface TriageState {
  network: Network;
  coords: Coords | null;
  geolocation: GeolocationStatus;
  symptoms: string[];
  description: string;
  answers: Partial<TriageAnswers>;
  emergency: EmergencyResult | null;
  result: TriageResult | null;
  destination: Destination | null;

  setNetwork: (network: Network) => void;
  setLocation: (geolocation: GeolocationStatus, coords?: Coords | null) => void;
  toggleSymptom: (id: string) => void;
  setDescription: (description: string) => void;
  setAnswers: (answers: Partial<TriageAnswers>) => void;
  setEmergency: (emergency: EmergencyResult) => void;
  setResult: (result: TriageResult) => void;
  setDestination: (destination: Destination) => void;
  reset: () => void;
}

const defaultStore = {
  network: 'public' as Network,
  coords: null,
  geolocation: 'idle' as GeolocationStatus,
  symptoms: [],
  description: '',
  answers: {},
  emergency: null,
  result: null,
  destination: null,
};

const useTriage = create<TriageState>()(
  persist(
    (set) => ({
      ...defaultStore,

      setNetwork: (network) => set({ network }),
      setLocation: (geolocation, coords = null) => set({ geolocation, coords }),
      // Mudar a entrada invalida o que foi calculado a partir dela.
      toggleSymptom: (id) =>
        set((state) => ({
          symptoms: state.symptoms.includes(id)
            ? state.symptoms.filter((symptom) => symptom !== id)
            : [...state.symptoms, id],
          emergency: null,
          result: null,
        })),
      setDescription: (description) => set({ description, emergency: null, result: null }),
      setAnswers: (answers) =>
        set((state) => ({ answers: { ...state.answers, ...answers }, result: null })),
      setEmergency: (emergency) => set({ emergency, result: null }),
      setResult: (result) => set({ result, emergency: null }),
      setDestination: (destination) => set({ destination }),
      // Mantém rede e localização: são escolhas da pessoa, não do caso.
      reset: () =>
        set((state) => ({ ...defaultStore, network: state.network, coords: state.coords })),
    }),
    {
      name: 'triar:triage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({
        network,
        coords,
        geolocation,
        symptoms,
        description,
        answers,
        emergency,
        result,
        destination,
      }) => ({
        network,
        coords,
        geolocation,
        symptoms,
        description,
        answers,
        emergency,
        result,
        destination,
      }),
    },
  ),
);

/**
 * `true` depois que o estado salvo no `sessionStorage` foi carregado.
 *
 * No servidor não existe `sessionStorage`: o HTML sai com o estado padrão. As
 * telas esperam este sinal antes de ler o store ou redirecionar, senão a
 * hidratação do React divergiria do HTML (e uma tela recarregada voltaria
 * para o início por engano).
 */
function useTriageHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useTriage.persist.onFinishHydration(onChange),
    () => useTriage.persist.hasHydrated(),
    () => false,
  );
}

export type { Coords, Destination, GeolocationStatus, TriageState };
export { useTriage, useTriageHydrated };
