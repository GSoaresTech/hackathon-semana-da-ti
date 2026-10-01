import { cn } from '~/libs/utils';

interface BrandProps {
  className?: string;
}

/**
 * Marca provisória: "Triar" em Nunito 800 na cor ink, com a cruz de pílulas
 * em brand-600. Ainda sem logo oficial.
 */
const Brand: React.FC<BrandProps> = ({ className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-heading font-extrabold text-ink',
        className,
      )}
    >
      <BrandMark className="size-7" />
      Triar
    </span>
  );
};

const BrandMark: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" className={className}>
      <rect width="28" height="28" rx="7" className="fill-brand-600" />
      <rect x="11" y="5.5" width="6" height="17" rx="3" className="fill-on-brand" />
      <rect x="5.5" y="11" width="17" height="6" rx="3" className="fill-on-brand" />
    </svg>
  );
};

export { Brand, BrandMark };
