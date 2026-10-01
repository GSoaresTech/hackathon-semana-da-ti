import path from 'node:path';

import type { NextConfig } from 'next';

import { readServerEnv } from './src/libs/env.schema';

/*
 * A env é validada AQUI, antes de qualquer uso.
 *
 * Assim uma variável faltando ou malformada falha o `next build` com a lista do
 * que está errado, em vez de virar um "Invalid rewrite found" genérico (ou pior:
 * passar batido e quebrar em runtime, longe da causa).
 */
const serverEnv = readServerEnv();

const nextConfig: NextConfig = {
  // Build blue/green: `BUILD_DIR=temp npm run build` compila fora do .next em uso.
  distDir: process.env.BUILD_DIR || '.next',

  // Fixa a raiz do monorepo (onde ficam o lockfile e o node_modules hoisted).
  // Sem isso o Turbopack sobe a árvore procurando lockfile e pode acabar
  // adotando um diretório errado — ou não enxergar o `next` instalado na raiz.
  turbopack: {
    root: path.join(import.meta.dirname, '../..'),
  },

  // Estável no Next 16 (saiu de `experimental`): tipa `href` de Link/router.
  typedRoutes: true,

  /*
   * O backend é acessado por rewrite same-origin: o browser chama `/api/*` e o
   * Next repassa para PRIVATE_API_URL.
   *
   * É isso que mantém o cookie de sessão first-party (httpOnly + SameSite) sem
   * precisar de CORS — e o motivo de NEXT_PUBLIC_API_URL ser "/api" e não a URL
   * absoluta do backend.
   */
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: `${serverEnv.PRIVATE_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
