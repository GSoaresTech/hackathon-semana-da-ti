import { api } from '~/libs/api';
import type { Onset, Pregnant, UrgencyLevel } from '~/libs/constants';

export type CardSummary = {
  level: UrgencyLevel;
  symptoms: string[];
  description: string | null;
  onset: Onset | null;
  intensity: number | null;
  age: number | null;
  pregnant: Pregnant | null;
  warningSigns: string[];
  destination: { id: string | null; name: string } | null;
};

export type Card = {
  token: string;
  code: string;
  issuedAt: string;
  expiresAt: string;
};

export async function createCard(input: CardSummary): Promise<Card> {
  const { data } = await api.post('/cards', input);

  return data;
}
