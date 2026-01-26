import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import type { SubmitScoreError } from './types.js';

/**
  - rate limiting middleware using express-rate-limit
  - uses in-memory store (default) which resets on server restart
*/

/**
  - extracts client IP from request
  - handles proxied requests (Heroku uses x-forwarded-for)
*/
const keyGenerator = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
};

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
  windowMs: 60 * 1000, // 1 minute
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler,
});

/**
  - rate limiter for leaderboard submit endpoint
  - 5 requests per minute per IP
*/
export const submitRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler,
});
