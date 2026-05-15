import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiService } from './api/apiService';
import authReducer from './slices/authSlice';

// Import injected endpoints to ensure they are registered
import './api/recipeApi';
import './api/categoryApi';

export const store = configureStore({
  reducer: {
    [apiService.reducerPath]: apiService.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiService.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
