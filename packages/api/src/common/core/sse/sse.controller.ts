import { SseNotification } from '@mini-aws-mock/shared';
import { Controller, Sse } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, map } from 'rxjs';

@Controller('/sse')
export class SseController {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @Sse('/notifications')
  sse(): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'SSE.NOTIFICATION').pipe(
      map((data: SseNotification) => {
        return new MessageEvent('SSE.NOTIFICATION', { data: JSON.stringify(data) });
      })
    );
  }
}
