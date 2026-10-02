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
  destination: { id: string | null; name: string; travelMinutes: number | null } | null;
};

type CreateCardInput = {
  resultToken: string;
  destination: CardSummary['destination'];
};

export type Card = {
  token: string;
  code: string;
  issuedAt: string;
  expiresAt: string;
  /** Resumo que o server montou a partir do `resultToken` — o front mostra este. */
  card: CardSummary;
};

export async function createCard(input: CreateCardInput): Promise<Card> {
  const { data } = await api.post('/cards', input);

  return data;
}

/** Lê o cartão de um QR na recepção. Exige login: a rota é do painel da unidade. */
export async function getCard(token: string): Promise<Omit<Card, 'token'>> {
  const { data } = await api.get(`/cards/${encodeURIComponent(token)}`);

  return data;
}
