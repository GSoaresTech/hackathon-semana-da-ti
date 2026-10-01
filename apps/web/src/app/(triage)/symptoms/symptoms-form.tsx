'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { LoaderIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Screen,
  ScreenContent,
  ScreenDescription,
  ScreenFooter,
  ScreenHeader,
  ScreenTitle,
} from '~/components/screen';
import { SymptomChip, SymptomChipList } from '~/components/symptom-chip';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Skeleton } from '~/components/ui/skeleton';
import { Textarea } from '~/components/ui/textarea';
import { QUERIES } from '~/libs/queries';
import { listSymptoms } from '~/services/symptoms';
import { createTriage } from '~/services/triage';

import { useTriage, useTriageHydrated } from '../triage-store';

const DESCRIPTION_MAX_LENGTH = 500;
const SKELETON_CHIPS = ['w-20', 'w-24', 'w-32', 'w-28', 'w-32', 'w-24', 'w-20', 'w-24'];

/**
 * Tela 02 · Sintomas (1 de 3): chips pré-definidos e relato livre.
 *
 * O "Continuar" já passa pelas regras de sinal grave (POST /api/triage sem
 * respostas): se algo grave aparecer aqui, a pessoa vai direto para a tela de
 * Emergência, sem responder mais nada.
 */
const SymptomsForm: React.FC = () => {
  const router = useRouter();
  const hydrated = useTriageHydrated();
  const network = useTriage((state) => state.network);
  const symptoms = useTriage((state) => state.symptoms);
  const description = useTriage((state) => state.description);
  const toggleSymptom = useTriage((state) => state.toggleSymptom);
  const setDescription = useTriage((state) => state.setDescription);
  const setEmergency = useTriage((state) => state.setEmergency);

  const { data, isPending: isLoadingSymptoms } = useQuery({
    queryKey: [QUERIES.LIST_SYMPTOMS],
    queryFn: listSymptoms,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createTriage,
    onSuccess: (result) => {
      if (result.emergency) {
        setEmergency(result);
        router.push('/emergency');
        return;
      }

      router.push('/questions');
    },
    onError: (error) => toast.error(error.message),
  });

  const canContinue = hydrated && (symptoms.length > 0 || description.trim().length > 0);

  function handleContinue() {
    if (isPending || !canContinue) return;

    mutate({ network, symptoms, description: description.trim() || null });
  }

  return (
    <Screen>
      <ScreenHeader backHref="/" step={1} />

      <ScreenContent>
        <ScreenTitle>O que você está sentindo?</ScreenTitle>
        <ScreenDescription>Marque tudo o que se aplica.</ScreenDescription>

        <SymptomChipList aria-label="Sintomas">
          {isLoadingSymptoms || !hydrated
            ? SKELETON_CHIPS.map((width, index) => (
                <Skeleton key={`chip-${index + 1}`} className={`h-12 rounded-pill ${width}`} />
              ))
            : data?.symptoms.map((symptom) => (
                <SymptomChip
                  key={symptom.id}
                  label={symptom.label}
                  pressed={symptoms.includes(symptom.id)}
                  onPressedChange={() => toggleSymptom(symptom.id)}
                />
              ))}
        </SymptomChipList>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">
            Descreva com suas palavras{' '}
            <span className="font-normal text-ink-muted">(opcional)</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={DESCRIPTION_MAX_LENGTH}
            placeholder="Ex.: dor de cabeça forte desde ontem e febre."
            rows={3}
          />
        </div>
      </ScreenContent>

      <ScreenFooter emergency="fixed">
        <Button block onClick={handleContinue} disabled={!canContinue || isPending}>
          {isPending && <LoaderIcon className="animate-spin" aria-hidden="true" />}
          Continuar
        </Button>
      </ScreenFooter>
    </Screen>
  );
};

export { SymptomsForm };
