import { LEVEL_SOFT_BACKGROUND, UrgencyBadge } from '~/components/urgency-badge';
import type { UrgencyLevel } from '~/libs/constants';
import { cn } from '~/libs/utils';

interface ResultCardProps {
  level: UrgencyLevel;
  title: string;
  explanation: string;
  instructions: string[];
  warningSigns: string[];
  className?: string;
}

/**
 * Card principal da tela Resultado. Cabeçalho no fundo suave do nível com o
 * selo e a frase de ação em display; corpo com a explicação, "O que fazer
 * agora" e o bloco "Ligue 192 se aparecer" (sinais que sobem o nível).
 */
const ResultCard: React.FC<ResultCardProps> = ({
  level,
  title,
  explanation,
  instructions,
  warningSigns,
  className,
}) => {
  return (
    <article className={cn('overflow-hidden rounded-lg border bg-surface shadow-card', className)}>
      <header
        className={cn('flex flex-col items-start gap-3 px-4 py-4', LEVEL_SOFT_BACKGROUND[level])}
      >
        <UrgencyBadge level={level} />
        <h1 className="text-display text-ink">{title}</h1>
      </header>

      <div className="flex flex-col gap-4 px-4 py-4">
        <p className="text-body-lg text-ink">{explanation}</p>

        {instructions.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-label text-ink">O que fazer agora</h2>
            <ul className="list-disc space-y-1 pl-5 text-body text-ink">
              {instructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ul>
          </section>
        )}

        {warningSigns.length > 0 && (
          <section className="flex flex-col gap-2 rounded-md bg-urg-red-soft px-4 py-3">
            <h2 className="text-label text-urg-red">Ligue 192 se aparecer</h2>
            <ul className="list-disc space-y-1 pl-5 text-body text-ink">
              {warningSigns.map((sign) => (
                <li key={sign}>{sign}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
};

export { ResultCard };
