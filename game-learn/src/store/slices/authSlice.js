import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  networkError: false,
  initialized: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
      state.networkError = false
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload
      state.error = null
      state.networkError = false
      state.initialized = true
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
      
      state.networkError = action.payload.includes('Unable to connect') || 
                          action.payload.includes('Network') || 
                          action.payload.includes('internet') ||
                          action.payload.includes('connect to server') ||
                          action.payload.includes('Failed to fetch')
      
      state.initialized = true
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      state.networkError = false
      state.initialized = true
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    },
    authInitialized: (state) => {
      state.initialized = true
    },
    clearAuthErrors: (state) => {
      state.error = null
      state.networkError = false
    }
  }
})

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  updateProfile,
  authInitialized,
  clearAuthErrors
} = authSlice.actions

export default authSlice.reducer