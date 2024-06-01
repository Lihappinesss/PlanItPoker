import { Express } from 'express';

import authRoutes from './authRoutes';
import roomRoutes from './roomRoutes';
import taskRoutes from './taskRoutes';

const routes = (app: Express) => {
  authRoutes(app);
  roomRoutes(app);
  taskRoutes(app);
};

export default routes;