/**
 * Constantes de domínio do Triar.
 *
 * Os valores (`public`, `low`, `1`…) são os do contrato da API; os rótulos são
 * os textos de tela do design system. Cor nunca vem sozinha: todo nível leva
 * número + palavra e toda lotação leva ponto + palavra.
 */

export type UrgencyLevel = 1 | 2 | 3 | 4 | 5;
export type Network = 'public' | 'private';
export type Occupancy = 'low' | 'medium' | 'high';
export type UnitType = 'ubs' | 'upa' | 'emergency_room' | 'hospital' | 'clinic' | 'telemedicine';
export type Onset = 'hours' | '1-2-days' | '3-7-days' | 'over-1-week';
export type Pregnant = 'yes' | 'no' | 'not-applicable';

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  1: 'Emergência',
  2: 'Muito urgente',
  3: 'Urgente',
  4: 'Pouco urgente',
  5: 'Não urgente',
};

export const NETWORK_LABELS: Record<Network, string> = {
  public: 'SUS',
  private: 'Plano',
};

export const OCCUPANCY_LABELS: Record<Occupancy, string> = {
  low: 'Tranquila',
  medium: 'Moderada',
  high: 'Lotada',
};

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  ubs: 'UBS',
  upa: 'UPA',
  emergency_room: 'Pronto-socorro',
  hospital: 'Hospital',
  clinic: 'Clínica',
  telemedicine: 'Teleconsulta',
};

export const ONSET_OPTIONS: { value: Onset; label: string }[] = [
  { value: 'hours', label: 'Horas' },
  { value: '1-2-days', label: '1–2 dias' },
  { value: '3-7-days', label: '3–7 dias' },
  { value: 'over-1-week', label: '+1 semana' },
];

export const ONSET_LABELS: Record<Onset, string> = {
  hours: 'Há algumas horas',
  '1-2-days': 'Há 1–2 dias',
  '3-7-days': 'Há 3–7 dias',
  'over-1-week': 'Há mais de 1 semana',
};

export const PREGNANT_OPTIONS: { value: Pregnant; label: string }[] = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Não' },
  { value: 'not-applicable', label: 'Não se aplica' },
];

/** Ponto de partida quando a pessoa não permite a localização: centro de Caruaru-PE. */
export const DEFAULT_COORDS = { lat: -8.2838, lng: -35.9761 };

/** Emergência é sempre SAMU, inclusive na vertente privada. */
export const EMERGENCY_PHONE = '192';
