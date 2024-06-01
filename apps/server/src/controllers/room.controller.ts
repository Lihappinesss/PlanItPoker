import { Request, Response } from 'express';

import Room from '../models/room';
import Task from '../models/task';

interface ExtendedRequest extends Request {
  title: string,
}

export const createRoom = async (req: ExtendedRequest, res: Response) => {
  try {
    const { title } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const newRoom = await Room.create({
      title,
    });

    res.status(200).json({ message: 'Room created', room: newRoom});
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const getRooms = async (req: Request, res: Response) => {
  try {
    const data = await Room.findAll();
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