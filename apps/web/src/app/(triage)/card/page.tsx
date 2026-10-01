import type { Metadata } from 'next';

import { CardView } from './card-view';

export const metadata: Metadata = { title: 'Cartão de triagem' };

export default function CardPage() {
  return <CardView />;
}
