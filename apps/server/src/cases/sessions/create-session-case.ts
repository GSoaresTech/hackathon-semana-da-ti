import { connection } from '~/libs/connection';
import { InvalidCredentialsError } from '~/libs/errors/app-errors';
import { verify_password } from '~/libs/hash';
import { sign_session } from '~/libs/tokens';

type CreateSessionCaseInput = {
  phone: string;
  password: string;
};

type CreateSessionCaseOutput = {
  token: string;
  user: { id: string; name: string; phone: string };
  unit: { id: string; name: string };
};

async function create_session_case({
  phone,
  password,
}: CreateSessionCaseInput): Promise<CreateSessionCaseOutput> {
  const user = await connection('users')
    .join('units', 'units.id', 'users.unit_id')
    .select(
      'users.id',
      'users.name',
      'users.phone',
      'users.password_hash',
      'units.id as unit_id',
      'units.name as unit_name',
    )
    .where('users.phone', phone)
    .first();

  // Mesma resposta para telefone inexistente e senha errada.
  if (!user || !(await verify_password(password, user.password_hash))) {
    throw new InvalidCredentialsError();
  }

  const token = await sign_session({ id: user.id, unit_id: user.unit_id, name: user.name });

  return {
    token,
    user: { id: user.id, name: user.name, phone: user.phone },
    unit: { id: user.unit_id, name: user.unit_name },
  };
}

export { create_session_case };
