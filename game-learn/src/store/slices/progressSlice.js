import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  completedLessons: [],
  learningPath: [],
  achievements: [],
  statistics: {
    totalTimeSpent: 0,
    averageScore: 0,
    completionRate: 0,
    streakDays: 0
  },
  recommendations: [],
  lastActivity: null,
  loading: false,
  error: null
}

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    completeLesson: (state, action) => {
      state.completedLessons.push(action.payload)
      state.lastActivity = new Date().toISOString()
    },
    updateLearningPath: (state, action) => {
      state.learningPath = action.payload
    },
    addAchievement: (state, action) => {
      state.achievements.push(action.payload)
    },
    updateStatistics: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload }
    },
    setRecommendations: (state, action) => {
      state.recommendations = action.payload
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
  completeLesson,
  updateLearningPath,
  addAchievement,
  updateStatistics,
  setRecommendations,
  setLoading,
  setError
} = progressSlice.actions

export default progressSlice.reducer