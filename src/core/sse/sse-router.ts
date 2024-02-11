import { randomUUID } from 'crypto';
import { Request, Response, Router } from 'express';
import { sseManager } from './sse-manager';
import { logger } from '../config/logger';

const sseRouter = Router();

sseRouter.get('/sse/notifications', (req: Request, res: Response) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);

  const clientId = randomUUID();
  sseManager.addClient({ id: clientId, res });

  logger.debug(`SSE Notifications connection opened. Client id: ${clientId}.`);

  req.on('close', () => {
    sseManager.removeClient(clientId);
    logger.debug(`SSE Notifications connection closed. Client id: ${clientId}.`);
  });
});

export { sseRouter };
