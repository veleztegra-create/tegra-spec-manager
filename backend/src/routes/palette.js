import { prisma } from '../db.js';
import { resolveColor } from '../../../config/color-engine.js';
import { clampLimit, normalizePalettePayload } from './normalizers.js';

function applyResolvedPaletteColor(color) {
  const resolved = resolveColor({
    hex: color.hex,
    rgb: color.rgbJson
  });

  return {
    ...color,
    toneCategory: resolved.toneCategory,
    luminance: resolved.luminance,
    suggestedName: color.suggestedName || resolved.name || null,
    metadataJson: {
      source: resolved.source,
      recommendedInk: resolved.recommendedInk,
      contrastText: resolved.contrastText
    }
  };
}

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
    const resolvedColors = payload.colors.map(applyResolvedPaletteColor);

    const created = await prisma.paletteExtraction.create({
      data: {
        source: payload.source,
        extractedAt: payload.extractedAt,
        totalColors: payload.totalColors || resolvedColors.length,
        classificationThreshold: payload.classificationThreshold,
        payloadJson: {
          ...payload.payloadJson,
          colors: resolvedColors
        },
        createdBy: request.headers['x-user'] ? String(request.headers['x-user']) : null,
        colors: {
          create: resolvedColors.map(({ metadataJson, ...color }) => color)
        }
      },
      include: { colors: true }
    });

    return reply.code(201).send({
      ...created,
      resolvedColors
    });
  });
}
