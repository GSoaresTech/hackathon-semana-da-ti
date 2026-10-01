import type { Metadata } from 'next';

import { EmergencyView } from './emergency-view';

export const metadata: Metadata = { title: 'Ligue 192 agora' };

export default function EmergencyPage() {
  return <EmergencyView />;
}
