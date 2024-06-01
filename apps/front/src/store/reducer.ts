import { combineReducers } from '@reduxjs/toolkit';

import { authReducer } from './authSlice';
import { authApi } from './api/auth';
import { roomApi } from './api/room';
import { taskApi } from './api/task';

const rootReducer = combineReducers({
  auth: authReducer,
  roomApi: roomApi.reducer,
  authApi: authApi.reducer,
  taskApi: taskApi.reducer,
});

export default rootReducer;