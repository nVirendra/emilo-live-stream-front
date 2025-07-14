import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '../features/auth/authSlice';
import { baseApi } from '../features/api/api';
import { postApi } from '../features/api/post.api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [postApi.reducerPath]: postApi.reducer,   // ← inject RTK-Query slice

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});
