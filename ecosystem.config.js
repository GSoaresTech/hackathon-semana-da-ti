const path = require('node:path');

/*
 * PM2 em produção. Pré-requisito: `npm ci && npm run start:build` na raiz.
 *
 *   pm2 start ecosystem.config.js
 *   pm2 save && pm2 startup
 *
 * As portas definidas aqui sobrescrevem o PORT do `.env.local` (o dotenv não
 * sobrescreve variável que já existe). O PRIVATE_API_URL do `apps/web/.env`
 * precisa apontar para a porta da API ANTES do build: o rewrite de /api é
 * gravado no build.
 */

const API_PORT = 4010;
const WEB_PORT = 3010;

module.exports = {
  apps: [
    {
      name: 'triar-api',
      cwd: path.join(__dirname, 'apps/server'),
      script: 'dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: API_PORT,
      },
      max_memory_restart: '512M',
    },
    {
      name: 'triar-web',
      cwd: path.join(__dirname, 'apps/web'),
      script: path.join(__dirname, 'node_modules/next/dist/bin/next'),
      args: `start --port ${WEB_PORT} --hostname 127.0.0.1`,
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '1G',
    },
  ],
};
