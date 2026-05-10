import { baseApi } from '../baseApi';

import {
  ICreateRoom,
  IDeleteRoom,
  IRoomsRes,
} from './types';

export const roomApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRoom: builder.mutation<void, ICreateRoom>({
      query: (newRoom) => ({
        url: '/api/create/room',
        method: 'POST',
        body: newRoom,
      }),
      invalidatesTags: ['Room'],
    }),

    deleteRoom: builder.mutation<void, IDeleteRoom>({
      query: ({ id }) => ({
        url: `/api/delete/room/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Room'],
    }),

    getRooms: builder.query<IRoomsRes[], void>({
      query: () => '/api/rooms',
      providesTags: ['Room'],
    }),
  }),
});

export const {
  useCreateRoomMutation,
  useDeleteRoomMutation,
  useGetRoomsQuery,
} = roomApi;