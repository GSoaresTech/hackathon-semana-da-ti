import { cn } from '~/libs/utils';

/** Títulos de página e de seção. Mantém a hierarquia tipográfica consistente. */

const Title: React.FC<React.ComponentProps<'h1'>> = ({ className, ...props }) => {
  return (
    <h1
      className={cn('mt-2 text-2xl font-bold tracking-tight text-foreground', className)}
      {...props}
    />
  );
};

const SectionTitle: React.FC<React.ComponentProps<'h2'>> = ({ className, ...props }) => {
  return <h2 className={cn('text-lg font-semibold text-foreground', className)} {...props} />;
};

const SectionDescription: React.FC<React.ComponentProps<'p'>> = ({ className, ...props }) => {
  return <p className={cn('mt-1 text-sm text-muted-foreground', className)} {...props} />;
};

export { SectionDescription, SectionTitle, Title };
