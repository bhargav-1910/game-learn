import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { loginStart, loginSuccess, loginFailure, clearAuthErrors } from '../store/slices/authSlice'
import authService from '../services/authService'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, networkError, isAuthenticated } = useSelector((state) => state.auth)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  const [loginError, setLoginError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  // Network status listener
  useEffect(() => {
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => {
      setIsOffline(false)
      // Clear network-related errors when we come back online
      if (networkError) {
        dispatch(clearAuthErrors())
        setLoginError(null)
      }
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [dispatch, networkError])

  // Clear error on unmount
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearAuthErrors())
      }
    }
  }, [dispatch, error])

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    
    // Clear errors when user starts typing
    if (loginError || error) {
      setLoginError(null)
      if (error) {
        dispatch(clearAuthErrors())
      }
    }
  }

  const handleDemoLogin = async () => {
    setLoginError(null)
    dispatch(clearAuthErrors())
    dispatch(loginStart())

    try {
      const response = await authService.login('demo@example.com', 'password')
      dispatch(loginSuccess(response.user))
      navigate('/dashboard')
    } catch (err) {
      console.error('Demo login error:', err)
      dispatch(loginFailure(err.message))
      setLoginError(err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoginError(null)
    dispatch(clearAuthErrors())
    
    const email = formData.email.trim()
    const password = formData.password
    
    if (!email) {
      setLoginError('Email is required')
      return
    }
    
    if (!password) {
      setLoginError('Password is required')
      return
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setLoginError('Please enter a valid email address')
      return
    }
    
    dispatch(loginStart())

    try {
      const response = await authService.login(email, password)
      
      // Store user data in Redux
      dispatch(loginSuccess(response.user))
      
      // Navigate to dashboard after successful login
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      dispatch(loginFailure(err.message))
      setLoginError(err.message)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="max-w-md mx-auto card">
      {isOffline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded dark:bg-yellow-800 dark:border-yellow-600 dark:text-yellow-200">
          <p className="font-medium">You're currently offline.</p>
          <p className="text-sm">You can use the demo account to log in.</p>
        </div>
      )}

      {networkError && !isOffline && (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-4 rounded dark:bg-orange-800 dark:border-orange-600 dark:text-orange-200">
          <p className="font-medium">Network connection issue</p>
          <p className="text-sm">{error || "There's a problem connecting to the server."}</p>
          <p className="text-sm mt-1">You can try again or use the demo account below.</p>
        </div>
      )}

      <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6 text-center">
        Welcome Back
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input w-full"
            placeholder="Enter your email"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input w-full pr-10"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button 
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 dark:text-gray-400"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {loginError && !networkError && (
          <p className="text-error text-sm">{loginError}</p>
        )}
        
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4">
        <button
          onClick={handleDemoLogin}
          className="btn-secondary w-full"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Use Demo Account'}
        </button>
      </div>

      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary hover:text-primary/90">
          Create one
        </Link>
      </p>
      
      <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Demo Account:</p>
        <p>Email: demo@example.com</p>
        <p>Password: password</p>
      </div>
    </div>
  )
}

export default Login