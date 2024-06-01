import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from './api/auth';

export interface AuthState {
  user: {
    isAuth: boolean;
  };
}

const initialState: AuthState = {
  user: {
    isAuth: false,
  },
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIsAuth(state, action: PayloadAction<boolean>) {
      state.user.isAuth = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state) => {
      state.user.isAuth = true;
    });
  },
});

export const { setIsAuth } = authSlice.actions;
export const selectIsAuth = (state: { auth: AuthState }) => state.auth?.user?.isAuth;
export const authReducer = authSlice.reducer;
