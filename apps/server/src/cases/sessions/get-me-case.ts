import type { Unit } from '~/cases/units/units-types';
import { UNIT_COLUMNS } from '~/cases/units/units-types';
import { connection } from '~/libs/connection';
import { UnauthorizedError } from '~/libs/errors/app-errors';

type GetMeCaseInput = {
  user_id: string;
};

type GetMeCaseOutput = {
  user: { id: string; name: string; phone: string };
  unit: Unit;
};

async function get_me_case({ user_id }: GetMeCaseInput): Promise<GetMeCaseOutput> {
  const user = await connection('users')
    .select('id', 'name', 'phone', 'unit_id')
    .where({ id: user_id })
    .first();

  // Usuário removido depois de logar: a sessão deixa de valer.
  if (!user) throw new UnauthorizedError();

  const unit: Unit = await connection('units')
    .select(UNIT_COLUMNS)
    .where({ id: user.unit_id })
    .first();

  return { user: { id: user.id, name: user.name, phone: user.phone }, unit };
}

export { get_me_case };
