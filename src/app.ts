import express, { NextFunction, Request, Response } from 'express';
import { errorMiddleware } from '@/core/middleware/error.middleware';
import { requestIdMiddleware } from '@/core/middleware/request-id.middleware';
import { snsRouters } from '@/services/sns';
import { sqsRouters } from '@/services/sqs';
import { env, sseRouter } from './core';
import { join } from 'path';
import { mockRouter } from './common/routers/mock.router';

const app = express();

const ROOT_ASSETS_PATH = env.NODE_ENV === 'production' ? './dist/views' : './src';

app.set('views', ROOT_ASSETS_PATH);
app.set('view engine', 'ejs');

app.locals.assetsPath = join(process.cwd(), ROOT_ASSETS_PATH);

app.use('/public', express.static(join(process.cwd(), 'public')));

// Used for showing currently active tab on sidebar in UI
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.includes('ui/')) {
    app.locals.currentUiPath = req.path.split('/').at(-1);
  }

  next();
});

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
    verify: function (req: Request, _res, buffer, encoding) {
      req.textBody = buffer.toString(encoding as BufferEncoding);
    },
  })
);

app.get('/ui', (req: Request, res: Response) => {
  // Redirect user to SNS UI for now since there are no other mocks
  return res.redirect('/ui/sns-topics');
});

app.use(sseRouter);

app.use(requestIdMiddleware);

// Common router that gets action from AWS SDK call and redirects it to correct mock handler
app.use(mockRouter);

app.use(snsRouters.api);
app.use(snsRouters.ui);

app.use(sqsRouters.api);
app.use(sqsRouters.ui);

app.use(errorMiddleware);

export default app;
