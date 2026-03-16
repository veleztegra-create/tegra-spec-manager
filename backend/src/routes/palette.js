import { prisma } from '../db.js';

function normalizePalettePayload(body = {}) {
  return {
    source: body.source || 'dashboard-techpack-palette-extractor',
    extractedAt: body.extractedAt ? new Date(body.extractedAt) : new Date(),
    totalColors: Number(body.totalColors) || 0,
    colors: Array.isArray(body.colors) ? body.colors : [],
    payloadJson: body
  };
}

export default async function paletteRoutes(fastify) {
  fastify.get('/palette-extractions', async (request) => {
    const limit = Math.min(Number(request.query.limit) || 20, 100);

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
        payloadJson: payload.payloadJson,
        createdBy: request.headers['x-user'] ? String(request.headers['x-user']) : null,
        colors: {
          create: payload.colors.map((color, index) => ({
            orderIndex: index,
            name: color.name || null,
            suggestedName: color.suggestedName || null,
            hex: color.hex || '#000000',
            rgbJson: color.rgb || null,
            ocrRawText: color.ocrRawText || null,
            manuallyCorrected: Boolean(color.manuallyCorrected)
          }))
        }
      },
      include: { colors: true }
    });

    return reply.code(201).send(created);
  });
}
