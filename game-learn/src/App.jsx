import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { loginSuccess, loginFailure, logout, authInitialized } from './store/slices/authSlice'
import { checkAchievements } from './store/slices/achievementsSlice'
import authService from './services/authService'
import { createClient } from '@supabase/supabase-js'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GameInterface from './pages/GameInterface'
import Leaderboard from './pages/Leaderboard'
import Settings from './pages/Settings'
import Help from './pages/Help'
import Contact from './pages/Contact'
import Profile from './pages/Profile'
import CourseDetail from './components/CourseDetail'
import Achievements from './pages/Achievements'
import Courses from './pages/Courses'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, initialized } = useSelector((state) => state.auth)
  
  // Show loading indicator while checking auth status
  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />
}

const App = () => {
  const dispatch = useDispatch()
  const [appLoading, setAppLoading] = useState(true)
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  
  // Set up Supabase auth listener
  useEffect(() => {
    // Get Supabase client instance
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { 
          persistSession: true,
          storage: localStorage 
        }
      })
      
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session ? 'Session exists' : 'No session')
          
          if (event === 'SIGNED_IN' && session) {
            // User signed in
            const userData = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || 'User'
            }
            dispatch(loginSuccess(userData))
          } else if (event === 'SIGNED_OUT') {
            // User signed out
            dispatch(logout())
          } else if (event === 'TOKEN_REFRESHED') {
            // Token refreshed, update user data
            if (session) {
              const userData = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || 'User'
              }
              dispatch(loginSuccess(userData))
            }
          }
        }
      )
      
      // Cleanup subscription on unmount
      return () => {
        subscription?.unsubscribe()
      }
    } catch (error) {
      console.error('Error setting up auth listener:', error)
      // Make sure app doesn't get stuck in loading state if Supabase client fails
      if (!navigator.onLine) {
        dispatch(authInitialized())
        setAppLoading(false)
      }
    }
  }, [dispatch])
  
  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setAppLoading(true)
        
        // If we're offline, check for demo user
        if (!navigator.onLine) {
          const demoUserStr = localStorage.getItem('demoUser')
          if (demoUserStr) {
            const demoUser = JSON.parse(demoUserStr)
            console.log('Offline mode: using cached demo user')
            dispatch(loginSuccess(demoUser))
          } else {
            console.log('Offline mode: no cached user found')
            dispatch(authInitialized())
          }
          setAppLoading(false)
          return
        }
        
        // Normal online flow
        const user = await authService.getCurrentUser()
        
        if (user) {
          console.log('User session found, logging in automatically')
          dispatch(loginSuccess(user))
        } else {
          console.log('No active user session found')
          // Make sure to mark auth as initialized even when no user is found
          dispatch(authInitialized())
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        dispatch(authInitialized())
      } finally {
        setAppLoading(false)
      }
    }
    
    checkAuthStatus()
  }, [dispatch])
  
  // Check for achievements periodically when user is logged in
  useEffect(() => {
    if (!isAuthenticated || !user || !user.id) return
    
    // Check for achievements immediately on login
    dispatch(checkAchievements(user.id))
    
    // Then check periodically (every 5 minutes)
    const interval = setInterval(() => {
      dispatch(checkAchievements(user.id))
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [dispatch, isAuthenticated, user])
  
  if (appLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="contact" element={<Contact />} />
        <Route 
          path="profile" 
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } 
        />
        <Route 
          path="course/:courseId" 
          element={
            <PrivateRoute>
              <CourseDetail />
            </PrivateRoute>
          } 
        />
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="courses"
          element={
            <PrivateRoute>
              <Courses />
            </PrivateRoute>
          }
        />
        <Route
          path="game"
          element={
            <PrivateRoute>
              <GameInterface />
            </PrivateRoute>
          }
        />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route
          path="achievements"
          element={
            <PrivateRoute>
              <Achievements />
            </PrivateRoute>
          }
        />
        <Route
          path="settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route path="help" element={<Help />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App