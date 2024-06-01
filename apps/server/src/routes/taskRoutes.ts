import { Express } from 'express';

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
  DELETE_TASKS = '/api/delete/tasks/:id',
}

const taskRoutes = (app: Express) => {
  app.post(TASK_ROUTES.CREATE_TASK, createTask);
  app.get(TASK_ROUTES.GET_TASKS, getAllTasksInRoom);
  app.delete(TASK_ROUTES.DELETE_TASK, deleteTask);
  app.put(TASK_ROUTES.UPDATE_TASK, updateTask);
  app.delete(TASK_ROUTES.DELETE_TASKS, deleteTasksInRoom);
};

export default taskRoutes;
