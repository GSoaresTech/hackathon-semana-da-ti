'use client';

import Link from 'next/link';

import { Disclaimer } from '~/components/disclaimer';
import { ResultCard } from '~/components/result-card';
import { Screen, ScreenContent, ScreenFooter, ScreenHeader } from '~/components/screen';
import { Button } from '~/components/ui/button';

import { useTriage } from '../triage-store';
import { useTriageGuard } from '../use-triage-guard';

/**
 * Tela 05 · Resultado: nível de Manchester (cor + número + palavra),
 * explicação simples, orientações e os sinais que fazem o caso subir de nível.
 */
const ResultView: React.FC = () => {
  const ready = useTriageGuard((state) => state.result !== null);
  const result = useTriage((state) => state.result);

  if (!ready || !result) return <Screen />;

  return (
    <Screen>
      <ScreenHeader backHref="/questions" title="Resultado" emergency />

      <ScreenContent className="gap-4 pt-2">
        <ResultCard
          level={result.level}
          title={result.title}
          explanation={result.explanation}
          instructions={result.instructions}
          warningSigns={result.warningSigns}
        />
        <Disclaimer variant="short" />
      </ScreenContent>

      <ScreenFooter>
        <Button asChild block>
          <Link href="/units">Ver unidades indicadas</Link>
        </Button>
        <Button asChild block variant="secondary">
          <Link href="/card">Gerar cartão de triagem</Link>
        </Button>
      </ScreenFooter>
    </Screen>
  );
};

export { ResultView };
