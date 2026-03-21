import { buildApp } from './app.js';

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  const app = buildApp();

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Backend listening on http://${HOST}:${PORT}`);
  } catch (error) {
    app.log.error(error, 'Failed to start backend');
    process.exit(1);
  }
}

start();
