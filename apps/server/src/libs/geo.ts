/*
 * Cálculos geográficos simples para a lista de unidades.
 * A estimativa de tempo assume trânsito urbano médio (sem API de rotas).
 */

const EARTH_RADIUS_KM = 6371;
const AVERAGE_CITY_SPEED_KMH = 25;

type Coordinates = {
  lat: number;
  lng: number;
};

/** Distância em linha reta (haversine), em km. */
function distance_km(from: Coordinates, to: Coordinates): number {
  const to_radians = (degrees: number) => (degrees * Math.PI) / 180;

  const d_lat = to_radians(to.lat - from.lat);
  const d_lng = to_radians(to.lng - from.lng);

  const a =
    Math.sin(d_lat / 2) ** 2 +
    Math.cos(to_radians(from.lat)) * Math.cos(to_radians(to.lat)) * Math.sin(d_lng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Minutos de carro estimados para uma distância, no mínimo 1. */
function travel_minutes(km: number): number {
  return Math.max(1, Math.round((km / AVERAGE_CITY_SPEED_KMH) * 60));
}

export type { Coordinates };
export { distance_km, travel_minutes };
