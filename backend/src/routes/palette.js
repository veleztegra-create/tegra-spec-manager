import { prisma } from '../db.js';
import { clampLimit, normalizePalettePayload } from './normalizers.js';

export default async function paletteRoutes(fastify) {
  fastify.get('/palette-extractions', async (request) => {
    const limit = clampLimit(request.query.limit);

    const items = await prisma.paletteExtraction.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        colors: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    return { items };
  });

  fastify.post('/palette-extractions', async (request, reply) => {
    const payload = normalizePalettePayload(request.body || {});

    const created = await prisma.paletteExtraction.create({
      data: {
        source: payload.source,
        extractedAt: payload.extractedAt,
        totalColors: payload.totalColors || payload.colors.length,
        classificationThreshold: payload.classificationThreshold,
        payloadJson: payload.payloadJson,
        createdBy: request.headers['x-user'] ? String(request.headers['x-user']) : null,
        colors: {
          create: payload.colors
        }
      },
      include: { colors: true }
    });

    return reply.code(201).send(created);
  });
}
