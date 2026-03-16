import { prisma } from '../db.js';

const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function normalizeHex(hex) {
  const normalized = String(hex || '').trim();
  if (HEX_COLOR_PATTERN.test(normalized)) return normalized;
  return '#000000';
}

function normalizeColor(color = {}, index = 0) {
  const rgb = color && typeof color.rgb === 'object' ? color.rgb : { r: 0, g: 0, b: 0 };

  return {
    orderIndex: index,
    name: color.name ? String(color.name) : null,
    suggestedName: color.suggestedName ? String(color.suggestedName) : null,
    hex: normalizeHex(color.hex),
    rgbJson: rgb,
    ocrRawText: color.ocrRawText ? String(color.ocrRawText) : null,
    manuallyCorrected: Boolean(color.manuallyCorrected)
  };
}

function normalizePalettePayload(body = {}) {
  const colors = Array.isArray(body.colors)
    ? body.colors.map((color, index) => normalizeColor(color, index))
    : [];

  return {
    source: body.source ? String(body.source) : 'dashboard-techpack-palette-extractor',
    extractedAt: body.extractedAt ? new Date(body.extractedAt) : new Date(),
    totalColors: Number(body.totalColors) || colors.length,
    colors,
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
          create: payload.colors
        }
      },
      include: { colors: true }
    });

    return reply.code(201).send(created);
  });
}
