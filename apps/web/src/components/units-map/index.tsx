'use client';

import dynamic from 'next/dynamic';

import { Skeleton } from '~/components/ui/skeleton';

/*
 * Mapa da tela Unidades (Leaflet + OpenStreetMap). O Leaflet mexe direto no
 * `window`, então só carrega no cliente — no servidor sai o placeholder.
 */
const UnitsMap = dynamic(
  () => import('~/components/units-map/units-map-leaflet').then((module) => module.UnitsMapLeaflet),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-none" />,
  },
);

export { UnitsMap };
