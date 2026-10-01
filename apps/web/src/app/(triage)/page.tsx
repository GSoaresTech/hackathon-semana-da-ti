import type { Metadata } from 'next';

import { StartForm } from './start-form';

export const metadata: Metadata = { title: 'Início' };

export default function StartPage() {
  return <StartForm />;
}
