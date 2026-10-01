'use client';

import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(query);

  mql.addEventListener('change', onChange);

  return () => mql.removeEventListener('change', onChange);
}

/**
 * `useSyncExternalStore` é o primitivo certo para ler de uma fonte externa
 * (aqui, `matchMedia`). A versão do shadcn usa `useEffect` + `setState`, o que
 * gera render em cascata e um flash de layout desktop antes do primeiro efeito.
 *
 * O snapshot do servidor é `false`: no SSR não existe viewport, então
 * renderizamos a versão desktop e o cliente corrige na hidratação.
 */
function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export { useIsMobile };
