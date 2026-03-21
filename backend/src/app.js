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

  app.get('/', async () => {
    return {
      status: 'ok',
      service: 'tegra-spec-manager-backend',
      message: 'Backend activo. Usa /health o /health/db para verificar el estado.',
      availableRoutes: [
        '/',
        '/health',
        '/health/db',
        '/api/specs',
        '/api/palette-extractions'
      ]
    };
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

  app.setNotFoundHandler((request, reply) => {
    const requestedUrl = request.raw.url || request.url || '';
    const looksConcatenated = requestedUrl.includes('http://') || requestedUrl.includes('https://');

    return reply.code(404).send({
      error: 'Not Found',
      message: looksConcatenated
        ? 'La URL parece concatenada. Prueba abrir /health y /health/db por separado.'
        : `Ruta ${request.method} ${requestedUrl} no encontrada.`,
      requestedUrl,
      availableRoutes: [
        '/health',
        '/health/db',
        '/api/specs',
        '/api/palette-extractions'
      ]
    });
  });

  return app;
}
