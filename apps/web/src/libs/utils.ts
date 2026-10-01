import { type ClassValue, clsx } from 'clsx';
import snakeCase from 'lodash/snakeCase';
import { twMerge } from 'tailwind-merge';

/** Concatena classes do Tailwind resolvendo conflitos (`p-2 p-4` → `p-4`). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getNameInitials(name: string = '') {
  return name
    .split(' ')
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function toCamelCase(key: string): string {
  return key.replace(/[-_](.)/g, (_, char: string) => char.toUpperCase());
}

/**
 * Só converte objetos literais. Date, File, Blob, FormData e instâncias de
 * classe passam intactos — converter esses tipos destruiria o valor.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function convertKeys(value: unknown, transform: (key: string) => string, deep: boolean): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => convertKeys(item, transform, deep));
  }

  if (!isPlainObject(value)) return value;

  return Object.entries(value).reduce<Record<string, unknown>>((acc, [key, item]) => {
    acc[transform(key)] = deep ? convertKeys(item, transform, deep) : item;
    return acc;
  }, {});
}

/** `{ total_pages: 3 }` → `{ totalPages: 3 }`. Usado nas respostas da API. */
export function jsonToCamelCase<T = unknown>(json: unknown, options?: { deep?: boolean }): T {
  return convertKeys(json, toCamelCase, options?.deep ?? true) as T;
}

/** `{ totalPages: 3 }` → `{ total_pages: 3 }`. Usado nos envios para a API. */
export function jsonToSnakeCase<T = unknown>(json: unknown, options?: { deep?: boolean }): T {
  return convertKeys(json, snakeCase, options?.deep ?? true) as T;
}

export function isValidCPF(value: string): boolean {
  const cpf = value.replace(/\D/g, '');

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digit = (length: number) => {
    const sum = cpf
      .slice(0, length)
      .split('')
      .reduce((acc, char, index) => acc + Number(char) * (length + 1 - index), 0);
    const rest = (sum * 10) % 11;

    return rest === 10 ? 0 : rest;
  };

  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

export function isValidCNPJ(value: string): boolean {
  const cnpj = value.replace(/\D/g, '');

  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const digit = (weights: number[]) => {
    const sum = weights.reduce((acc, weight, index) => acc + Number(cnpj[index]) * weight, 0);
    const rest = sum % 11;

    return rest < 2 ? 0 : 11 - rest;
  };

  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeights = [6, ...firstWeights];

  return digit(firstWeights) === Number(cnpj[12]) && digit(secondWeights) === Number(cnpj[13]);
}
