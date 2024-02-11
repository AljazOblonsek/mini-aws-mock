import { randomUUID } from 'crypto';
import { Response } from 'express';
import { logger } from '..';

type SseClient = {
  id: string;
  res: Response;
};

type SseNotification<T> = {
  type: string;
  payload: T;
};

class SseManager {
  private clients: SseClient[] = [];

  addClient({ id, res }: { id: string; res: Response }): void {
    this.clients.push({ id, res });
  }

  removeClient(id: string): void {
    this.clients = this.clients.filter((e) => e.id !== id);
  }

  sendNotificationToAll<T>(notification: SseNotification<T>): void {
    logger.debug({ notification }, '[SseManager] Sending notification to all clients.');
    this.clients.forEach((e) => {
      e.res.write(`data: ${JSON.stringify(notification)}\n\n`);
    });
  }
}

export const sseManager = new SseManager();
