import { apiRouter } from './routers/api.router';
import { uiRouter } from './routers/ui.router';

export const snsRouters = {
  api: apiRouter,
  ui: uiRouter,
} as const;

export { mockHandlerMap as snsMockHandlerMap } from './mock-handler-map';
