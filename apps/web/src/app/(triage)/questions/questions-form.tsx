'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { LoaderIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { IntensityScale } from '~/components/intensity-scale';
import { OptionGroup } from '~/components/option-group';
import {
  Screen,
  ScreenContent,
  ScreenFooter,
  ScreenHeader,
  ScreenTitle,
} from '~/components/screen';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { ONSET_OPTIONS, PREGNANT_OPTIONS } from '~/libs/constants';
import { QUERIES } from '~/libs/queries';
import { listSymptoms } from '~/services/symptoms';
import { createTriage, type TriageAnswers } from '~/services/triage';

import { useTriage } from '../triage-store';
import { useTriageGuard } from '../use-triage-guard';

/**
 * Tela 03 · Perguntas complementares (2 de 3): tempo de início, intensidade
 * (só quando algum sintoma marcado pede), idade e gestação.
 *
 * "Ver resultado" envia a triagem completa: as regras de sinal grave rodam de
 * novo (agora com idade, gestação e intensidade) e, se nada for grave, a IA
 * classifica o nível.
 */
const QuestionsForm: React.FC = () => {
  const router = useRouter();
  const ready = useTriageGuard(
    (state) => state.symptoms.length > 0 || state.description.trim().length > 0,
    '/symptoms',
  );
  const network = useTriage((state) => state.network);
  const symptoms = useTriage((state) => state.symptoms);
  const description = useTriage((state) => state.description);
  const answers = useTriage((state) => state.answers);
  const setAnswers = useTriage((state) => state.setAnswers);
  const setEmergency = useTriage((state) => state.setEmergency);
  const setResult = useTriage((state) => state.setResult);

  const { data } = useQuery({ queryKey: [QUERIES.LIST_SYMPTOMS], queryFn: listSymptoms });

  const asksIntensity =
    data?.symptoms.some(
      (symptom) => symptoms.includes(symptom.id) && symptom.questions.includes('intensity'),
    ) ?? false;

  const { mutate, isPending } = useMutation({
    mutationFn: createTriage,
    onSuccess: (result) => {
      if (result.emergency) {
        setEmergency(result);
        router.push('/emergency');
        return;
      }

      if ('level' in result) {
        setResult(result);
        router.push('/result');
      }
    },
    onError: (error) => toast.error(error.message),
  });

  const complete: TriageAnswers | null =
    answers.onset &&
    answers.pregnant &&
    answers.age !== undefined &&
    (!asksIntensity || (answers.intensity !== undefined && answers.intensity !== null))
      ? {
          onset: answers.onset,
          age: answers.age,
          pregnant: answers.pregnant,
          intensity: asksIntensity ? (answers.intensity ?? null) : null,
        }
      : null;

  function handleSubmit() {
    if (isPending || !complete) return;

    mutate({ network, symptoms, description: description.trim() || null, answers: complete });
  }

  function handleAge(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 3);
    const age = digits === '' ? undefined : Math.min(Number(digits), 120);

    setAnswers({ age });
  }

  if (!ready) return <Screen />;

  return (
    <Screen>
      <ScreenHeader backHref="/symptoms" step={2} />

      <ScreenContent>
        <ScreenTitle>Conte um pouco mais</ScreenTitle>

        <section className="flex flex-col gap-2">
          <h2 id="onset-label" className="text-label text-ink">
            Há quanto tempo começou?
          </h2>
          <OptionGroup
            name="onset"
            labelledBy="onset-label"
            options={ONSET_OPTIONS}
            value={answers.onset}
            onChange={(onset) => setAnswers({ onset })}
          />
        </section>

        {asksIntensity && (
          <section className="flex flex-col gap-2">
            <h2 id="intensity-label" className="text-label text-ink">
              Qual a intensidade da dor?
            </h2>
            <IntensityScale
              labelledBy="intensity-label"
              value={answers.intensity}
              onChange={(intensity) => setAnswers({ intensity })}
            />
          </section>
        )}

        <section className="flex flex-col gap-2">
          <label htmlFor="age" className="text-label text-ink">
            Idade
          </label>
          <div className="relative w-36">
            <Input
              id="age"
              inputMode="numeric"
              autoComplete="off"
              value={answers.age ?? ''}
              onChange={(event) => handleAge(event.target.value)}
              className="pr-14"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-body text-ink-muted">
              anos
            </span>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 id="pregnant-label" className="text-label text-ink">
            Está gestante?
          </h2>
          <OptionGroup
            name="pregnant"
            labelledBy="pregnant-label"
            options={PREGNANT_OPTIONS}
            value={answers.pregnant}
            onChange={(pregnant) => setAnswers({ pregnant })}
          />
        </section>
      </ScreenContent>

      <ScreenFooter emergency="fixed">
        <Button block onClick={handleSubmit} disabled={!complete || isPending}>
          {isPending && <LoaderIcon className="animate-spin" aria-hidden="true" />}
          {isPending ? 'Avaliando seus sintomas…' : 'Ver resultado'}
        </Button>
      </ScreenFooter>
    </Screen>
  );
};

export { QuestionsForm };
