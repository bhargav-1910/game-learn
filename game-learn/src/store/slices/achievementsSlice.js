import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import leaderboardService from '../../services/leaderboardService'

// Async thunk for checking achievement eligibility
export const checkAchievements = createAsyncThunk(
  'achievements/check',
  async (userId, { rejectWithValue }) => {
    try {
      const newAchievements = await leaderboardService.checkAchievementEligibility(userId)
      
      // If user qualified for new achievements, award them
      const awardedAchievements = []
      
      for (const achievement of newAchievements) {
        const awarded = await leaderboardService.awardAchievement(userId, achievement.id)
        if (awarded) {
          awardedAchievements.push({
            ...achievement,
            awarded: true,
            awardedAt: new Date().toISOString()
          })
        }
      }
      
      // Get all user achievements to return the latest state
      const allAchievements = await leaderboardService.getUserAchievements(userId)
      
      return {
        allAchievements,
        newlyAwarded: awardedAchievements
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get all user achievements
export const fetchUserAchievements = createAsyncThunk(
  'achievements/fetchAll',
  async (userId, { rejectWithValue }) => {
    try {
      const achievements = await leaderboardService.getUserAchievements(userId)
      return achievements
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get all available achievements
export const fetchAvailableAchievements = createAsyncThunk(
  'achievements/fetchAvailable',
  async (_, { rejectWithValue }) => {
    try {
      const achievements = await leaderboardService.getAvailableAchievements()
      return achievements
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  userAchievements: [],
  availableAchievements: [],
  newlyAwarded: [],
  loading: false,
  error: null,
  lastChecked: null
}

const achievementsSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    clearNewlyAwarded: (state) => {
      state.newlyAwarded = []
    }
  },
  extraReducers: (builder) => {
    builder
      // Check achievements
      .addCase(checkAchievements.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkAchievements.fulfilled, (state, action) => {
        state.loading = false
        state.userAchievements = action.payload.allAchievements
        state.newlyAwarded = action.payload.newlyAwarded
        state.lastChecked = new Date().toISOString()
      })
      .addCase(checkAchievements.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch user achievements
      .addCase(fetchUserAchievements.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserAchievements.fulfilled, (state, action) => {
        state.loading = false
        state.userAchievements = action.payload
      })
      .addCase(fetchUserAchievements.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch available achievements
      .addCase(fetchAvailableAchievements.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAvailableAchievements.fulfilled, (state, action) => {
        state.loading = false
        state.availableAchievements = action.payload
      })
      .addCase(fetchAvailableAchievements.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearNewlyAwarded } = achievementsSlice.actions

export default achievementsSlice.reducer 