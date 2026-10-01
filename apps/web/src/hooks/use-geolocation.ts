'use client';

import { useCallback, useState } from 'react';

type Coords = { lat: number; lng: number };

/**
 * Pede a localização do aparelho uma única vez, sob demanda (num clique — o
 * navegador só mostra o pedido de permissão em resposta a um gesto).
 *
 * Devolve `null` quando a pessoa nega ou o aparelho não suporta; quem chama
 * decide o ponto padrão (`DEFAULT_COORDS` em `~/libs/constants`).
 */
function useGeolocation() {
  const [isPending, setIsPending] = useState(false);

  const request = useCallback(
    () =>
      new Promise<Coords | null>((resolve) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          resolve(null);
          return;
        }

        setIsPending(true);

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setIsPending(false);
            resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
          },
          () => {
            setIsPending(false);
            resolve(null);
          },
          { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60 * 1000 },
        );
      }),
    [],
  );

  return { request, isPending };
}

export { useGeolocation };
