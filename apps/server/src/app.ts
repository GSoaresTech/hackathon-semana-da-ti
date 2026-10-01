import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swagger_ui from '@fastify/swagger-ui';
import fastify, { type FastifyInstance } from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';

import { env } from '~/libs/environments';
import { error_handler_middleware } from '~/middlewares/error-handler-middleware';
import { app_routes } from '~/routes';

async function create_app(): Promise<FastifyInstance> {
  const app = fastify({
    // O token do cartão de triagem (JWT) vai no path de GET /api/cards/:token.
    routerOptions: { maxParamLength: 4096 },
  });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(cookie);

  app.register(cors, {
    origin: env.ORIGINS,
    credentials: true, // Para autenticação por cookies
  });

  if (env.NODE_ENV === 'development') {
    app.register(swagger, {
      transform: jsonSchemaTransform,
      openapi: {
        info: {
          title: 'Triar API',
          description: 'API de pré-triagem do Triar',
          version: '1.0.0',
        },
      },
    });
    app.register(swagger_ui, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
    });
  }

  app.register(app_routes, { prefix: '/api' });
  app.setErrorHandler(error_handler_middleware);
  return app;
}

export { create_app };
