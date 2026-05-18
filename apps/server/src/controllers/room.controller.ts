import { Request, Response } from 'express';

import Room from '../models/room';
import RoomMember from '../models/roomMember';
import Task from '../models/task';
import { createUniqueInviteCode } from '../utils/roomAccess';

type RequestWithSessionUser = Request & {
  session: Request['session'] & {
    user?: {
      id: number;
    };
  };
};

export const createRoom = async (req: RequestWithSessionUser, res: Response) => {
  try {
    const { title } = req.body;
    const userId = req.session.user?.id;

    if (!title || !userId) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const inviteCode = await createUniqueInviteCode();

    const newRoom = await Room.create({
      title,
      ownerId: userId,
      inviteCode,
    });

    await RoomMember.create({
      roomId: newRoom.id,
      userId,
    });

    res.status(200).json({ message: 'Room created', room: newRoom});
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const getRooms = async (req: RequestWithSessionUser, res: Response) => {
  try {
    const userId = req.session.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const data = await Room.findAll({
      include: [{
        model: RoomMember,
        as: 'roomMembers',
        where: { userId },
        attributes: [],
      }],
      order: [['id', 'DESC']],
    });

    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;

    const existingRoom = await Room.findByPk(roomId);

    if (!existingRoom) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    await existingRoom.destroy();

    await Task.destroy({
      where: { roomId: roomId },
    });

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const joinRoom = async (req: RequestWithSessionUser, res: Response) => {
  try {
    const userId = req.session.user?.id;
    const inviteCode = req.body.inviteCode?.trim().toUpperCase();

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!inviteCode) {
      res.status(400).json({ message: 'Invite code is required' });
      return;
    }

    const room = await Room.findOne({ where: { inviteCode } });

    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    const [membership] = await RoomMember.findOrCreate({
      where: {
        roomId: room.id,
        userId,
      },
      defaults: {
        roomId: room.id,
        userId,
      },
    });

    res.status(200).json({
      message: 'Joined room successfully',
      room,
      membership,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
