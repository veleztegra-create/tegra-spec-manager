import { prisma } from '../db.js';

function normalizeSpecPayload(payload = {}) {
  const generalData = payload.generalData || {};
  const placements = Array.isArray(payload.placements)
    ? payload.placements.filter((placement) => placement && typeof placement === 'object')
    : [];

  return {
    generalData,
    placements,
    meta: payload.meta || {}
  };
}

function mapPlacementForDb(placement = {}, index = 0) {
  return {
    orderIndex: index,
    type: placement.type || null,
    name: placement.name || null,
    placementDetails: placement.placementDetails || null,
    specialInstructions: placement.specialInstructions || null,
    dimensions: placement.dimensions || null,
    baseSize: placement.baseSize || null,
    inkType: placement.inkType || null,
    colorsJson: placement.colors || null,
    sequenceJson: placement.sequence || null
  };
}

export default async function specsRoutes(fastify) {
  fastify.get('/specs', async (request) => {
    const limit = Math.min(Number(request.query.limit) || 20, 100);
    const specs = await prisma.spec.findMany({
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        placements: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    return { items: specs };
  });

  fastify.get('/specs/:id', async (request, reply) => {
    const spec = await prisma.spec.findUnique({
      where: { id: request.params.id },
      include: {
        placements: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!spec) return reply.code(404).send({ error: 'Spec no encontrada' });
    return spec;
  });

  fastify.post('/specs', async (request, reply) => {
    const payload = normalizeSpecPayload(request.body || {});
    const generalData = payload.generalData || {};

    const created = await prisma.spec.create({
      data: {
        style: generalData.style || null,
        customer: generalData.customer || null,
        season: generalData.season || null,
        colorway: generalData.colorway || null,
        po: generalData.po || null,
        nameTeam: generalData.nameTeam || null,
        program: generalData.program || null,
        specDate: generalData.specDate || null,
        payloadJson: payload,
        placements: {
          create: payload.placements.map((placement, index) => mapPlacementForDb(placement, index))
        }
      },
      include: { placements: true }
    });

    return reply.code(201).send(created);
  });

  fastify.put('/specs/:id', async (request, reply) => {
    const exists = await prisma.spec.findUnique({ where: { id: request.params.id }, select: { id: true } });
    if (!exists) return reply.code(404).send({ error: 'Spec no encontrada' });

    const payload = normalizeSpecPayload(request.body || {});
    const generalData = payload.generalData || {};

    const updated = await prisma.$transaction(async (tx) => {
      await tx.placement.deleteMany({ where: { specId: request.params.id } });

      return tx.spec.update({
        where: { id: request.params.id },
        data: {
          style: generalData.style || null,
          customer: generalData.customer || null,
          season: generalData.season || null,
          colorway: generalData.colorway || null,
          po: generalData.po || null,
          nameTeam: generalData.nameTeam || null,
          program: generalData.program || null,
          specDate: generalData.specDate || null,
          payloadJson: payload,
          placements: {
            create: payload.placements.map((placement, index) => mapPlacementForDb(placement, index))
          }
        },
        include: { placements: true }
      });
    });

    return updated;
  });

  fastify.delete('/specs/:id', async (request, reply) => {
    const exists = await prisma.spec.findUnique({ where: { id: request.params.id }, select: { id: true } });
    if (!exists) return reply.code(404).send({ error: 'Spec no encontrada' });

    await prisma.spec.delete({ where: { id: request.params.id } });
    return reply.code(204).send();
  });
}
