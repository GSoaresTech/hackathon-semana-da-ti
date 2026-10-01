import type { SymptomId } from '~/cases/symptoms/symptoms-catalog';

type Network = 'public' | 'private';
type Onset = 'hours' | '1-2-days' | '3-7-days' | 'over-1-week';
type Pregnant = 'yes' | 'no' | 'not-applicable';

type TriageAnswers = {
  onset: Onset;
  intensity?: number | null;
  age: number;
  pregnant: Pregnant;
};

type TriageInput = {
  network: Network;
  symptoms: SymptomId[];
  description?: string | null;
  answers?: TriageAnswers | null;
};

export type { Network, Onset, Pregnant, TriageAnswers, TriageInput };
