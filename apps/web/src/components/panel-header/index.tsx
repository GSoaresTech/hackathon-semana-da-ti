import { cn } from '~/libs/utils';

/*
 * Cabeçalho das páginas do painel da unidade (tela 08).
 *
 *   <PanelHeader>
 *     <PanelTitle>Pronto-socorro Santa Clara</PanelTitle>
 *     <PanelDescription>Recepção · pacientes a caminho com pré-triagem</PanelDescription>
 *     <PanelActions>
 *       <Button>Ler QR code</Button>
 *     </PanelActions>
 *   </PanelHeader>
 *
 * O título e a descrição ficam à esquerda; as ações, à direita no desktop e
 * em baixo no celular. Não é o `Screen` do fluxo do paciente: o painel é a
 * única área de desktop e tem layout próprio.
 */

const PanelHeader: React.FC<React.ComponentProps<'header'>> = ({ className, ...props }) => {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 pb-6 md:flex-row md:items-start md:justify-between md:gap-6',
        className,
      )}
      {...props}
    />
  );
};

const PanelTitle: React.FC<React.ComponentProps<'h1'>> = ({ className, ...props }) => {
  return <h1 className={cn('text-title text-ink', className)} {...props} />;
};

const PanelDescription: React.FC<React.ComponentProps<'p'>> = ({ className, ...props }) => {
  return <p className={cn('mt-1 text-body text-ink-muted', className)} {...props} />;
};

const PanelActions: React.FC<React.ComponentProps<'div'>> = ({ className, ...props }) => {
  return (
    <div className={cn('flex flex-wrap items-center gap-3 md:shrink-0', className)} {...props} />
  );
};

export { PanelActions, PanelDescription, PanelHeader, PanelTitle };
