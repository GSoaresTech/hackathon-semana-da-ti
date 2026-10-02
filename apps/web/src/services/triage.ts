import { api } from '~/libs/api';
import type { Network, Onset, Pregnant, UrgencyLevel } from '~/libs/constants';

export type TriageAnswers = {
  onset: Onset;
  intensity: number | null;
  age: number;
  pregnant: Pregnant;
};

type CreateTriageInput = {
  network: Network;
  symptoms: string[];
  description: string | null;
  /** Sem respostas, o backend só roda as regras de sinal grave (etapa Sintomas). */
  answers?: TriageAnswers;
};

export type EmergencyResult = {
  emergency: true;
  reason: string;
  instructions: string[];
};

export type TriageResult = {
  emergency: false;
  level: Exclude<UrgencyLevel, 1>;
  title: string;
  explanation: string;
  instructions: string[];
  warningSigns: string[];
  /** JWT com o resumo clínico, usado como entrada para `POST /api/cards`. */
  resultToken: string;
};

type CreateTriageOutput = EmergencyResult | TriageResult | { emergency: false };

export async function createTriage(input: CreateTriageInput): Promise<CreateTriageOutput> {
  const { data } = await api.post('/triage', input);

  return data;
}
