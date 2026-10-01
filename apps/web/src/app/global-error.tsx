'use client';

import { useEffect } from 'react';

/**
 * Captura erros no próprio root layout. Precisa renderizar `<html>` e `<body>`
 * porque substitui o layout raiz inteiro — e por isso não pode usar nada que
 * dependa dos providers.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Algo deu errado</h1>
        <p style={{ color: '#71717b' }}>
          Ocorreu um erro inesperado. Recarregue a página para tentar de novo.
        </p>
      </body>
    </html>
  );
}
