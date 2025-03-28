import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import gameReducer from './slices/gameSlice'
import leaderboardReducer from './slices/leaderboardSlice'
import progressReducer from './slices/progressSlice'
import achievementsReducer from './slices/achievementsSlice'
import settingsReducer from './slices/settingsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
    progress: progressReducer,
    leaderboard: leaderboardReducer,
    achievements: achievementsReducer,
    settings: settingsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})