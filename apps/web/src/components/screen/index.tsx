'use client';

import { ChevronLeftIcon } from 'lucide-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { EmergencyButton } from '~/components/emergency-button';
import { cn } from '~/libs/utils';

/*
 * Estrutura de toda tela do Triar: uma decisão por tela.
 *
 *   <Screen>
 *     <ScreenHeader backHref="/" step={1} />
 *     <ScreenContent>título, conteúdo</ScreenContent>
 *     <ScreenFooter emergency="fixed"><Button block>Continuar</Button></ScreenFooter>
 *   </Screen>
 *
 * Coluna mobile-first (máx. 440px), margem lateral space-4, topo ao título
 * space-8. O "Emergência 192" fica fixo no rodapé nas telas curtas
 * (`ScreenFooter emergency="fixed"`) ou compacto no cabeçalho nas telas com
 * rolagem (`ScreenHeader emergency`).
 */

const Screen: React.FC<React.ComponentProps<'main'>> = ({ className, ...props }) => {
  return (
    <main
      className={cn(
        'mx-auto flex min-h-dvh w-full max-w-[440px] flex-col bg-surface-subtle',
        className,
      )}
      {...props}
    />
  );
};

interface ScreenHeaderProps {
  /** Para onde o "voltar" leva. Sem isso, volta no histórico. */
  backHref?: Route;
  /** Etapa atual do fluxo (1 a 3), com barra de progresso. */
  step?: number;
  totalSteps?: number;
  /** Título curto ao lado do voltar ("Resultado", "Cartão de triagem"). */
  title?: string;
  /** Mostra o 192 compacto à direita (telas com rolagem). */
  emergency?: boolean;
  hideBack?: boolean;
  className?: string;
  /** Conteúdo livre (ex.: a marca na tela Início). */
  children?: React.ReactNode;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  backHref,
  step,
  totalSteps = 3,
  title,
  emergency = false,
  hideBack = false,
  className,
  children,
}) => {
  const router = useRouter();

  function handleBack() {
    if (backHref) router.push(backHref);
    else router.back();
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex min-h-16 items-center gap-2 bg-surface-subtle/95 px-2 pt-2 backdrop-blur-sm',
        className,
      )}
    >
      {!hideBack && (
        <button
          type="button"
          onClick={handleBack}
          aria-label="Voltar"
          className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink transition-colors hover:bg-surface-tint"
        >
          <ChevronLeftIcon className="size-6" aria-hidden="true" />
        </button>
      )}

      {step !== undefined && (
        <div className="flex flex-1 items-center gap-3 pr-2">
          <div
            className="flex flex-1 gap-1.5"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-valuenow={step}
            aria-label={`Etapa ${step} de ${totalSteps}`}
          >
            {Array.from({ length: totalSteps }, (_, index) => (
              <span
                key={`step-${index + 1}`}
                className={cn(
                  'h-1.5 flex-1 rounded-pill transition-colors',
                  index < step ? 'bg-brand-600' : 'bg-border',
                )}
              />
            ))}
          </div>
          <span className="text-caption text-ink-muted">
            {step} de {totalSteps}
          </span>
        </div>
      )}

      {title && step === undefined && (
        <span className="flex-1 truncate text-caption text-ink-muted">{title}</span>
      )}

      {children}

      {emergency && <EmergencyButton variant="compact" className="mr-2 ml-auto" />}
    </header>
  );
};

const ScreenContent: React.FC<React.ComponentProps<'div'>> = ({ className, ...props }) => {
  return <div className={cn('flex flex-1 flex-col gap-6 px-4 pt-4 pb-6', className)} {...props} />;
};

const ScreenTitle: React.FC<React.ComponentProps<'h1'>> = ({ className, ...props }) => {
  return <h1 className={cn('text-title text-ink', className)} {...props} />;
};

const ScreenDescription: React.FC<React.ComponentProps<'p'>> = ({ className, ...props }) => {
  return <p className={cn('-mt-4 text-body text-ink-muted', className)} {...props} />;
};

interface ScreenFooterProps extends React.ComponentProps<'div'> {
  /** `fixed`: o "Emergência 192" flutua logo acima do botão principal. */
  emergency?: 'fixed';
}

const ScreenFooter: React.FC<ScreenFooterProps> = ({
  emergency,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-20 mt-auto flex flex-col gap-3 bg-gradient-to-t from-surface-subtle from-70% to-transparent px-4 pt-6 pb-4',
        // Espaço para o 192 flutuante não cobrir o conteúdo acima do rodapé.
        emergency === 'fixed' && 'pt-20',
        className,
      )}
      {...props}
    >
      {emergency === 'fixed' && <EmergencyButton className="absolute top-4 right-4" />}
      {children}
    </div>
  );
};

export { Screen, ScreenContent, ScreenDescription, ScreenFooter, ScreenHeader, ScreenTitle };
