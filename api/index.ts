import express from 'express';
import { apiRouter } from '../server/routes.ts';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/api', apiRouter);

// Exportar como función serverless para Vercel
export default app;
