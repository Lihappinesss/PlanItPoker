import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import {
  IRegisterReq,
  IUserInfo,
  ILoginData,
  IChangeUserData,
  IPasswordInfo,
} from './types';


export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000' }),
  endpoints: (builder) => ({
    register: builder.mutation<void, IRegisterReq>({
      query: newUser => ({
        url: '/api/register',
        method: 'POST',
        body: newUser,
        credentials: 'include',
      }),
    }),

    login: builder.mutation<IUserInfo, ILoginData>({
      query: user => ({
        url: '/api/login',
        method: 'POST',
        body: user,
        credentials: 'include',
      }),
    }),

    getUserInfo: builder.query<IUserInfo, void | Record<never, never>>({
      query: () => ({
        url: '/',
        method: 'GET',
        credentials: 'include',
      }),
    }),

    changeData: builder.mutation<void, IChangeUserData>({
      query: newData => ({
        url: `/api/user/update/${newData.id}`,
        method: 'PUT',
        body: newData,
        credentials: 'include',
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/api/logout',
        method: 'DELETE',
        credentials: 'include',
      }),
    }),

    checkPassword: builder.mutation<IPasswordInfo, ILoginData>({
      query: user => ({
        url: '/api/checkPassword',
        method: 'POST',
        body: user,
        credentials: 'include',
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
