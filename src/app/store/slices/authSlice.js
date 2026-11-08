import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '@/features/auth/api/authApi';
import {
  mapLoginResponse,
  parseApiErrorMessage,
  persistAuthSession,
  clearAuthSession,
  AUTH_STORAGE_KEY,
} from '@/lib/mappers/authMapper';

const isDev = import.meta.env.DEV;

function loadInitialUser() {
  try {
    const token = localStorage.getItem('pit_jwt');
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!saved || !token) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authApi.login({ email, password });
      const result = mapLoginResponse(response);
      if (result.error) return rejectWithValue(result.error);
      persistAuthSession(result.user, result.token);
      return result.user;
    } catch (e) {
      const data = e.response?.data;
      return rejectWithValue(parseApiErrorMessage(data, 'Invalid email or password'));
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ fullName, email, password }, { rejectWithValue }) => {
    try {
      const response = await authApi.register({
        name: fullName,
        email,
        password,
      });
      const result = mapLoginResponse(response);
      if (result.error) return rejectWithValue(result.error);
      persistAuthSession(result.user, result.token);
      return result.user;
    } catch (e) {
      const data = e.response?.data;
      return rejectWithValue(parseApiErrorMessage(data, 'Registration failed'));
    }
  }
);

const initialState = {
  user: loadInitialUser(),
  authError: null,
  authLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.authError = null;
      clearAuthSession();
    },
    clearAuthError(state) {
      state.authError = null;
    },
    loginWithGoogle(state) {
      if (!isDev) return;
      const mockUser = {
        id: 'usr-google-01',
        fullName: 'Google User',
        email: 'user@gmail.com',
        accountType: 'LIVE PRO',
        baseCurrency: 'USD',
        authProvider: 'google',
      };
      localStorage.setItem('pit_jwt', 'mock-jwt-google-bypass');
      state.user = mockUser;
      state.authError = null;
    },
    bypassAuth(state) {
      if (!isDev) return;
      const demoUser = {
        id: 'usr-demo-01',
        fullName: 'Alex Mercer',
        email: 'alex@partnerintrade.com',
        accountType: 'FUNDED 100K',
        baseCurrency: 'USD',
      };
      localStorage.setItem('pit_jwt', 'mock-jwt-token-bypass');
      state.user = demoUser;
      state.authError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.authLoading = true;
        state.authError = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload;
        state.authError = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.authLoading = true;
        state.authError = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload;
        state.authError = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload || 'Registration failed';
      });
  },
});

export const { logout, clearAuthError, loginWithGoogle, bypassAuth } = authSlice.actions;
export default authSlice.reducer;

export const selectIsDevBypassEnabled = () => isDev;
