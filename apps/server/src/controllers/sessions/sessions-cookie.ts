import type { CookieSerializeOptions } from '@fastify/cookie';

import { env } from '~/libs/environments';

/** Mesmo prazo do JWT de sessão (`~/libs/tokens`). */
const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

const session_cookie_options: CookieSerializeOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  path: '/',
};

export { SESSION_MAX_AGE_SECONDS, session_cookie_options };
