import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export function securityMiddleware() {
  return [
    // security headers
    helmet({
      contentSecurityPolicy: false,
    }),

    // global rate limiter (tune numbers as needed)
    rateLimit({
      windowMs: 60_000, // 1 minute
      max: 120, // max requests per IP per window
      standardHeaders: true,
      legacyHeaders: false,
    })
  ];
};
