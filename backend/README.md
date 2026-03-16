# Tegra Spec Manager Backend (Node)

Backend MVP para desarrollo en Render durante la fase de consolidación funcional.

## Stack
- Node.js 20+
- Fastify
- Prisma
- PostgreSQL

## Variables de entorno
Copia `.env.example` a `.env` y completa `DATABASE_URL`.

## Desarrollo local
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## Endpoints MVP
- `GET /health`
- `GET /health/db`
- `GET /api/specs?limit=20`
- `GET /api/specs/:id`
- `POST /api/specs`
- `PUT /api/specs/:id`
- `DELETE /api/specs/:id`
- `GET /api/palette-extractions?limit=20`
- `POST /api/palette-extractions`

## Notas de despliegue (Render)
1. Crear servicio web y configurar **Root Directory = `backend`** (si no, fallará con `ENOENT /opt/render/project/src/package.json`).
2. Build command: `npm install && npm run prisma:generate && npm run prisma:deploy`
3. Start command: `npm start`
4. Configurar `DATABASE_URL` desde Render PostgreSQL.
5. Opcional recomendado: usar el `render.yaml` de la raíz para crear el servicio con estos valores automáticamente.
