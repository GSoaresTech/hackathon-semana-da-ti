import { type ClassValue, clsx } from 'clsx';
import snakeCase from 'lodash/snakeCase';
import { extendTailwindMerge } from 'tailwind-merge';

/*
 * Os tamanhos de texto do design system (`--text-*` no globals.css) são nomes
 * próprios. Sem registrá-los, o tailwind-merge acha que `text-title` é cor e
 * o descarta quando vem um `text-ink` depois.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['display', 'title', 'heading', 'body-lg', 'body', 'label', 'caption'] },
      ],
    },
  },
});

/** Concatena classes do Tailwind resolvendo conflitos (`p-2 p-4` → `p-4`). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
