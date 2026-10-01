import { InfoIcon } from 'lucide-react';

import { cn } from '~/libs/utils';

interface DisclaimerProps {
  /** `short` cabe no rodapé do Resultado; `full` é o aviso da tela Início. */
  variant?: 'full' | 'short';
  className?: string;
}

/**
 * Aviso fixo de que o app não substitui atendimento médico. Texto não editável.
 * Não é alerta de erro: fundo surface-tint, nunca vermelho.
 */
const Disclaimer: React.FC<DisclaimerProps> = ({ variant = 'full', className }) => {
  if (variant === 'short') {
    return (
      <p className={cn('text-center text-caption text-ink-muted', className)}>
        O Triar não substitui atendimento médico.
      </p>
    );
  }

  return (
    <aside
      className={cn(
        'flex gap-3 rounded-md bg-surface-tint px-4 py-3 text-body text-ink',
        className,
      )}
    >
      <InfoIcon className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden="true" />
      <p>
        <strong className="font-bold">O Triar não substitui atendimento médico.</strong> Ele orienta
        para onde ir. Em caso de dúvida, ligue 192.
      </p>
    </aside>
  );
};

export { Disclaimer };
