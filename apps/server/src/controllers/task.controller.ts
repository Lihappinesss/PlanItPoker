import { Request, Response } from 'express';

import Task from '../models/task';


export const createTask = async (req: Request, res: Response) => {
  try {
    const { roomId, links } = req.body;

    if (!links && links.length === 0 || !roomId) {
      res.status(400).json({ error: 'Links and roomId are required' });
      return;
    }

    const newTasks = await Promise.all(
      links.map(async (link: string) => {
        return await Task.create({ link, status: 'pending', roomId, storyPoint: 0 });
      })
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
    const tasks = await Task.findAll({ where: { roomId } });

    await Promise.all(tasks.map(async (task) => {
      await task.destroy();
    }));

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};