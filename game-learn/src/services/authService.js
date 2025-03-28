import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Initialize Supabase client with session persistence
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storage: localStorage
  }
})

class AuthService {
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      // Handle demo account in offline mode
      if (email.trim() === 'demo@example.com' && password.trim() === 'password') {
        if (!navigator.onLine) {
          console.log('Using demo account in offline mode')
          // Create a mock user/session for the demo account when offline
          const mockUser = {
            id: 'demo-user-id',
            email: 'demo@example.com',
            name: 'Demo User'
          }
          
          // Store demo user in local storage for persistence
          localStorage.setItem('demoUser', JSON.stringify(mockUser))
          
          return {
            user: mockUser,
            session: { access_token: 'demo-token' }
          }
        }
      } 
      // For non-demo users, check internet connection
      else if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.')
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        })

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password')
          }
          throw error
        }

        if (!data?.user) {
          throw new Error('Login failed. Please try again.')
        }

        // Successfully logged in, return user data
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || 'User'
        }
        
        // If it's the demo account, also store in localStorage for offline access
        if (email.trim() === 'demo@example.com' && password.trim() === 'password') {
          localStorage.setItem('demoUser', JSON.stringify(userData))
        }

        return {
          user: userData,
          session: data.session
        }
      } catch (error) {
        // Network-related errors
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') || 
            error.message.includes('Network request failed')) {
          
          // Special case for demo account even when fetch fails
          if (email.trim() === 'demo@example.com' && password.trim() === 'password') {
            const mockUser = {
              id: 'demo-user-id',
              email: 'demo@example.com',
              name: 'Demo User'
            }
            
            localStorage.setItem('demoUser', JSON.stringify(mockUser))
            
            return {
              user: mockUser,
              session: { access_token: 'demo-token' }
            }
          }
          
          throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
        }
        throw error
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async register(name, email, password) {
    try {
      if (!email || !password || !name) {
        throw new Error('Name, email, and password are required')
      }

      // Check for internet connection
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.')
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              name: name.trim()
            }
          }
        })

        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('This email is already registered')
          }
          throw error
        }

        if (!data?.user) {
          throw new Error('Registration failed. Please try again.')
        }

        // For demo purposes: allow registration in offline mode
        if (!data.session && !navigator.onLine) {
          const mockUser = {
            id: 'new-user-' + Date.now(),
            email: email.trim(),
            name: name.trim()
          }
          
          localStorage.setItem('demoUser', JSON.stringify(mockUser))
          
          return {
            user: mockUser,
            session: { access_token: 'demo-token' }
          }
        }

        return {
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name
          },
          session: data.session
        }
      } catch (error) {
        // Network-related errors
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') || 
            error.message.includes('Network request failed')) {
          throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
        }
        throw error
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async logout() {
    try {
      // Handle offline mode
      localStorage.removeItem('demoUser')
      
      if (!navigator.onLine) {
        console.log('Offline mode: local logout only')
        return
      }
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error.message)
        throw error
      }
      
      // Logout successful
      console.log('User logged out successfully')
    } catch (error) {
      console.error('Logout error:', error.message)
      // Don't throw the error during logout to ensure the user gets logged out on the frontend
      // even if the server request fails
    }
  }

  async getCurrentUser() {
    try {
      // Check if we have a demo user in offline mode
      const demoUser = localStorage.getItem('demoUser')
      if (demoUser && !navigator.onLine) {
        console.log('Using demo user in offline mode')
        return JSON.parse(demoUser)
      }
      
      // First check if we have an active session
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Auth getSession error:', sessionError.message)
          return null
        }
        
        if (!sessionData.session) {
          // No active session
          return null
        }
        
        // If we have a session, get the user data
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Auth getUser error:', error.message)
          if (error.message.includes('missing')) {
            return null
          }
          throw error
        }
        
        if (!user) return null

        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || 'User'
        }
      } catch (error) {
        // If we have network errors but have a demo user
        if (demoUser && (error.message.includes('Failed to fetch') || !navigator.onLine)) {
          console.log('Network error, using demo user')
          return JSON.parse(demoUser)
        }
        
        console.error('getCurrentUser error:', error)
        return null
      }
    } catch (error) {
      console.error('getCurrentUser error:', error)
      return null
    }
  }
}

export default new AuthService()