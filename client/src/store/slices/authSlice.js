import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

// Load user from sessionStorage
const userFromStorage = (() => {
  try {
    const user = sessionStorage.getItem('gb_user');
    return user ? JSON.parse(user) : null;
  } catch { return null; }
})();

const tokenFromStorage = sessionStorage.getItem('gb_token') || null;

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try { return await authService.register(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try { return await authService.login(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try { return await authService.logout(); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Logout failed'); }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try { return await authService.getMe(); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to get user'); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: userFromStorage,
    token: tokenFromStorage,
    isAuthenticated: !!tokenFromStorage,
    loading: false,
    error: null,
    registerSuccess: false,
    registeredUserId: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearRegisterSuccess: (state) => { state.registerSuccess = false; },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      sessionStorage.setItem('gb_token', action.payload.token);
      sessionStorage.setItem('gb_user', JSON.stringify(action.payload.user));
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      sessionStorage.setItem('gb_user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        sessionStorage.setItem('gb_token', action.payload.token);
        sessionStorage.setItem('gb_user', JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        sessionStorage.setItem('gb_token', action.payload.token);
        sessionStorage.setItem('gb_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null; state.token = null; state.isAuthenticated = false;
        sessionStorage.removeItem('gb_token'); sessionStorage.removeItem('gb_user');
      })
      // GetMe
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        sessionStorage.setItem('gb_user', JSON.stringify(action.payload.user));
      });
  }
});

export const { clearError, clearRegisterSuccess, setCredentials, updateUser } = authSlice.actions;
export default authSlice.reducer;
