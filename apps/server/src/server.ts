import { create_app } from '~/app';
import { env } from '~/libs/environments';

create_app().then((app) => {
  app.listen({ port: env.PORT, host: env.HOST }).then(() => {
    console.log(`🚀 Server on http://localhost:${env.PORT}`);
  });
});
