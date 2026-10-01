import OpenAI from 'openai';
import { z } from 'zod';

import { env } from '~/libs/environments';
import { ServiceUnavailableError } from '~/libs/errors/app-errors';

/*
 * Wrapper da API da OpenAI.
 *
 * O resto do código não conhece o SDK: pede um JSON tipado por um schema Zod e
 * recebe o objeto já validado — ou um ServiceUnavailableError, em qualquer
 * falha (sem chave, timeout, erro da API, JSON fora do schema).
 */

const REQUEST_TIMEOUT_MS = 20_000;

/** Mensagem exibida direto na tela quando a avaliação falha. */
const UNAVAILABLE_MESSAGE = 'Não conseguimos avaliar agora. Em caso de dúvida, ligue 192.';

let client: OpenAI | null = null;

function get_client(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    if (env.NODE_ENV !== 'production') console.error('[ai] OPENAI_API_KEY não configurada');

    throw new ServiceUnavailableError(UNAVAILABLE_MESSAGE);
  }

  client ??= new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    timeout: REQUEST_TIMEOUT_MS,
    maxRetries: 1,
  });

  return client;
}

type GenerateJsonInput<T> = {
  instructions: string;
  input: string;
  schema: z.ZodType<T>;
  schema_name: string;
};

async function generate_json<T>({
  instructions,
  input,
  schema,
  schema_name,
}: GenerateJsonInput<T>): Promise<T> {
  const openai = get_client();

  // Structured Outputs: o modelo é obrigado a seguir o schema (modo strict).
  const { $schema: _, ...json_schema } = z.toJSONSchema(schema) as Record<string, unknown>;

  let output_text: string;

  try {
    const response = await openai.responses.create({
      model: env.OPENAI_MODEL,
      instructions,
      input,
      text: {
        format: {
          type: 'json_schema',
          name: schema_name,
          schema: json_schema,
          strict: true,
        },
      },
    });

    output_text = response.output_text;
  } catch (error) {
    if (env.NODE_ENV !== 'production') console.error('[ai] falha na chamada:', error);

    throw new ServiceUnavailableError(UNAVAILABLE_MESSAGE);
  }

  const parsed = schema.safeParse(safe_json_parse(output_text));

  if (!parsed.success) {
    if (env.NODE_ENV !== 'production') console.error('[ai] resposta fora do schema:', output_text);

    throw new ServiceUnavailableError(UNAVAILABLE_MESSAGE);
  }

  return parsed.data;
}

function safe_json_parse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export type { GenerateJsonInput };
export { generate_json };
