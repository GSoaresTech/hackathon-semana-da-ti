/*
 * Catálogo de sintomas pré-definidos da tela Sintomas.
 *
 * Fica em código (e não no banco) porque as regras de sinal grave
 * (`~/cases/triage/triage-rules`) dependem destes ids. Rótulos em linguagem
 * leiga, uma ou duas palavras (design system: SymptomChip).
 */

type QuestionId = 'onset' | 'intensity' | 'age' | 'pregnant';

type Symptom = {
  id: string;
  label: string;
  /** Perguntas complementares que este sintoma ativa, além das perguntas base. */
  questions: QuestionId[];
};

/** Perguntas feitas em toda triagem, independentemente dos sintomas. */
const BASE_QUESTIONS: QuestionId[] = ['onset', 'age', 'pregnant'];

const SYMPTOMS = [
  { id: 'pain', label: 'Dor', questions: ['intensity'] },
  { id: 'fever', label: 'Febre', questions: [] },
  { id: 'bleeding', label: 'Sangramento', questions: [] },
  { id: 'shortness_of_breath', label: 'Falta de ar', questions: [] },
  { id: 'chest_pain', label: 'Dor no peito', questions: ['intensity'] },
  { id: 'dizziness', label: 'Tontura', questions: [] },
  { id: 'vomiting', label: 'Vômito', questions: [] },
  { id: 'cough', label: 'Tosse', questions: [] },
  { id: 'fainting', label: 'Desmaio', questions: [] },
  { id: 'skin_spots', label: 'Manchas na pele', questions: [] },
  { id: 'diarrhea', label: 'Diarreia', questions: [] },
  { id: 'injury', label: 'Machucado', questions: ['intensity'] },
] as const satisfies Symptom[];

type SymptomId = (typeof SYMPTOMS)[number]['id'];

const SYMPTOM_IDS = SYMPTOMS.map((symptom) => symptom.id) as [SymptomId, ...SymptomId[]];

function get_symptom_labels(ids: readonly string[]): string[] {
  return SYMPTOMS.filter((symptom) => ids.includes(symptom.id)).map((symptom) => symptom.label);
}

export type { QuestionId, Symptom, SymptomId };
export { BASE_QUESTIONS, get_symptom_labels, SYMPTOM_IDS, SYMPTOMS };
