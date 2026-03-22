# Tegra Spec Manager Backend (Node)

Backend MVP para desarrollo en Render durante la fase de consolidación funcional.

## Stack
- Node.js 20+
- Fastify
- Prisma
- PostgreSQL

## Variables de entorno
Copia `.env.example` a `.env` y completa `DATABASE_URL`.

- `CORS_ORIGINS`: lista separada por comas de orígenes permitidos para consumir la API desde navegador.

## Desarrollo local
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## Arranque desde la raíz del repo
```bash
npm run render:build
npm run render:start
```

## Endpoints MVP
- `GET /`
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
1. Crea el Web Service apuntando a la **raíz del repo**; ya no dependemos de `Root Directory = backend`.
2. Build command: `npm run render:build`
3. Start command: `npm run render:start`
   - `npm run render:build` ejecuta `prisma migrate deploy`, por lo que el repo debe incluir las migraciones versionadas (ya se agregó la migración inicial).
4. Configura `DATABASE_URL` con la **Internal Database URL** de Render PostgreSQL.
5. Configura `CORS_ORIGINS` con la URL pública del frontend (por ejemplo GitHub Pages) y cualquier entorno local que quieras permitir.
6. La raíz `/` ahora devuelve un payload simple con las rutas disponibles para validar rápido que el servicio está arriba.
7. Si ves un 404 con una ruta rara como `GET:/healthhttps://.../health/db`, significa que la URL se pegó concatenada; prueba `/health` y `/health/db` por separado.
8. Opcional recomendado: usa el `render.yaml` de la raíz para crear el servicio automáticamente.
