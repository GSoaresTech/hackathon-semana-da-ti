import { config } from 'dotenv';
import { z } from 'zod';

const env_file = process.env.NODE_ENV === 'test' ? '.env.test' : '.env.local';
config({ path: env_file, quiet: true });

const env_schema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string(),
  ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((value) => value.split(',')),
  SESSION_SECRET: z.string().min(16),
  CARD_SECRET: z.string().min(16),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().min(1),
});

const _env = env_schema.safeParse(process.env);

if (_env.success === false) {
  console.error('Invalid environment variables!', z.prettifyError(_env.error));
  process.exit(1);
}

const env = _env.data;

export { env };
