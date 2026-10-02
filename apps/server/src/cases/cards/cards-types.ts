import type { Onset, Pregnant } from '~/cases/triage/triage-types';

/** Resumo da triagem que viaja DENTRO do token do QR code (nada vai para o banco). */
type CardSummary = {
  level: number;
  symptoms: string[];
  description: string | null;
  onset: Onset | null;
  intensity: number | null;
  age: number | null;
  pregnant: Pregnant | null;
  warning_signs: string[];
  destination: { id: string | null; name: string; travel_minutes: number | null } | null;
};

export type { CardSummary };
