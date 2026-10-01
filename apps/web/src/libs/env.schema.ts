import { z } from 'zod';

/**
 * Schemas de ambiente, sem efeito colateral.
 *
 * Fica separado de `env.server.ts` porque o `next.config.ts` também precisa
 * validar a env (para montar o rewrite do backend), e lá não dá para importar
 * um módulo marcado com `server-only` nem usar o alias `~/`.
 *
 * Regra: só schema e função de parse aqui. Quem lê `process.env` é quem importa.
 */

export const serverEnvSchema = z.object({
  PRIVATE_API_URL: z.url({
    error: 'PRIVATE_API_URL deve ser a URL absoluta do backend (ex.: http://localhost:4000/api)',
  }),
  SESSION_SECRET: z
    .string({ error: 'Defina SESSION_SECRET com o mesmo segredo do backend' })
    .min(16, { error: 'SESSION_SECRET precisa ter ao menos 16 caracteres' }),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string({ error: 'Defina NEXT_PUBLIC_API_URL (ex.: "/api")' })
    .min(1, { error: 'NEXT_PUBLIC_API_URL não pode ser vazia' }),
  NEXT_PUBLIC_FILES_API_URL: z
    .union([z.url(), z.literal('')])
    .optional()
    .transform((value) => value || undefined),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/** Valida e falha rápido, com a lista completa do que está errado. */
export function parseEnvOrThrow<T extends z.ZodType>(
  schema: T,
  input: unknown,
  label: string,
): z.infer<T> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    throw new Error(`${label}\n${z.prettifyError(parsed.error)}`);
  }

  return parsed.data;
}

/** Lê e valida as variáveis privadas a partir de `process.env`. */
export function readServerEnv(): ServerEnv {
  return parseEnvOrThrow(
    serverEnvSchema,
    {
      PRIVATE_API_URL: process.env.PRIVATE_API_URL,
      SESSION_SECRET: process.env.SESSION_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    },
    'Variáveis de ambiente do servidor inválidas — confira o .env (veja .env.example):',
  );
}
