import {
  build_triage_input,
  TRIAGE_INSTRUCTIONS,
  type TriageAiOutput,
  triage_ai_schema,
} from '~/cases/triage/triage-prompt';
import { detect_emergency } from '~/cases/triage/triage-rules';
import type { TriageInput } from '~/cases/triage/triage-types';
import { generate_json } from '~/libs/ai';

type CreateTriageCaseInput = TriageInput;

type CreateTriageCaseOutput =
  | { emergency: true; reason: string; instructions: string[] }
  | { emergency: false }
  | ({ emergency: false } & TriageAiOutput);

/**
 * 1. Regras de sinal grave (sem IA). Achou → emergência, acabou.
 * 2. Sem `answers` (etapa Sintomas): só confirma que não é emergência.
 * 3. Com `answers`: a IA classifica o nível e escreve as orientações.
 *    Falha da IA vira 503 (ServiceUnavailableError, lançado em `~/libs/ai`).
 */
async function create_triage_case(input: CreateTriageCaseInput): Promise<CreateTriageCaseOutput> {
  const signal = detect_emergency(input);

  if (signal) {
    return { emergency: true, reason: signal.reason, instructions: signal.instructions };
  }

  if (!input.answers) return { emergency: false };

  const result = await generate_json({
    instructions: TRIAGE_INSTRUCTIONS,
    input: build_triage_input(input),
    schema: triage_ai_schema,
    schema_name: 'triage_result',
  });

  return { emergency: false, ...result };
}

export type { CreateTriageCaseInput, CreateTriageCaseOutput };
export { create_triage_case };
