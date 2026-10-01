import type { Unit, UnitOccupancy } from '~/cases/units/units-types';
import { UNIT_COLUMNS } from '~/cases/units/units-types';
import { connection } from '~/libs/connection';
import { ForbiddenError, NotFoundError } from '~/libs/errors/app-errors';

type UpdateOccupancyCaseInput = {
  unit_id: string;
  occupancy: UnitOccupancy;
  /** Unidade do usuário logado — só ela pode ser alterada. */
  user_unit_id: string;
};

type UpdateOccupancyCaseOutput = {
  unit: Unit;
};

async function update_occupancy_case({
  unit_id,
  occupancy,
  user_unit_id,
}: UpdateOccupancyCaseInput): Promise<UpdateOccupancyCaseOutput> {
  if (unit_id !== user_unit_id) {
    throw new ForbiddenError('Você só pode alterar a lotação da sua unidade');
  }

  const [unit] = await connection('units')
    .where({ id: unit_id })
    .update({ occupancy, updated_at: connection.fn.now() })
    .returning<Unit[]>(UNIT_COLUMNS);

  if (!unit) throw new NotFoundError('Unidade não encontrada');

  return { unit };
}

export { update_occupancy_case };
