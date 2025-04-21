import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import winston from 'winston';
import { LibraryAttestor } from './services/libraryAttestor';
import { AttestationStore } from './services/attestationStore';

dotenv.config();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const app = express();
app.use(cors());
app.use(express.json());

const attestor = new LibraryAttestor(logger);
// Initialize persistent store for attestations
const dbFile = process.env.DB_FILE || 'attestations.db';
const store = new AttestationStore(dbFile);
// SSE clients for real-time streaming of new attestations
const sseClients: Response[] = [];

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Public key endpoint
app.get('/public-key', (_req, res) => {
  const publicKey = attestor.getPublicKey();
  res.status(200).json({ publicKey });
});

// Library holdings attestation endpoint
app.get('/attestations/library/:isbn', async (req: Request, res: Response) => {
  try {
    const { isbn } = req.params;
    const attestation = await attestor.attest(isbn);
    // Persist and broadcast new attestation
    store.save(attestation);
    sseClients.forEach(client => {
      client.write(`data: ${JSON.stringify(attestation)}\n\n`);
    });
    res.status(200).json(attestation);
  } catch (err: any) {
    logger.error('Error in /attestations/library/:isbn', { err });
    res.status(500).json({ error: err.message || err.toString() });
  }
});

// SSE stream endpoint for watching attestations in real time
app.get('/attestations/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  // Send a comment to keep the connection alive
  res.write('retry: 10000\n\n');
  sseClients.push(res);
  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

const port = process.env.PORT || 3300;
app.listen(port, () => {
  logger.info(`Library Attestor service running on port ${port}`);
});

export { app };