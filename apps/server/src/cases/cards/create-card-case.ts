import { createHash } from 'node:crypto';

import type { CardSummary } from '~/cases/cards/cards-types';
import { get_symptom_labels } from '~/cases/symptoms/symptoms-catalog';
import { BadRequestError } from '~/libs/errors/app-errors';
import { sign_card, verify_triage_result } from '~/libs/tokens';

type CreateCardCaseInput = {
  result_token: string;
  destination: CardSummary['destination'];
};

type CreateCardCaseOutput = {
  token: string;
  code: string;
  issued_at: string;
  expires_at: string;
  card: CardSummary;
};

async function create_card_case({
  result_token,
  destination,
}: CreateCardCaseInput): Promise<CreateCardCaseOutput> {
  const claims = await verify_triage_result(result_token);

  if (!claims) {
    throw new BadRequestError('Resultado da triagem inválido ou expirado. Refaça a triagem.');
  }

  const card: CardSummary = {
    level: claims.level,
    symptoms: get_symptom_labels(claims.symptoms),
    description: claims.description,
    onset: claims.onset,
    intensity: claims.intensity,
    age: claims.age,
    pregnant: claims.pregnant,
    warning_signs: claims.warning_signs,
    destination,
  };

  const { token, issued_at, expires_at } = await sign_card(card);

  return {
    token,
    code: card_code(token),
    issued_at: issued_at.toISOString(),
    expires_at: expires_at.toISOString(),
    card,
  };
}

/** Código curto para a recepção falar em voz alta (ex.: "#A7F2"). */
function card_code(token: string): string {
  return `#${createHash('sha256').update(token).digest('hex').slice(0, 4).toUpperCase()}`;
}

export { card_code, create_card_case };
