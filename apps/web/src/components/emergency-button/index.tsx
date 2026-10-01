import { PhoneIcon } from 'lucide-react';

import { EMERGENCY_PHONE } from '~/libs/constants';
import { cn } from '~/libs/utils';

interface EmergencyButtonProps {
  /**
   * - `fixed`: "Emergência 192" flutuando no canto inferior direito, nas telas
   *   curtas. Único elemento com `shadow-float`.
   * - `compact`: "192" no cabeçalho, nas telas com rolagem.
   */
  variant?: 'fixed' | 'compact';
  className?: string;
}

/**
 * Botão de emergência presente em todas as telas: abre a discagem para o SAMU.
 * Na vertente privada continua "192" — emergência é sempre SAMU. Não anima,
 * não pisca.
 */
const EmergencyButton: React.FC<EmergencyButtonProps> = ({ variant = 'fixed', className }) => {
  return (
    <a
      href={`tel:${EMERGENCY_PHONE}`}
      aria-label={`Ligar ${EMERGENCY_PHONE}, emergência do SAMU`}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-pill bg-urg-red text-label text-on-urg-red transition-colors hover:brightness-95',
        variant === 'fixed' && 'min-h-12 px-5 shadow-float',
        variant === 'compact' && 'min-h-10 px-4',
        className,
      )}
    >
      <PhoneIcon className="size-5" aria-hidden="true" />
      {variant === 'fixed' ? `Emergência ${EMERGENCY_PHONE}` : EMERGENCY_PHONE}
    </a>
  );
};

export { EmergencyButton };
