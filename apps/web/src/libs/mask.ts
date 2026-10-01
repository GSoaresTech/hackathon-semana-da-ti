import type { MaskitoOptions } from '@maskito/core';

/**
 * Máscaras de input (Maskito).
 *
 * Uso no formulário — repare no `onInput`, não `onChange`: o Maskito altera o
 * valor do DOM diretamente, e o React Hook Form só enxerga a mudança pelo
 * evento `input`.
 *
 *   const cpfMaskRef = useMaskito({ options: cpfMaskOptions });
 *   <Input {...field} ref={cpfMaskRef} onInput={field.onChange} maxLength={14} />
 *
 * No schema Zod, remova a máscara antes de enviar:
 *   .transform((value) => value.replace(/\D/g, ''))
 */

const digit = /\d/;

export const cpfMaskOptions: MaskitoOptions = {
  mask: [
    ...Array(3).fill(digit),
    '.',
    ...Array(3).fill(digit),
    '.',
    ...Array(3).fill(digit),
    '-',
    digit,
    digit,
  ],
};

export const cnpjMaskOptions: MaskitoOptions = {
  mask: [
    digit,
    digit,
    '.',
    ...Array(3).fill(digit),
    '.',
    ...Array(3).fill(digit),
    '/',
    ...Array(4).fill(digit),
    '-',
    digit,
    digit,
  ],
};

export const phoneMaskOptions: MaskitoOptions = {
  mask: ['(', digit, digit, ')', ' ', ...Array(5).fill(digit), '-', ...Array(4).fill(digit)],
};

export const cepMaskOptions: MaskitoOptions = {
  mask: [...Array(5).fill(digit), '-', ...Array(3).fill(digit)],
};

export const dateMaskOptions: MaskitoOptions = {
  mask: [digit, digit, '/', digit, digit, '/', ...Array(4).fill(digit)],
};

export const numberMaskOptions: MaskitoOptions = {
  mask: /^\d+$/,
};
