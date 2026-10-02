import type { Metadata } from 'next';

import { OccupancyView } from './occupancy-view';

export const metadata: Metadata = { title: 'Lotação' };

export default function UnitOccupancyPage() {
  return <OccupancyView />;
}
