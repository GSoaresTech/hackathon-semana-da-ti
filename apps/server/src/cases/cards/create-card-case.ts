import { createHash } from 'node:crypto';

import type { CardSummary } from '~/cases/cards/cards-types';
import { sign_card } from '~/libs/tokens';

type CreateCardCaseInput = CardSummary;

type CreateCardCaseOutput = {
  token: string;
  code: string;
  issued_at: string;
  expires_at: string;
};

async function create_card_case(input: CreateCardCaseInput): Promise<CreateCardCaseOutput> {
  const { token, issued_at, expires_at } = await sign_card(input);

  return {
    token,
    code: card_code(token),
    issued_at: issued_at.toISOString(),
    expires_at: expires_at.toISOString(),
  };
}

/** Código curto para a recepção falar em voz alta (ex.: "#A7F2"). */
function card_code(token: string): string {
  return `#${createHash('sha256').update(token).digest('hex').slice(0, 4).toUpperCase()}`;
}

export { card_code, create_card_case };
