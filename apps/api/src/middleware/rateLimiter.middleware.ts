import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    isSuccess: false,
    message: 'Too many requests from this IP, try again in 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

