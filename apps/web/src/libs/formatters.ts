import { dayjs } from '~/libs/dayjs';

/**
 * Formatadores de exibição.
 *
 * Todos seguem o mesmo contrato: recebem um valor possivelmente ausente e um
 * `fallback`, e devolvem o valor original (ou o fallback) quando não sabem
 * formatar. Nunca lançam — são usados direto no JSX.
 *
 * Uso: `formatters.phone(unit.phone)`, `formatters.time(card.issuedAt)`.
 */

function digits(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;

  return value.replace(/\D/g, '');
}

function phone(value?: string | null, fallback = '') {
  const raw = digits(value);
  if (!raw) return value || fallback;

  // 0800 e similares: 0800 722 0005
  if (raw.length === 11 && raw.startsWith('0')) {
    return raw.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
  }

  if (raw.length !== 10 && raw.length !== 11) return value || fallback;

  return raw.length === 11
    ? raw.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    : raw.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

/** `14:32` */
function time(value?: string | Date | null, fallback = '') {
  const parsed = dayjs(value);
  if (!value || !parsed.isValid()) return fallback;

  return parsed.format('HH:mm');
}

function dateTime(value?: string | Date | null, fallback = '') {
  const parsed = dayjs(value);
  if (!value || !parsed.isValid()) return fallback;

  return parsed.format('DD/MM/YYYY [às] HH:mm');
}

/** `2,4 km` — abaixo de 1 km mostra em metros (`350 m`). */
function distance(km?: number | null, fallback = '') {
  if (km === null || km === undefined || Number.isNaN(km)) return fallback;

  if (km < 1) return `${Math.round((km * 1000) / 10) * 10} m`;

  return `${km.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
}

function nullable<T>(value?: T, fallback = 'Não informado') {
  return value === null || value === undefined || value === '' ? fallback : String(value);
}

const formatters = {
  dateTime,
  distance,
  nullable,
  phone,
  time,
};

export { formatters };
