import { create_card_case } from '~/cases/cards/create-card-case';
import type { TriageResultClaims } from '~/cases/triage/triage-types';
import { sign_triage_result } from '~/libs/tokens';

/*
 * Cartões fictícios para apresentar o painel da unidade e desenvolver as
 * sessões 05–11 sem OPENAI_API_KEY. Os casos espelham a tela 08 do PDF e são
 * gerados pelo mesmo caminho do fluxo real (`sign_triage_result` →
 * `create_card_case`), para que o cartão de demonstração passe pelas mesmas
 * verificações que o cartão de um paciente de verdade.
 *
 * Nenhum texto clínico é inventado: `warning_signs` só reutiliza termos que já
 * existem no PDF ou nas fixtures de `test/e2e/triage.spec.ts`.
 */

const DEMO_DESTINATION_NAME = 'Pronto-socorro Santa Clara';

type DemoCase = {
  claims: TriageResultClaims;
  travel_minutes: number;
};

const DEMO_CASES: DemoCase[] = [
  {
    claims: {
      level: 2,
      warning_signs: [],
      symptoms: ['pain'],
      description: 'Dor abdominal intensa',
      onset: 'hours',
      intensity: 9,
      age: 58,
      pregnant: 'not-applicable',
    },
    travel_minutes: 5,
  },
  {
    claims: {
      level: 3,
      warning_signs: ['Manchas roxas na pele', 'Rigidez no pescoço'],
      symptoms: ['pain', 'fever'],
      description: 'Dor de cabeça forte desde ontem, febre de 39 graus.',
      onset: '1-2-days',
      intensity: 7,
      age: 34,
      pregnant: 'no',
    },
    travel_minutes: 12,
  },
  {
    claims: {
      level: 3,
      warning_signs: [],
      symptoms: ['vomiting', 'dizziness'],
      description: null,
      onset: 'hours',
      intensity: null,
      age: 41,
      pregnant: 'no',
    },
    travel_minutes: 0,
  },
  {
    claims: {
      level: 4,
      warning_signs: [],
      symptoms: ['cough'],
      description: 'Tosse há 5 dias',
      onset: '3-7-days',
      intensity: null,
      age: 27,
      pregnant: 'no',
    },
    travel_minutes: 20,
  },
  {
    claims: {
      level: 5,
      warning_signs: [],
      symptoms: [],
      description: 'Renovação de receita',
      onset: null,
      intensity: null,
      age: 63,
      pregnant: 'not-applicable',
    },
    travel_minutes: 35,
  },
];

type DemoCard = {
  code: string;
  level: number;
  token: string;
  path: string;
};

async function build_demo_cards(): Promise<DemoCard[]> {
  const cards: DemoCard[] = [];

  for (const demo_case of DEMO_CASES) {
    const result_token = await sign_triage_result(demo_case.claims);
    const created = await create_card_case({
      result_token,
      destination: {
        id: null,
        name: DEMO_DESTINATION_NAME,
        travel_minutes: demo_case.travel_minutes,
      },
    });

    cards.push({
      code: created.code,
      level: demo_case.claims.level,
      token: created.token,
      path: `/unit/cards/${created.token}`,
    });
  }

  return cards;
}

/**
 * Token de resultado para injetar no fluxo do paciente quando não há
 * `OPENAI_API_KEY` (ver passo 6 da sessão 02 em `PROMPTS_SESSAO.md`).
 * Reutiliza o caso de nível 3 com relato e sinais de alerta.
 */
async function build_demo_result_token(): Promise<string> {
  return sign_triage_result(DEMO_CASES[1].claims);
}

export type { DemoCard };
export { build_demo_cards, build_demo_result_token };
