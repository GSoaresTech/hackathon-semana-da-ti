import { URGENCY_LABELS, type UrgencyLevel } from '~/libs/constants';
import { cn } from '~/libs/utils';

/*
 * Selo do nível de urgência (tr-urg--1 a --5). Sempre número + palavra,
 * nunca só a cor — vermelho e verde têm brilho parecido (daltonismo).
 */
const LEVEL_STYLES: Record<UrgencyLevel, { badge: string; number: string }> = {
  1: { badge: 'bg-urg-red text-on-urg-red', number: 'bg-on-urg-red/20' },
  2: { badge: 'bg-urg-orange text-on-urg-orange', number: 'bg-on-urg-orange/10' },
  3: { badge: 'bg-urg-yellow text-on-urg-yellow', number: 'bg-on-urg-yellow/10' },
  4: { badge: 'bg-urg-green text-on-urg-green', number: 'bg-on-urg-green/20' },
  5: { badge: 'bg-urg-blue text-on-urg-blue', number: 'bg-on-urg-blue/10' },
};

interface UrgencyBadgeProps {
  level: UrgencyLevel;
  className?: string;
}

const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ level, className }) => {
  const styles = LEVEL_STYLES[level];

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-pill py-1 pr-3 pl-1 text-label',
        styles.badge,
        className,
      )}
    >
      <span
        className={cn(
          'flex size-7 items-center justify-center rounded-pill font-extrabold',
          styles.number,
        )}
        aria-hidden="true"
      >
        {level}
      </span>
      <span>
        <span className="sr-only">Nível {level}: </span>
        {URGENCY_LABELS[level]}
      </span>
    </span>
  );
};

/** Fundo suave do nível, usado no cabeçalho do ResultCard (tr-result--1 … --5). */
const LEVEL_SOFT_BACKGROUND: Record<UrgencyLevel, string> = {
  1: 'bg-urg-red-soft',
  2: 'bg-urg-orange-soft',
  3: 'bg-urg-yellow-soft',
  4: 'bg-urg-green-soft',
  5: 'bg-urg-blue-soft',
};

export { LEVEL_SOFT_BACKGROUND, UrgencyBadge };
