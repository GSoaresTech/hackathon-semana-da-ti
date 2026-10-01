import { dayjs } from '~/libs/dayjs';

/**
 * Formatadores de exibição.
 *
 * Todos seguem o mesmo contrato: recebem um valor possivelmente ausente e um
 * `fallback`, e devolvem o valor original (ou o fallback) quando não sabem
 * formatar. Nunca lançam — são usados direto no JSX.
 *
 * Uso: `formatters.cpf(user.cpf)`, `formatters.date(user.createdAt, 'N/A')`.
 */

function digits(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;

  return value.replace(/\D/g, '');
}

function cpf(value?: string | null, fallback = '') {
  const raw = digits(value);
  if (!raw || raw.length !== 11) return value || fallback;

  return raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function cnpj(value?: string | null, fallback = '') {
  const raw = digits(value);
  if (!raw || raw.length !== 14) return value || fallback;

  return raw.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function phone(value?: string | null, fallback = '') {
  const raw = digits(value);
  if (!raw || (raw.length !== 10 && raw.length !== 11)) return value || fallback;

  return raw.length === 11
    ? raw.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    : raw.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

function cep(value?: string | null, fallback = '') {
  const raw = digits(value);
  if (!raw || raw.length !== 8) return value || fallback;

  return raw.replace(/(\d{5})(\d{3})/, '$1-$2');
}

function date(value?: string | Date | null, fallback = '') {
  const parsed = dayjs(value);
  if (!value || !parsed.isValid()) return fallback;

  return parsed.format('DD/MM/YYYY');
}

function dateTime(value?: string | Date | null, fallback = '') {
  const parsed = dayjs(value);
  if (!value || !parsed.isValid()) return fallback;

  return parsed.format('DD/MM/YYYY [às] HH:mm');
}

function dateDistance(value?: string | Date | null, fallback = '') {
  const parsed = dayjs(value);
  if (!value || !parsed.isValid()) return fallback;

  return parsed.fromNow();
}

/**
 * Datas "de calendário" (aniversário, admissão) vêm como `YYYY-MM-DD` e não têm
 * hora. Passar por Date deslocaria o dia conforme o fuso, então formatamos por
 * manipulação de string.
 */
function calendarDate(value?: string | null, fallback = '') {
  if (typeof value !== 'string' || !value) return fallback;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return fallback;

  const [, year, month, day] = match;

  return `${day}/${month}/${year}`;
}

function currency(value?: number | string | null, fallback = '') {
  const parsed = typeof value === 'string' ? Number(value) : value;
  if (typeof parsed !== 'number' || Number.isNaN(parsed)) return fallback;

  return parsed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function percentage(value?: number | null, fallback = '') {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;

  return `${(value * 100).toFixed(2).replace('.', ',')}%`;
}

function size(value?: number | null, fallback = '') {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let current = value;
  let index = 0;

  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }

  return `${current.toFixed(2)} ${units[index]}`;
}

function nullable<T>(value?: T, fallback = 'Não informado') {
  return value === null || value === undefined || value === '' ? fallback : String(value);
}

function boolean(value?: boolean | null) {
  return value ? 'Sim' : 'Não';
}

const formatters = {
  boolean,
  calendarDate,
  cep,
  cnpj,
  cpf,
  currency,
  date,
  dateDistance,
  dateTime,
  nullable,
  percentage,
  phone,
  size,
};

export { formatters };
