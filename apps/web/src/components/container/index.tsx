import { cn } from '~/libs/utils';

/** Largura e respiro padrão de toda página. Envolve o conteúdo de cada `page.tsx`. */
const Container: React.FC<React.ComponentProps<'div'>> = ({ className, ...props }) => {
  return (
    <div className={cn('mx-auto flex w-full max-w-6xl flex-col px-6 pb-8', className)} {...props} />
  );
};

export { Container };
