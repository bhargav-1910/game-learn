import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentLevel: 1,
  score: 0,
  badges: [],
  currentGame: null,
  gameHistory: [],
  loading: false,
  error: null
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state, action) => {
      state.currentGame = action.payload
      state.loading = false
      state.error = null
    },
    updateScore: (state, action) => {
      state.score += action.payload
    },
    completeLevel: (state) => {
      state.currentLevel += 1
      state.gameHistory.push({
        level: state.currentLevel - 1,
        score: state.score,
        timestamp: new Date().toISOString()
      })
    },
    earnBadge: (state, action) => {
      state.badges.push(action.payload)
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    resetGame: (state) => {
      state.currentGame = null
      state.loading = false
      state.error = null
    }
  }
})

export const { 
  startGame,
  updateScore,
  completeLevel,
  earnBadge,
  setLoading,
  setError,
  resetGame
} = gameSlice.actions

export default gameSlice.reducer