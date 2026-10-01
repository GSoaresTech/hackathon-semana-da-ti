import type { Metadata } from 'next';

import { QuestionsForm } from './questions-form';

export const metadata: Metadata = { title: 'Perguntas' };

export default function QuestionsPage() {
  return <QuestionsForm />;
}
