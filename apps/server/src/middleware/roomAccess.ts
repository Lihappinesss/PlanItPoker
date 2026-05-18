import { NextFunction, Request, Response } from 'express';

import Room from '../models/room';
import Task from '../models/task';
import { hasRoomAccess } from '../utils/roomAccess';

type RequestWithSessionUser = Request & {
  session: Request['session'] & {
    user?: {
      id: number;
    };
  };
};

const parseRoomId = async (req: Request) => {
  if (Number.isFinite(Number(req.params.roomId))) {
    return Number(req.params.roomId);
  }

  if (Number.isFinite(Number(req.body?.roomId))) {
    return Number(req.body.roomId);
  }

  if (Number.isFinite(Number(req.params.id))) {
    const task = await Task.findByPk(req.params.id);
    return task?.roomId;
  }

  return undefined;
};

export const requireRoomAccess = async (
  req: RequestWithSessionUser,
  res: Response,
  next: NextFunction
) => {
  const userId = req.session.user?.id;

  if (!userId) {
    res.status(401).json({
      message: 'Unauthorized',
    });
    return;
  }

  const roomId = await parseRoomId(req);

  if (!roomId) {
    res.status(400).json({
      message: 'Room id is required',
    });
    return;
  }

  const accessAllowed = await hasRoomAccess(roomId, userId);

  if (!accessAllowed) {
    res.status(403).json({
      message: 'Access to this room is forbidden',
    });
    return;
  }

  next();
};

export const requireRoomOwner = async (
  req: RequestWithSessionUser,
  res: Response,
  next: NextFunction
) => {
  const userId = req.session.user?.id;

  if (!userId) {
    res.status(401).json({
      message: 'Unauthorized',
    });
    return;
  }

  const roomId = Number.isFinite(Number(req.params.id))
    ? Number(req.params.id)
    : await parseRoomId(req);

  if (!roomId) {
    res.status(400).json({
      message: 'Room id is required',
    });
    return;
  }

  const room = await Room.findByPk(roomId);

  if (!room) {
    res.status(404).json({
      message: 'Room not found',
    });
    return;
  }

  if (room.ownerId !== userId) {
    res.status(403).json({
      message: 'Only the room owner can perform this action',
    });
    return;
  }

  next();
};
