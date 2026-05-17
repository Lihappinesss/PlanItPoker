import { Express } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import {
  createRoom,
  getRooms,
  deleteRoom
} from '../controllers/room.controller';

const enum ROOM_ROUTES {
  CREATE_ROOM = '/api/create/room',
  GET_ROOMS = '/api/rooms',
  DELETE_ROOM = '/api/delete/room/:id'
}

const roomRoutes = (app: Express) => {
  app.post(ROOM_ROUTES.CREATE_ROOM, requireAuth, createRoom);
  app.get(ROOM_ROUTES.GET_ROOMS, requireAuth, getRooms);
  app.delete(ROOM_ROUTES.DELETE_ROOM, requireAuth, deleteRoom);
};

export default roomRoutes;
