import {
  BASE_QUESTIONS,
  type QuestionId,
  SYMPTOMS,
  type Symptom,
} from '~/cases/symptoms/symptoms-catalog';

type ListSymptomsCaseOutput = {
  symptoms: Symptom[];
  base_questions: QuestionId[];
};

async function list_symptoms_case(): Promise<ListSymptomsCaseOutput> {
  return {
    symptoms: SYMPTOMS.map((symptom) => ({ ...symptom, questions: [...symptom.questions] })),
    base_questions: BASE_QUESTIONS,
  };
}

export { list_symptoms_case };
