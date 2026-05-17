import { NextFunction, Request, Response } from 'express';

type RequestWithSessionUser = Request & {
  session: Request['session'] & {
    user?: {
      id: number;
    };
  };
};

export const requireAuth = (
  req: RequestWithSessionUser,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.user?.id) {
    res.status(401).json({
      message: 'Unauthorized',
    });
    return;
  }

  next();
};
