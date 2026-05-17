import { Express } from 'express';
import { authRateLimit } from '../middleware/authRateLimit';

import {
  login,
  checkAuth,
  register,
  changeData,
  logout,
  checkPassword,
} from '../controllers/user.controller';

const enum AUTH_ROUTES {
  LOGIN = '/api/login',
  REGISTER = '/api/register',
  CHECK_AUTH = '/api/auth',
  CHANGE_DATA = '/api/user/update',
  LOGOUT = '/api/logout',
  CHECK_PASSWORD = '/api/checkPassword',
}

const authRoutes = (app: Express) => {
  app.post(AUTH_ROUTES.LOGIN, authRateLimit, login);
  app.post(AUTH_ROUTES.REGISTER, authRateLimit, register);
  app.get(AUTH_ROUTES.CHECK_AUTH, checkAuth);
  app.put(AUTH_ROUTES.CHANGE_DATA, authRateLimit, changeData);
  app.delete(AUTH_ROUTES.LOGOUT, logout);
  app.post(AUTH_ROUTES.CHECK_PASSWORD, authRateLimit, checkPassword);
};

export default authRoutes;
