import { NextFunction, Request, Response } from 'express';

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 10;

type RateLimitEntry = {
  count: number;
  expiresAt: number;
};

const requestsByKey = new Map<string, RateLimitEntry>();

const getWindowMs = () => {
  const rawValue = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS);

  return Number.isFinite(rawValue) && rawValue > 0
    ? rawValue
    : DEFAULT_WINDOW_MS;
};

const getMaxRequests = () => {
  const rawValue = Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS);

  return Number.isFinite(rawValue) && rawValue > 0
    ? rawValue
    : DEFAULT_MAX_REQUESTS;
};

export const authRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const windowMs = getWindowMs();
  const maxRequests = getMaxRequests();
  const now = Date.now();
  const key = `${req.ip}:${req.path}`;
  const existingEntry = requestsByKey.get(key);

  if (!existingEntry || existingEntry.expiresAt <= now) {
    requestsByKey.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    });
    next();
    return;
  }

  existingEntry.count += 1;

  if (existingEntry.count > maxRequests) {
    res.setHeader('Retry-After', Math.ceil((existingEntry.expiresAt - now) / 1000));
    res.status(429).json({
      message: 'Too many requests. Please try again later.',
    });
    return;
  }

  next();
};
