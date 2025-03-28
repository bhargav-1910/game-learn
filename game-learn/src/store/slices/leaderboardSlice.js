import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  players: [],
  timeFilter: 'all',
  sortBy: 'score',
  loading: false,
  error: null,
  lastUpdate: null
}

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    setPlayers: (state, action) => {
      state.players = action.payload
      state.lastUpdate = new Date().toISOString()
    },
    updateTimeFilter: (state, action) => {
      state.timeFilter = action.payload
    },
    updateSortBy: (state, action) => {
      state.sortBy = action.payload
    },
    updatePlayerScore: (state, action) => {
      const { playerId, score, streak, completionRate } = action.payload
      const playerIndex = state.players.findIndex(p => p.id === playerId)
      if (playerIndex !== -1) {
        state.players[playerIndex] = {
          ...state.players[playerIndex],
          score,
          streak,
          completionRate
        }
        // Re-sort players based on current sortBy
        state.players.sort((a, b) => b[state.sortBy] - a[state.sortBy])
        // Update ranks
        state.players.forEach((player, index) => {
          player.rank = index + 1
        })
      }
    },
    addPlayerBadge: (state, action) => {
      const { playerId, badge } = action.payload
      const player = state.players.find(p => p.id === playerId)
      if (player && !player.badges.includes(badge)) {
        player.badges.push(badge)
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    }
  }
})

export const {
  setPlayers,
  updateTimeFilter,
  updateSortBy,
  updatePlayerScore,
  addPlayerBadge,
  setLoading,
  setError
} = leaderboardSlice.actions

export default leaderboardSlice.reducer