import { prisma } from '../db.js';
import { clampLimit, mapPlacementForDb, normalizeSpecPayload, toOptionalString } from './normalizers.js';

export default async function specsRoutes(fastify) {
  fastify.get('/specs', async (request) => {
    const limit = clampLimit(request.query.limit);
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
        style: toOptionalString(generalData.style),
        customer: toOptionalString(generalData.customer),
        season: toOptionalString(generalData.season),
        colorway: toOptionalString(generalData.colorway),
        po: toOptionalString(generalData.po),
        nameTeam: toOptionalString(generalData.nameTeam),
        program: toOptionalString(generalData.program),
        specDate: toOptionalString(generalData.specDate),
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
          style: toOptionalString(generalData.style),
          customer: toOptionalString(generalData.customer),
          season: toOptionalString(generalData.season),
          colorway: toOptionalString(generalData.colorway),
          po: toOptionalString(generalData.po),
          nameTeam: toOptionalString(generalData.nameTeam),
          program: toOptionalString(generalData.program),
          specDate: toOptionalString(generalData.specDate),
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
