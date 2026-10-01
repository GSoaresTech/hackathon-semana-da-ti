'use client';

import { useQuery } from '@tanstack/react-query';
import { toPng } from 'html-to-image';
import { DownloadIcon, LoaderIcon, Share2Icon } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Screen,
  ScreenContent,
  ScreenFooter,
  ScreenHeader,
  ScreenTitle,
} from '~/components/screen';
import { TriageCard } from '~/components/triage-card';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { QUERIES } from '~/libs/queries';
import type { CardSummary } from '~/services/cards';
import { createCard } from '~/services/cards';
import { listSymptoms } from '~/services/symptoms';

import { useTriage } from '../triage-store';
import { useTriageGuard } from '../use-triage-guard';

/**
 * Tela 07 · Cartão de triagem (3 de 3): resumo do caso com QR code para a
 * recepção. O resumo vai DENTRO do token assinado — nada de saúde é salvo em
 * servidor.
 */
const CardView: React.FC = () => {
  const ready = useTriageGuard((state) => state.result !== null);
  const result = useTriage((state) => state.result);
  const symptoms = useTriage((state) => state.symptoms);
  const description = useTriage((state) => state.description);
  const answers = useTriage((state) => state.answers);
  const destination = useTriage((state) => state.destination);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data: catalog } = useQuery({
    queryKey: [QUERIES.LIST_SYMPTOMS],
    queryFn: listSymptoms,
  });

  const summary: CardSummary | null =
    result && catalog
      ? {
          level: result.level,
          symptoms: catalog.symptoms
            .filter((symptom) => symptoms.includes(symptom.id))
            .map((symptom) => symptom.label),
          description: description.trim() || null,
          onset: answers.onset ?? null,
          intensity: answers.intensity ?? null,
          age: answers.age ?? null,
          pregnant: answers.pregnant ?? null,
          warningSigns: result.warningSigns,
          destination,
        }
      : null;

  // POST idempotente para o fluxo: o mesmo resumo reaproveita o cartão em
  // cache em vez de gerar outro token a cada visita à tela.
  const { data: card, isError } = useQuery({
    queryKey: [QUERIES.CREATE_CARD, summary],
    queryFn: () => createCard(summary as CardSummary),
    enabled: ready && summary !== null,
    staleTime: Number.POSITIVE_INFINITY,
    retry: 1,
  });

  async function renderImage(): Promise<File | null> {
    if (!cardRef.current || !card) return null;

    const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
    const blob = await (await fetch(dataUrl)).blob();

    return new File([blob], `cartao-triagem-${card.code.replace('#', '')}.png`, {
      type: 'image/png',
    });
  }

  function download(file: File) {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleSave() {
    if (isExporting) return;
    setIsExporting(true);

    renderImage()
      .then((file) => file && download(file))
      .catch(() => toast.error('Não foi possível salvar a imagem'))
      .finally(() => setIsExporting(false));
  }

  function handleShare() {
    if (isExporting) return;
    setIsExporting(true);

    renderImage()
      .then(async (file) => {
        if (!file) return;

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Cartão de triagem',
            text: 'Meu cartão de triagem do Triar para mostrar na recepção.',
          });
          return;
        }

        // Sem Web Share com arquivo (ex.: desktop): baixa a imagem.
        download(file);
      })
      .catch((error: unknown) => {
        // Fechar a folha de compartilhamento não é erro.
        if (error instanceof DOMException && error.name === 'AbortError') return;
        toast.error('Não foi possível compartilhar');
      })
      .finally(() => setIsExporting(false));
  }

  if (!ready || !result) return <Screen />;

  return (
    <Screen>
      <ScreenHeader backHref="/result" title="Cartão de triagem" emergency />

      <ScreenContent className="gap-4 pt-2">
        <ScreenTitle>Mostre na recepção</ScreenTitle>

        {isError && (
          <p className="rounded-md bg-surface px-4 py-6 text-center text-body text-ink-muted">
            Não foi possível gerar o cartão agora. Tente de novo em instantes.
          </p>
        )}

        {!isError && (!card || !summary) && <Skeleton className="h-[480px] rounded-lg" />}

        {card && summary && (
          <div ref={cardRef} className="bg-surface-subtle">
            <TriageCard card={card} summary={summary} />
          </div>
        )}

        <p className="text-center text-caption text-ink-muted">
          Seus dados ficam só neste QR code. Nada é salvo em servidor.
        </p>
      </ScreenContent>

      <ScreenFooter className="grid grid-cols-2">
        <Button variant="secondary" onClick={handleSave} disabled={!card || isExporting}>
          {isExporting ? (
            <LoaderIcon className="animate-spin" aria-hidden="true" />
          ) : (
            <DownloadIcon aria-hidden="true" />
          )}
          Salvar imagem
        </Button>
        <Button onClick={handleShare} disabled={!card || isExporting}>
          <Share2Icon aria-hidden="true" />
          Compartilhar
        </Button>
      </ScreenFooter>
    </Screen>
  );
};

export { CardView };
