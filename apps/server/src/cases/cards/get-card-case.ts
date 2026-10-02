import type { CardSummary } from '~/cases/cards/cards-types';
import { card_code } from '~/cases/cards/create-card-case';
import { BadRequestError } from '~/libs/errors/app-errors';
import { verify_card } from '~/libs/tokens';

type GetCardCaseInput = {
  token: string;
};

type GetCardCaseOutput = {
  code: string;
  issued_at: string;
  expires_at: string;
  card: CardSummary;
};

async function get_card_case({ token }: GetCardCaseInput): Promise<GetCardCaseOutput> {
  const verified = await verify_card(token);

  // 400 e não 401: o 401 fica reservado para falta de sessão (o interceptor do
  // web desloga a recepção quando vê 401 em /unit).
  if (!verified) throw new BadRequestError('Cartão inválido ou expirado');

  return {
    code: card_code(token),
    issued_at: verified.issued_at.toISOString(),
    expires_at: verified.expires_at.toISOString(),
    // Assinado por nós em `create_card_case` — o formato é confiável.
    card: verified.card as CardSummary,
  };
}

export { get_card_case };
