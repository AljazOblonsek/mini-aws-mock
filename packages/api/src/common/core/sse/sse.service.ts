import { SseNotification } from '@mini-aws-mock/shared';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SseService {
  private readonly logger: Logger;

  constructor(private eventEmitter: EventEmitter2) {
    this.logger = new Logger(this.constructor.name);
  }

  sendNotification(notification: SseNotification): void {
    this.logger.debug({ notification }, 'Emitting SSE.NOTIFICATION.');
    this.eventEmitter.emit('SSE.NOTIFICATION', notification);
  }
}
