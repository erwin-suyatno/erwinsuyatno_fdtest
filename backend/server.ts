import 'dotenv/config';
import express from 'express';
import { prisma } from './src/utils/db';

const app = express();
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'up' });
  } catch {
    res.status(500).json({ status: 'ok', db: 'down' });
  }
});

const port = Number(process.env.PORT || 4000);

async function start() {
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (e) {
    console.error('Database connection error', e);
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

start();
