import { createSlice } from '@reduxjs/toolkit'

// Check for saved theme in localStorage or default to light
const getSavedTheme = () => {
  try {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme || 'light'
  } catch (error) {
    return 'light'
  }
}

// Initial state
const initialState = {
  theme: getSavedTheme(),
  difficulty: 'medium',
  soundEnabled: true,
  notificationsEnabled: true,
  questionTimer: 30,
  language: 'en'
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      // Save to localStorage
      try {
        localStorage.setItem('theme', state.theme)
      } catch (error) {
        console.error('Error saving theme to localStorage:', error)
      }
    },
    updateSettings: (state, action) => {
      return { ...state, ...action.payload }
    }
  }
})

export const { toggleTheme, updateSettings } = settingsSlice.actions

export default settingsSlice.reducer 