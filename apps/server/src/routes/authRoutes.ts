import { Express } from 'express';

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
  CHECK_AUTH = '/',
  CHANGE_DATA = '/api/user/update/:id',
  LOGOUT = '/api/logout',
  CHECK_PASSWORD = '/api/checkPassword',
}

const authRoutes = (app: Express) => {
  app.post(AUTH_ROUTES.LOGIN, login);
  app.post(AUTH_ROUTES.REGISTER, register);
  app.get(AUTH_ROUTES.CHECK_AUTH, checkAuth);
  app.put(AUTH_ROUTES.CHANGE_DATA, changeData);
  app.delete(AUTH_ROUTES.LOGOUT, logout);
  app.post(AUTH_ROUTES.CHECK_PASSWORD, checkPassword);
};

export default authRoutes;
