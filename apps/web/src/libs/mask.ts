import type { MaskitoOptions } from '@maskito/core';

/**
 * Máscaras de input (Maskito).
 *
 * Uso no formulário — repare no `onInput`, não `onChange`: o Maskito altera o
 * valor do DOM diretamente, e o React Hook Form só enxerga a mudança pelo
 * evento `input`.
 *
 *   const phoneMaskRef = useMaskito({ options: phoneMaskOptions });
 *   <Input {...field} ref={phoneMaskRef} onInput={field.onChange} inputMode="tel" />
 *
 * No schema Zod, remova a máscara antes de enviar:
 *   .transform((value) => value.replace(/\D/g, ''))
 */

const digit = /\d/;

/** Celular com DDD: (81) 99999-9999 */
export const phoneMaskOptions: MaskitoOptions = {
  mask: ['(', digit, digit, ')', ' ', ...Array(5).fill(digit), '-', ...Array(4).fill(digit)],
};
