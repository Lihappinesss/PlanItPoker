import { Request, Response } from 'express';

import Task from '../models/task';


export const createTask = async (req: Request, res: Response) => {
  try {
    const { roomId, links } = req.body;

    if (!roomId || !Array.isArray(links) || links.length === 0) {
      res.status(400).json({ error: 'Links and roomId are required' });
      return;
    }

    const normalizedLinks = links
      .map((link: string) => link.trim())
      .filter((link: string) => link.length > 0);

    if (normalizedLinks.length === 0) {
      res.status(400).json({ error: 'At least one valid link is required' });
      return;
    }

    const newTasks = await Task.bulkCreate(
      normalizedLinks.map((link: string) => ({
        link,
        status: 'pending',
        roomId,
        storyPoint: 0,
      }))
    );

    res.status(201).send(newTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const { roomId, storyPoint, link } = req.body;

    const existingTask = await Task.findByPk(taskId);

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    await existingTask.update({ link, status: 'finished', roomId, storyPoint });

    res.send(existingTask);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;

    const existingTask = await Task.findByPk(taskId);

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    await existingTask.destroy();

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllTasksInRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.roomId;

    const tasks = await Task.findAll({
      where: { roomId: roomId },
    });

    res.status(200).send(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteTasksInRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.roomId;
    await Task.destroy({ where: { roomId } });

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
