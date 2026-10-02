import type { Metadata } from 'next';

import { UnitHistory } from './unit-history';

export const metadata: Metadata = { title: 'Histórico do dia' };

export default function UnitHistoryPage() {
  return <UnitHistory />;
}
