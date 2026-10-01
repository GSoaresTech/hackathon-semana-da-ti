'use client';

import { CheckIcon, MapPinIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Brand } from '~/components/brand';
import { Disclaimer } from '~/components/disclaimer';
import { NetworkSelector } from '~/components/network-selector';
import {
  Screen,
  ScreenContent,
  ScreenFooter,
  ScreenHeader,
  ScreenTitle,
} from '~/components/screen';
import { Button } from '~/components/ui/button';
import { useGeolocation } from '~/hooks/use-geolocation';
import { cn } from '~/libs/utils';

import { useTriage, useTriageHydrated } from './triage-store';

/**
 * Tela 01 · Início: aviso legal, escolha da rede e permissão de localização.
 * A rede escolhida aqui é o filtro de unidades em todo o fluxo.
 */
const StartForm: React.FC = () => {
  const router = useRouter();
  const hydrated = useTriageHydrated();
  const network = useTriage((state) => state.network);
  const geolocation = useTriage((state) => state.geolocation);
  const setNetwork = useTriage((state) => state.setNetwork);
  const setLocation = useTriage((state) => state.setLocation);
  const reset = useTriage((state) => state.reset);
  const { request, isPending } = useGeolocation();

  async function handleLocation() {
    if (isPending || geolocation === 'granted') return;

    const coords = await request();
    setLocation(coords ? 'granted' : 'denied', coords);
  }

  function handleStart() {
    // Começar de novo descarta a triagem anterior (mantém rede e localização).
    reset();
    router.push('/symptoms');
  }

  return (
    <Screen>
      <ScreenHeader hideBack className="px-4">
        <Brand />
      </ScreenHeader>

      <ScreenContent className="pt-2">
        <ScreenTitle>Olá! Vamos descobrir para onde você deve ir.</ScreenTitle>

        <Disclaimer />

        <section className="flex flex-col gap-3">
          <h2 id="network-label" className="text-heading text-ink">
            Onde você quer ser atendido?
          </h2>
          <NetworkSelector value={network} onChange={setNetwork} labelledBy="network-label" />
        </section>

        <button
          type="button"
          onClick={handleLocation}
          disabled={!hydrated || isPending}
          className="flex min-h-16 cursor-pointer items-center gap-4 rounded-md border bg-surface px-4 py-3 text-left transition-colors hover:bg-surface-subtle disabled:cursor-default"
        >
          <MapPinIcon className="size-6 shrink-0 text-brand-600" aria-hidden="true" />
          <span className="flex flex-1 flex-col">
            <span className="text-label text-ink">Usar minha localização</span>
            <span className="text-caption text-ink-muted">
              Para mostrar as unidades mais próximas
            </span>
          </span>
          <span
            className={cn(
              'text-caption',
              geolocation === 'granted' ? 'text-urg-green' : 'text-brand-700',
            )}
          >
            {isPending && 'Aguardando…'}
            {!isPending && geolocation === 'granted' && (
              <span className="inline-flex items-center gap-1">
                <CheckIcon className="size-4" aria-hidden="true" />
                Permitido
              </span>
            )}
            {!isPending && geolocation === 'denied' && 'Sem permissão'}
            {!isPending && geolocation === 'idle' && 'Permitir'}
          </span>
        </button>
        {geolocation === 'denied' && (
          <p className="-mt-4 text-caption text-ink-muted">
            Sem a localização, mostramos as unidades a partir do centro de Caruaru.
          </p>
        )}
      </ScreenContent>

      <ScreenFooter emergency="fixed">
        <Button block onClick={handleStart} disabled={!hydrated}>
          Começar
        </Button>
      </ScreenFooter>
    </Screen>
  );
};

export { StartForm };
