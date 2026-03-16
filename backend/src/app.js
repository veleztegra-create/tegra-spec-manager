import Fastify from 'fastify';
import healthRoutes from './routes/health.js';
import specsRoutes from './routes/specs.js';
import paletteRoutes from './routes/palette.js';

export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info'
    }
  });

  app.register(async function apiScope(api) {
    api.register(healthRoutes);
    api.register(specsRoutes, { prefix: '/api' });
    api.register(paletteRoutes, { prefix: '/api' });
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    const statusCode = error.statusCode || 500;
    reply.code(statusCode).send({
      error: statusCode >= 500 ? 'Error interno del servidor' : error.message
    });
  });

  return app;
}
