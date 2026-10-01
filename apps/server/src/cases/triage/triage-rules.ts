import type { TriageInput } from '~/cases/triage/triage-types';

/*
 * Regras de sinal grave — rodam ANTES da IA e nunca dependem dela.
 *
 * Funções puras: recebem o que a pessoa informou e dizem se é caso de ligar
 * 192 agora. Na dúvida, a regra prefere errar para o lado da emergência.
 * Os textos são mostrados na tela de Emergência, em linguagem leiga.
 */

type EmergencySignal = {
  reason: string;
  instructions: string[];
};

type Rule = {
  test: (input: TriageInput) => boolean;
  reason: string;
  extra_instructions?: string[];
};

const BASE_INSTRUCTIONS = [
  'Fique sentado e evite esforço.',
  'Destranque a porta e peça a alguém para ficar com você.',
  'Separe seus documentos e remédios que usa.',
];

/** Trechos procurados no relato livre (já sem acento e em minúsculas). */
const SERIOUS_KEYWORDS = [
  'nao consigo respirar',
  'sem conseguir respirar',
  'parou de respirar',
  'sufocando',
  'engasgad',
  'convuls',
  'desmai',
  'desacordad',
  'inconsciente',
  'boca torta',
  'fala enrolada',
  'nao sinto o braco',
  'nao sinto a perna',
  'sangrando muito',
  'sangramento forte',
  'muito sangue',
];

const SELF_HARM_KEYWORDS = ['suicid', 'me matar', 'tirar minha vida', 'acabar com a minha vida'];

function normalize(text?: string | null): string {
  return (text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function has(input: TriageInput, ...ids: TriageInput['symptoms']): boolean {
  return ids.every((id) => input.symptoms.includes(id));
}

function mentions(input: TriageInput, keywords: string[]): boolean {
  const text = normalize(input.description);

  return keywords.some((keyword) => text.includes(keyword));
}

const RULES: Rule[] = [
  {
    test: (input) => mentions(input, SELF_HARM_KEYWORDS),
    reason: 'O que você contou mostra que você precisa de apoio agora.',
    extra_instructions: ['Você também pode ligar 188 (CVV), a qualquer hora, de graça.'],
  },
  {
    test: (input) => has(input, 'chest_pain', 'shortness_of_breath'),
    reason: 'Dor no peito com falta de ar pode ser grave.',
  },
  {
    test: (input) => has(input, 'fainting'),
    reason: 'Desmaio pode ser sinal de algo grave.',
  },
  {
    test: (input) => has(input, 'bleeding') && input.answers?.pregnant === 'yes',
    reason: 'Sangramento na gravidez precisa de atendimento imediato.',
  },
  {
    test: (input) => has(input, 'shortness_of_breath') && (input.answers?.age ?? 0) >= 65,
    reason: 'Falta de ar depois dos 65 anos pode piorar rápido.',
  },
  {
    test: (input) => has(input, 'chest_pain') && (input.answers?.intensity ?? 0) >= 8,
    reason: 'Dor forte no peito pode ser grave.',
  },
  {
    test: (input) => mentions(input, SERIOUS_KEYWORDS),
    reason: 'O que você descreveu pode ser um sinal grave.',
  },
];

/** Devolve o primeiro sinal grave encontrado, ou `null`. */
function detect_emergency(input: TriageInput): EmergencySignal | null {
  const rule = RULES.find((candidate) => candidate.test(input));
  if (!rule) return null;

  return {
    reason: rule.reason,
    instructions: [...BASE_INSTRUCTIONS, ...(rule.extra_instructions ?? [])],
  };
}

export type { EmergencySignal };
export { detect_emergency };
