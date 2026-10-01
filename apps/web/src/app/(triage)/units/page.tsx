import type { Metadata } from 'next';

import { UnitsView } from './units-view';

export const metadata: Metadata = { title: 'Unidades indicadas' };

export default async function UnitsPage({ searchParams }: PageProps<'/units'>) {
  // `?level=1` vem da tela de Emergência ("ver emergência mais próxima").
  const { level } = await searchParams;

  return <UnitsView emergencyLevel={level === '1'} />;
}
