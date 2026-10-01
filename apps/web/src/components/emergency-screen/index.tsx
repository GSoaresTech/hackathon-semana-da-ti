import { PhoneIcon } from 'lucide-react';
import Link from 'next/link';

import { EMERGENCY_PHONE } from '~/libs/constants';
import { cn } from '~/libs/utils';

interface EmergencyScreenProps {
  reason: string;
  instructions: string[];
  className?: string;
}

/**
 * Tela cheia vermelha, acionada quando as regras detectam um sinal grave —
 * antes de qualquer chamada à IA. Fundo urg-vermelho, texto on-urg-vermelho,
 * botão "Ligar 192" branco com texto vermelho. Nada pisca.
 */
const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ reason, instructions, className }) => {
  return (
    <main
      className={cn(
        'focus-on-dark mx-auto flex min-h-dvh w-full max-w-[440px] flex-col gap-6 bg-urg-red px-4 pt-8 pb-8 text-on-urg-red',
        className,
      )}
    >
      <span className="self-start rounded-pill bg-on-urg-red/20 px-3 py-1 text-caption tracking-wide uppercase">
        Sinal grave detectado
      </span>

      <div className="flex flex-col gap-3">
        <h1 className="text-display">Ligue {EMERGENCY_PHONE} agora</h1>
        <p className="text-body-lg">{reason} Não espere: o SAMU orienta e envia ajuda.</p>
      </div>

      <a
        href={`tel:${EMERGENCY_PHONE}`}
        className="flex min-h-16 items-center justify-center gap-3 rounded-pill bg-on-urg-red text-heading text-urg-red transition-colors hover:bg-urg-red-soft"
      >
        <PhoneIcon className="size-6" aria-hidden="true" />
        Ligar {EMERGENCY_PHONE}
      </a>

      {instructions.length > 0 && (
        <section className="flex flex-col gap-2 rounded-lg bg-ink/20 px-4 py-4">
          <h2 className="text-label">Enquanto a ajuda chega</h2>
          <ul className="list-disc space-y-1 pl-5 text-body">
            {instructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/units?level=1"
        className="self-center rounded-sm px-2 py-3 text-center text-label underline underline-offset-4"
      >
        Já liguei · ver emergência mais próxima
      </Link>
    </main>
  );
};

export { EmergencyScreen };
