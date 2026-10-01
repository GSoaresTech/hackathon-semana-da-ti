import type { Metadata } from 'next';

import { ResultView } from './result-view';

export const metadata: Metadata = { title: 'Resultado' };

export default function ResultPage() {
  return <ResultView />;
}
