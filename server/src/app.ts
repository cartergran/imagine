import cors from 'cors';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';

import { config } from './config.js';
import checkRouter from './routes/check.routes.js';
import leaderboardRouter from './routes/leaderboard.routes.js';
import puzzleRouter from './routes/puzzle.routes.js';
import { securityMiddleware } from './middleware/security.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(): express.Application {
  const app = express();

  // trust first proxy (Heroku) for correct client IP in rate limiting
  app.set('trust proxy', 1);

  app.use(securityMiddleware());

  // redirect HTTP to HTTPS in production
  app.use((req: Request, res: Response, next: NextFunction): void => {
    if (config.nodeEnv !== 'dev' && req.header('x-forwarded-proto') !== 'https') {
      res.redirect(301, `https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });

  app.use(cors({ origin: config.accessURL, methods: ['GET', 'POST'] }));
  app.use(express.json());

  // serve static files from Vite build
  app.use(
    express.static(path.resolve(__dirname, '../../client/dist'), {
      dotfiles: 'ignore',
      index: false,
    })
  );

  app.use('/puzzle', puzzleRouter);
  app.use('/check', checkRouter);
  app.use('/leaderboard', leaderboardRouter);

  // serve index.html only for routes without a file extension
  app.get(/^\/(?!.*\.[a-z0-9]+$).*/i, (_req: Request, res: Response): void => {
    res.sendFile(path.resolve(__dirname, '../../client/dist', 'index.html'));
  });

  // 404 fallback
  app.use((_req: Request, res: Response) => {
    res.sendStatus(404);
  });

  return app;
}
