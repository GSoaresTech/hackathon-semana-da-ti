import type { Metadata } from 'next';

import { UnitPreTriages } from './unit-pre-triages';

export const metadata: Metadata = { title: 'Pré-triagens' };

export default function UnitPreTriagesPage() {
  return <UnitPreTriages />;
}
