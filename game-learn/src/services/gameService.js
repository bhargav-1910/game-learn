import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

class GameService {
  constructor() {
    this.currentGame = null
    this.subscribers = new Set()
  }

  // Initialize a new game session
  async startGame(userId, difficulty, topic) {
    try {
      const gameSession = {
        userId,
        difficulty,
        topic,
        score: 0,
        startTime: new Date().toISOString(),
        status: 'active'
      }

      const { data, error } = await supabase
        .from('game_sessions')
        .insert([gameSession])
        .select()

      if (error) throw error

      this.currentGame = data[0]
      this.notifySubscribers()
      return this.currentGame
    } catch (error) {
      console.error('Error starting game:', error)
      throw error
    }
  }

  // Generate game content based on difficulty and topic
  async generateContent(difficulty, topic) {
    try {
      // TODO: Integrate with AI service for content generation
      const content = {
        questions: [
          {
            id: 1,
            text: 'Sample question 1',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0
          }
        ],
        story: 'Sample story text',
        hints: ['Hint 1', 'Hint 2']
      }

      return content
    } catch (error) {
      console.error('Error generating content:', error)
      throw error
    }
  }

  // Update game progress and score
  async updateProgress(gameId, score, completed = false) {
    try {
      const updates = {
        score,
        status: completed ? 'completed' : 'active',
        ...(completed && { endTime: new Date().toISOString() })
      }

      const { data, error } = await supabase
        .from('game_sessions')
        .update(updates)
        .eq('id', gameId)
        .select()

      if (error) throw error

      this.currentGame = data[0]
      this.notifySubscribers()
      return this.currentGame
    } catch (error) {
      console.error('Error updating progress:', error)
      throw error
    }
  }

  // Subscribe to game updates
  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  // Notify all subscribers of game state changes
  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.currentGame))
  }

  // Get user's game history
  async getGameHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('userId', userId)
        .order('startTime', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching game history:', error)
      throw error
    }
  }

  // Get user's achievements and badges
  async getAchievements(userId) {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('userId', userId)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching achievements:', error)
      throw error
    }
  }
}

const gameService = new GameService()
export default gameService