'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';

import type { ListedUnit } from '~/services/units';

interface UnitsMapLeafletProps {
  origin: { lat: number; lng: number };
  units: ListedUnit[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/*
 * Pinos em SVG com as cores dos tokens (`var(--color-…)` funciona aqui porque
 * o HTML do divIcon é inserido na própria página). Rede pública em brand-600,
 * privada em ink; o ponto da pessoa em brand-600 com halo brand-400.
 */
function pinIcon(network: ListedUnit['network'], selected: boolean): L.DivIcon {
  const color = network === 'public' ? 'var(--color-brand-600)' : 'var(--color-network-private)';
  const size = selected ? 40 : 30;

  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="${color}" stroke="white" stroke-width="1.5" d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"/>
      <circle cx="12" cy="10" r="2.6" fill="white"/>
    </svg>`,
  });
}

const originIcon = L.divIcon({
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  html: `<span style="display:block;width:24px;height:24px;border-radius:999px;background:color-mix(in srgb, var(--color-brand-400) 45%, transparent);padding:5px;box-sizing:border-box">
    <span style="display:block;width:100%;height:100%;border-radius:999px;background:var(--color-brand-600);border:2px solid white;box-sizing:border-box"></span>
  </span>`,
});

const UnitsMapLeaflet: React.FC<UnitsMapLeafletProps> = ({
  origin,
  units,
  selectedId,
  onSelect,
}) => {
  const located = useMemo(
    () =>
      units.filter(
        (unit): unit is ListedUnit & { lat: number; lng: number } =>
          unit.lat !== null && unit.lng !== null,
      ),
    [units],
  );

  return (
    <MapContainer
      center={[origin.lat, origin.lng]}
      zoom={14}
      zoomControl={false}
      attributionControl
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[origin.lat, origin.lng]} icon={originIcon} title="Você está aqui" />

      {located.map((unit) => (
        <Marker
          key={unit.id}
          position={[unit.lat, unit.lng]}
          icon={pinIcon(unit.network, unit.id === selectedId)}
          title={unit.name}
          zIndexOffset={unit.id === selectedId ? 1000 : 0}
          eventHandlers={{ click: () => onSelect(unit.id) }}
        />
      ))}

      <FitBounds origin={origin} units={located} selectedId={selectedId} />
    </MapContainer>
  );
};

/** Enquadra a pessoa e as unidades; ao selecionar, centraliza na escolhida. */
const FitBounds: React.FC<{
  origin: { lat: number; lng: number };
  units: { id: string; lat: number; lng: number }[];
  selectedId: string | null;
}> = ({ origin, units, selectedId }) => {
  const map = useMap();

  // Sincroniza o Leaflet (sistema externo) com as props — não mexe em estado React.
  useEffect(() => {
    const selected = units.find((unit) => unit.id === selectedId);

    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 14), { duration: 0.4 });
      return;
    }

    const bounds = L.latLngBounds([
      [origin.lat, origin.lng],
      ...units.map((unit): [number, number] => [unit.lat, unit.lng]),
    ]);
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
  }, [map, origin, units, selectedId]);

  return null;
};

export { UnitsMapLeaflet };
