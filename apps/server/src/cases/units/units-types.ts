type UnitType = 'ubs' | 'upa' | 'emergency_room' | 'hospital' | 'clinic' | 'telemedicine';
type UnitNetwork = 'public' | 'private';
type UnitOccupancy = 'low' | 'medium' | 'high';

type Unit = {
  id: string;
  name: string;
  type: UnitType;
  network: UnitNetwork;
  address: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  occupancy: UnitOccupancy;
  opening_hours: string;
  phone: string | null;
};

const UNIT_COLUMNS = [
  'id',
  'name',
  'type',
  'network',
  'address',
  'neighborhood',
  'lat',
  'lng',
  'occupancy',
  'opening_hours',
  'phone',
] as const;

export type { Unit, UnitNetwork, UnitOccupancy, UnitType };
export { UNIT_COLUMNS };
