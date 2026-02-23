import rateLimit from 'express-rate-limit';
import type { Response, Request } from 'express';

import type { SubmitScoreError } from '../types.js';

/**
  - rate limiting middleware using express-rate-limit
  - uses in-memory store (default) which resets on server restart
  - requires app.set('trust proxy', 1) in Express for proper IP detection behind proxies
*/

/**
  - custom handler for rate limit exceeded
*/
const rateLimitHandler = (_req: Request, res: Response): void => {
  const errorResponse: SubmitScoreError = {
    success: false,
    error: 'RATE_LIMITED',
    message: 'Too many requests. Please try again later.',
  };
  res.status(429).json(errorResponse);
};

/**
  - rate limiter for leaderboard daily endpoint
  - 30 requests per minute per IP
*/
export const dailyRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
  - rate limiter for leaderboard submit endpoint
  - 5 requests per minute per IP
*/
export const submitRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});
