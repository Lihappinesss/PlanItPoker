import { Express } from 'express';

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
  app.post(ROOM_ROUTES.CREATE_ROOM, createRoom);
  app.get(ROOM_ROUTES.GET_ROOMS, getRooms);
  app.delete(ROOM_ROUTES.DELETE_ROOM, deleteRoom);
};

export default roomRoutes;
