import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrating: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    hydrateFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token) {
          state.token = token;
          state.isAuthenticated = true;
        }
        if (user) {
          try {
            state.user = JSON.parse(user);
          } catch {
            // Invalid JSON, clear it
            localStorage.removeItem('user');
          }
        }
      }
      state.isHydrating = false;
    },
  },
});

export const { setCredentials, logout, hydrateFromStorage } = authSlice.actions;
export default authSlice.reducer;
