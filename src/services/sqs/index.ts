import { uiRouter } from './routers/ui.router';

export const sqsRouters = {
  ui: uiRouter,
} as const;

export { mockHandlerMap as sqsMockHandlerMap } from './mock-handler-map';
export { startRefreshSqsMessageVisbilityInterval } from './intervals/refresh-sqs-message-visibility.interval';
