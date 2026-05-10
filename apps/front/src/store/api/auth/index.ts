import {
  IRegisterReq,
  IUserInfo,
  ILoginData,
  IChangeUserData,
  IPasswordInfo,
  ICheckPasswordReq,
} from './types';

import { baseApi } from '../baseApi';


export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<IUserInfo, IRegisterReq>({
      query: (newUser) => ({
        url: '/api/register',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: ['User'],
    }),

    login: builder.mutation<IUserInfo, ILoginData>({
      query: (user) => ({
        url: '/api/login',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['User'],
    }),

    getUserInfo: builder.query<IUserInfo, void>({
      query: () => ({
        url: '/api/auth',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    changeData: builder.mutation<IUserInfo, IChangeUserData>({
      query: (newData) => ({
        url: '/api/user/update',
        method: 'PUT',
        body: newData,
      }),
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/api/logout',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    checkPassword: builder.mutation<IPasswordInfo, ICheckPasswordReq>({
      query: (body) => ({
        url: '/api/checkPassword',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetUserInfoQuery,
  useChangeDataMutation,
  useLogoutMutation,
  useCheckPasswordMutation,
} = authApi;