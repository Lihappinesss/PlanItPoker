import { Express } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import {
  createTask,
  updateTask,
  deleteTask,
  getAllTasksInRoom,
  deleteTasksInRoom,
} from '../controllers/task.controller';

const enum TASK_ROUTES {
  CREATE_TASK = '/api/create/task',
  GET_TASKS = '/api/tasks/:roomId',
  DELETE_TASK = '/api/delete/task/:id',
  UPDATE_TASK = '/api/update/task/:id',
  DELETE_TASKS = '/api/delete/tasks/:roomId',
}

const taskRoutes = (app: Express) => {
  app.post(TASK_ROUTES.CREATE_TASK, requireAuth, createTask);
  app.get(TASK_ROUTES.GET_TASKS, requireAuth, getAllTasksInRoom);
  app.delete(TASK_ROUTES.DELETE_TASK, requireAuth, deleteTask);
  app.put(TASK_ROUTES.UPDATE_TASK, requireAuth, updateTask);
  app.delete(TASK_ROUTES.DELETE_TASKS, requireAuth, deleteTasksInRoom);
};

export default taskRoutes;
