import { api } from '~/libs/api';

export type QuestionId = 'onset' | 'intensity' | 'age' | 'pregnant';

export type Symptom = {
  id: string;
  label: string;
  questions: QuestionId[];
};

type ListSymptomsOutput = {
  symptoms: Symptom[];
  baseQuestions: QuestionId[];
};

export async function listSymptoms(): Promise<ListSymptomsOutput> {
  const { data } = await api.get('/symptoms');

  return data;
}
