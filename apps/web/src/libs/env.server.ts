import 'server-only';

import { readServerEnv } from '~/libs/env.schema';

/**
 * Variáveis de ambiente privadas — NUNCA chegam ao browser.
 *
 * O `import 'server-only'` no topo faz o build falhar se algum Client Component
 * importar este arquivo, mesmo que indiretamente. É essa barreira que garante
 * que `SESSION_SECRET` não vaze para o bundle.
 *
 * Os schemas vivem em `~/libs/env.schema` porque o `next.config.ts` também
 * precisa deles e não pode importar um módulo `server-only`.
 */
const serverEnv = readServerEnv();

export { serverEnv };
