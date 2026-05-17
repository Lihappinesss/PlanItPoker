import { NextFunction, Request, Response } from 'express';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export const applySecurityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  if (req.secure) {
    res.setHeader(
      'Strict-Transport-Security',
      `max-age=${ONE_YEAR_IN_SECONDS}; includeSubDomains`
    );
  }

  next();
};
