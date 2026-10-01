import { clientEnvSchema, parseEnvOrThrow } from '~/libs/env.schema';

/**
 * Variáveis de ambiente públicas — vão para o bundle do browser.
 *
 * Cada `NEXT_PUBLIC_*` precisa ser escrita LITERALMENTE como
 * `process.env.NEXT_PUBLIC_X`: o Next substitui essas expressões por texto no
 * build. Acesso dinâmico (`process.env[nome]`) não é substituído e chega como
 * `undefined` no client — por isso o objeto abaixo é montado campo a campo em
 * vez de repassar `process.env` inteiro.
 *
 * Nunca coloque segredo aqui. Para variáveis privadas use `~/libs/env.server`.
 */
const env = parseEnvOrThrow(
  clientEnvSchema,
  {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_FILES_API_URL: process.env.NEXT_PUBLIC_FILES_API_URL,
  },
  'Variáveis de ambiente públicas inválidas — confira o .env (veja .env.example):',
);

export { env };
