import type { Metadata } from 'next';

import { UnitOccupancy } from './unit-occupancy';

export const metadata: Metadata = { title: 'Lotação da unidade' };

export default function UnitPage() {
  return <UnitOccupancy />;
}
