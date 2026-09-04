import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';

// API call for login
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/api/auth/login', credentials);
    if (response.data.success) {
      localStorage.setItem('jwt_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    return rejectWithValue(response.data.message);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

const initialState = {
  token: localStorage.getItem('jwt_token') || null,
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('jwt_token'),
  applications: localStorage.getItem('applications') ? JSON.parse(localStorage.getItem('applications')) : [],
  selectedApplication: localStorage.getItem('selected_application') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      localStorage.removeItem('applications');
      localStorage.removeItem('selected_application');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.applications = [];
      state.selectedApplication = null;
      state.error = null;
    },
    selectApplication: (state, action) => {
      state.selectedApplication = action.payload;
      localStorage.setItem('selected_application', action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.applications = action.payload.applications || [];
        state.selectedApplication = null;
        localStorage.setItem('applications', JSON.stringify(action.payload.applications || []));
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, selectApplication } = authSlice.actions;
export default authSlice.reducer;
