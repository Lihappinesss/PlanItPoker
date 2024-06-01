import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import {
  ICreateTask,
  Id,
  ITask,
  IGetTask,
  IUpdatedTask,
} from './types';


export const taskApi = createApi({
  reducerPath: 'taskApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000' }),
  endpoints: (builder) => ({
    createTask: builder.mutation<void, ICreateTask>({
      query: newTask => ({
        url: '/api/create/task',
        method: 'POST',
        body: newTask,
        credentials: 'include',
      }),
    }),

    deleteTask: builder.mutation<void, Id>({
      query: ({ id }) => ({
        url: `/api/delete/task/${id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
    }),

    updateTask: builder.mutation<void, { taskId: number; updatedTask: IUpdatedTask }>({
      query: ({ taskId, updatedTask }) => ({
        url: `/api/update/task/${taskId}`,
        method: 'PUT',
        credentials: 'include',
        body: updatedTask
      }),
    }),

    getAllTasks: builder.query<ITask[], IGetTask>({
      query: ({ roomId }) => `/api/tasks/${roomId}`,
    }),

    deleteTasks: builder.mutation<void, Id>({
      query: ({ id }) => ({
        url: `/api/delete/tasks/${id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
    })
  }),
});

export const {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetAllTasksQuery,
  useUpdateTaskMutation,
  useDeleteTasksMutation,
} = taskApi;
