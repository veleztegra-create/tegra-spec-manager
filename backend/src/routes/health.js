import { prisma } from '../db.js';

export default async function healthRoutes(fastify) {
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      service: 'tegra-spec-manager-backend',
      timestamp: new Date().toISOString()
    };
  });

  fastify.get('/health/db', async (request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'connected' };
    } catch (error) {
      request.log.error(error, 'DB health check failed');
      return reply.code(503).send({ status: 'error', database: 'disconnected' });
    }
  });
}
