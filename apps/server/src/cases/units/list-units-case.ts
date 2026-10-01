import type { Unit, UnitNetwork, UnitOccupancy, UnitType } from '~/cases/units/units-types';
import { UNIT_COLUMNS } from '~/cases/units/units-types';
import { connection } from '~/libs/connection';
import { type Coordinates, distance_km, travel_minutes } from '~/libs/geo';

/*
 * Mesmo motor, duas redes: o nível de urgência decide o TIPO de unidade
 * indicado em cada rede. Depois ordena por lotação (mais tranquila primeiro)
 * e, empatando, pela distância.
 */
const UNIT_TYPES_BY_LEVEL: Record<UnitNetwork, Record<number, UnitType[]>> = {
  public: {
    1: ['upa', 'hospital'],
    2: ['upa', 'hospital'],
    3: ['upa'],
    4: ['ubs'],
    5: ['ubs'],
  },
  private: {
    1: ['emergency_room', 'hospital'],
    2: ['emergency_room', 'hospital'],
    3: ['emergency_room', 'telemedicine'],
    4: ['telemedicine', 'clinic'],
    5: ['telemedicine', 'clinic'],
  },
};

const OCCUPANCY_RANK: Record<UnitOccupancy, number> = { low: 0, medium: 1, high: 2 };

/** Artigo do aviso: "A UPA…", "O pronto-socorro…". */
const ARTICLE_BY_TYPE: Record<UnitType, string> = {
  ubs: 'A',
  upa: 'A',
  clinic: 'A',
  telemedicine: 'A',
  emergency_room: 'O',
  hospital: 'O',
};

type ListUnitsCaseInput = {
  level: number;
  network: UnitNetwork;
  coordinates?: Coordinates | null;
};

type ListedUnit = Unit & {
  distance_km: number | null;
  travel_minutes: number | null;
};

type ListUnitsCaseOutput = {
  units: ListedUnit[];
  notice: string | null;
};

async function list_units_case({
  level,
  network,
  coordinates,
}: ListUnitsCaseInput): Promise<ListUnitsCaseOutput> {
  const types = UNIT_TYPES_BY_LEVEL[network][level];

  const rows: Unit[] = await connection('units')
    .select(UNIT_COLUMNS)
    .where({ network })
    .whereIn('type', types);

  const units = rows.map((unit) => with_distance(unit, coordinates));

  // Teleconsulta não tem distância: entra como se estivesse "aqui".
  units.sort(
    (a, b) =>
      OCCUPANCY_RANK[a.occupancy] - OCCUPANCY_RANK[b.occupancy] ||
      (a.distance_km ?? 0) - (b.distance_km ?? 0),
  );

  return { units, notice: build_notice(units, level) };
}

function with_distance(unit: Unit, coordinates?: Coordinates | null): ListedUnit {
  if (!coordinates || unit.lat === null || unit.lng === null) {
    return { ...unit, distance_km: null, travel_minutes: null };
  }

  const km = distance_km(coordinates, { lat: unit.lat, lng: unit.lng });

  return { ...unit, distance_km: Math.round(km * 10) / 10, travel_minutes: travel_minutes(km) };
}

function build_notice(units: ListedUnit[], level: number): string | null {
  const physical = units.filter((unit) => unit.distance_km !== null);
  const nearest = physical.reduce<ListedUnit | null>(
    (best, unit) =>
      best === null || (unit.distance_km ?? 0) < (best.distance_km ?? 0) ? unit : best,
    null,
  );

  if (nearest && nearest.occupancy === 'high' && units[0]?.id !== nearest.id) {
    return `${ARTICLE_BY_TYPE[nearest.type]} ${nearest.name} lotou. Mostramos primeiro uma opção mais tranquila.`;
  }

  if (level >= 3 && units.some((unit) => unit.type === 'telemedicine')) {
    return `Teleconsulta também atende o nível ${level} sem sair de casa.`;
  }

  return null;
}

export type { ListedUnit, ListUnitsCaseInput, ListUnitsCaseOutput };
export { list_units_case };
