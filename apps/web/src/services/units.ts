import { api } from '~/libs/api';
import type { Network, Occupancy, UnitType, UrgencyLevel } from '~/libs/constants';

export type Unit = {
  id: string;
  name: string;
  type: UnitType;
  network: Network;
  address: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  occupancy: Occupancy;
  openingHours: string;
  phone: string | null;
};

export type ListedUnit = Unit & {
  distanceKm: number | null;
  travelMinutes: number | null;
};

type ListUnitsInput = {
  level: UrgencyLevel;
  network: Network;
  lat?: number;
  lng?: number;
};

type ListUnitsOutput = {
  units: ListedUnit[];
  notice: string | null;
};

export async function listUnits(input: ListUnitsInput): Promise<ListUnitsOutput> {
  const { data } = await api.get('/units', { params: input });

  return data;
}

type UpdateOccupancyInput = {
  unitId: string;
  occupancy: Occupancy;
};

type UpdateOccupancyOutput = {
  unit: Unit;
};

export async function updateOccupancy({
  unitId,
  occupancy,
}: UpdateOccupancyInput): Promise<UpdateOccupancyOutput> {
  const { data } = await api.patch(`/units/${unitId}/occupancy`, { occupancy });

  return data;
}
