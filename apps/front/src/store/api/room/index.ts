import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import {
  ICreateRoom,
  IDeleteRoom,
  IRoomsRes
} from './types';


export const roomApi = createApi({
  reducerPath: 'roomApi',
  tagTypes: ['ROOM_DATA'],
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000' }),
  endpoints: (builder) => ({
    createRoom: builder.mutation<void, ICreateRoom>({
      query: newRoom => ({
        url: '/api/create/room',
        method: 'POST',
        body: newRoom,
        credentials: 'include',
      }),
    }),

    deleteRoom: builder.mutation<void, IDeleteRoom>({
      query: ({ id }) => ({
        url: `/api/delete/room/${id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
    }),

    getRooms: builder.query<IRoomsRes[], void>({
      query: () => '/api/rooms',
    }),
  }),
});

export const {
  useCreateRoomMutation,
  useDeleteRoomMutation,
  useGetRoomsQuery,
} = roomApi;

