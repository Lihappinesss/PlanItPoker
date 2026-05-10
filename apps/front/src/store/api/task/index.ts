import { baseApi } from '../baseApi';

import {
  ICreateTask,
  Id,
  ITask,
  IGetTask,
  IUpdatedTask,
} from './types';

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTask: builder.mutation<void, ICreateTask>({
      query: (newTask) => ({
        url: '/api/create/task',
        method: 'POST',
        body: newTask,
      }),
      invalidatesTags: ['Task'],
    }),

    deleteTask: builder.mutation<void, Id>({
      query: ({ id }) => ({
        url: `/api/delete/task/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),

    updateTask: builder.mutation<void, { taskId: number; updatedTask: IUpdatedTask }>({
      query: ({ taskId, updatedTask }) => ({
        url: `/api/update/task/${taskId}`,
        method: 'PUT',
        body: updatedTask,
      }),
      invalidatesTags: ['Task'],
    }),

    getAllTasks: builder.query<ITask[], IGetTask>({
      query: ({ roomId }) => `/api/tasks/${roomId}`,
      providesTags: ['Task'],
    }),

    deleteTasks: builder.mutation<void, IGetTask>({
      query: ({ roomId }) => ({
        url: `/api/delete/tasks/${roomId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetAllTasksQuery,
  useUpdateTaskMutation,
  useDeleteTasksMutation,
} = taskApi;
