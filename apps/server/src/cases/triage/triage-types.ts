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

/**
 * Entradas e saída clínicas da triagem, assinadas em um JWT separado para que o
 * cartão possa confiar no nível sem o cliente poder mudá-lo. O `symptoms`
 * carrega os ids do catálogo (os rótulos são resolvidos quando o cartão é
 * montado).
 */
type TriageResultClaims = {
  level: number;
  warning_signs: string[];
  symptoms: SymptomId[];
  description: string | null;
  onset: Onset | null;
  intensity: number | null;
  age: number | null;
  pregnant: Pregnant | null;
};

export type { Network, Onset, Pregnant, TriageAnswers, TriageInput, TriageResultClaims };
