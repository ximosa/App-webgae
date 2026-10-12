import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Middleware para parsear JSON con límite de tamaño de seguridad
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Montar router de API
app.use('/api', apiRouter);

// Endpoint de salud
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'DevPro Digital Platform'
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // En desarrollo, montar Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // En producción, servir los archivos estáticos generados por Vite
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[DevPro Server] Servidor activo y escuchando en http://0.0.0.0:${port}`);
  });
}

// Iniciar servidor solo si es ejecutado directamente
if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Error fatal al iniciar servidor:', err);
    process.exit(1);
  });
}

export default app;
