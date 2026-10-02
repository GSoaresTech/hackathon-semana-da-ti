import {
  build_triage_input,
  TRIAGE_INSTRUCTIONS,
  type TriageAiOutput,
  triage_ai_schema,
} from '~/cases/triage/triage-prompt';
import { detect_emergency } from '~/cases/triage/triage-rules';
import type { TriageInput } from '~/cases/triage/triage-types';
import { generate_json } from '~/libs/ai';
import { sign_triage_result } from '~/libs/tokens';

type CreateTriageCaseInput = TriageInput;

type CreateTriageCaseOutput =
  | { emergency: true; reason: string; instructions: string[] }
  | { emergency: false }
  | ({ emergency: false; result_token: string } & TriageAiOutput);

/**
 * 1. Regras de sinal grave (sem IA). Achou → emergência, acabou.
 * 2. Sem `answers` (etapa Sintomas): só confirma que não é emergência.
 * 3. Com `answers`: a IA classifica o nível e escreve as orientações. O
 *    resultado volta assinado em `result_token` para que o cartão possa confiar
 *    no nível sem o cliente poder mudá-lo.
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

  const result_token = await sign_triage_result({
    level: result.level,
    warning_signs: result.warning_signs,
    symptoms: input.symptoms,
    description: input.description?.trim() || null,
    onset: input.answers.onset,
    intensity: input.answers.intensity ?? null,
    age: input.answers.age,
    pregnant: input.answers.pregnant,
  });

  return { emergency: false, ...result, result_token };
}

export type { CreateTriageCaseInput, CreateTriageCaseOutput };
export { create_triage_case };
