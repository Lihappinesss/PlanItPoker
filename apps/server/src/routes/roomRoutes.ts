import { Express } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { requireRoomOwner } from '../middleware/roomAccess';

import {
  createRoom,
  getRooms,
  deleteRoom,
  joinRoom,
} from '../controllers/room.controller';

const enum ROOM_ROUTES {
  CREATE_ROOM = '/api/create/room',
  GET_ROOMS = '/api/rooms',
  DELETE_ROOM = '/api/delete/room/:id',
  JOIN_ROOM = '/api/rooms/join',
}

const roomRoutes = (app: Express) => {
  app.post(ROOM_ROUTES.CREATE_ROOM, requireAuth, createRoom);
  app.get(ROOM_ROUTES.GET_ROOMS, requireAuth, getRooms);
  app.post(ROOM_ROUTES.JOIN_ROOM, requireAuth, joinRoom);
  app.delete(ROOM_ROUTES.DELETE_ROOM, requireAuth, requireRoomOwner, deleteRoom);
};

export default roomRoutes;
