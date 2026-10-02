'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { LoaderIcon, QrCodeIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { getCard } from '~/services/cards';

import { useUnitCards } from './unit-cards-store';

/** Aceita o token puro (o que vai no QR) ou um link que termine em `/unit/cards/<token>`. */
function extractToken(value: string): string {
  const match = value.match(/\/unit\/cards\/([^/?#\s]+)/);

  return match ? match[1] : value;
}

const cardSchema = z.object({
  link: z.string().trim().min(1, { error: 'Cole o link do cartão' }).transform(extractToken),
});

type CardValues = z.input<typeof cardSchema>;

/**
 * Leitura do cartão por colagem: o conteúdo do QR (ou o link) vira o resumo
 * da pré-triagem, que entra na lista deste navegador.
 */
const UnitCardForm: React.FC = () => {
  const addCard = useUnitCards((state) => state.addCard);

  const form = useForm<CardValues, unknown, z.output<typeof cardSchema>>({
    resolver: zodResolver(cardSchema),
    defaultValues: { link: '' },
  });

  const { mutateAsync, isPending } = useMutation({ mutationFn: getCard });

  function onSubmit(values: z.output<typeof cardSchema>) {
    if (isPending) return;

    toast.promise(mutateAsync(values.link), {
      loading: 'Lendo cartão…',
      success: ({ code, card }) => {
        form.reset();

        return addCard(code, card)
          ? `Cartão ${code} adicionado`
          : `O cartão ${code} já está na lista`;
      },
      error: (error: Error) => error.message,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-3 sm:flex-row sm:items-start md:w-auto"
        noValidate
      >
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem className="flex-1 md:w-80 md:flex-none">
              <FormLabel className="sr-only">Link do cartão</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" placeholder="Cole o link do cartão" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <LoaderIcon className="animate-spin" aria-hidden="true" />
          ) : (
            <QrCodeIcon aria-hidden="true" />
          )}
          Ler cartão
        </Button>
      </form>
    </Form>
  );
};

export { UnitCardForm };
