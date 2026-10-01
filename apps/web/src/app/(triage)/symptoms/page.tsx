import type { Metadata } from 'next';

import { SymptomsForm } from './symptoms-form';

export const metadata: Metadata = { title: 'Sintomas' };

export default function SymptomsPage() {
  return <SymptomsForm />;
}
