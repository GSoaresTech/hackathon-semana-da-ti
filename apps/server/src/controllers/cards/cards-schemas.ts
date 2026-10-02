import { z } from 'zod';

/*
 * Formato público do cartão de triagem, compartilhado por POST e GET /api/cards.
 * Reutilizar o mesmo schema garante que o front recebe o mesmo objeto que o
 * server assina — o POST agora devolve o `card` montado para evitar divergência.
 */

const destination_schema = z.object({
  id: z.string().nullable(),
  name: z.string().min(1).max(120),
});

const card_summary_schema = z.object({
  level: z.number().int().min(1).max(5),
  symptoms: z.array(z.string()),
  description: z.string().nullable(),
  onset: z.enum(['hours', '1-2-days', '3-7-days', 'over-1-week']).nullable(),
  intensity: z.number().int().min(0).max(10).nullable(),
  age: z.number().int().min(0).max(120).nullable(),
  pregnant: z.enum(['yes', 'no', 'not-applicable']).nullable(),
  warning_signs: z.array(z.string()),
  destination: destination_schema.nullable(),
});

const card_response_schema = z.object({
  token: z.string(),
  code: z.string(),
  issued_at: z.string(),
  expires_at: z.string(),
  card: card_summary_schema,
});

export { card_response_schema, card_summary_schema, destination_schema };
