import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { loginStart, loginSuccess, loginFailure, clearAuthErrors } from '../store/slices/authSlice'
import authService from '../services/authService'

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, networkError, isAuthenticated } = useSelector((state) => state.auth)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [formErrors, setFormErrors] = useState({})
  const [registrationError, setRegistrationError] = useState(null)

  // Network status listener
  useEffect(() => {
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => {
      setIsOffline(false)
      // Clear network-related errors when we come back online
      if (networkError) {
        dispatch(clearAuthErrors())
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
    // Clear error when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      })
    }

    // Clear global errors when user types
    if (registrationError || error) {
      setRegistrationError(null)
      if (error) {
        dispatch(clearAuthErrors())
      }
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid'
    }
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    return errors
  }

  const goToLogin = () => {
    dispatch(clearAuthErrors())
    navigate('/login')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setRegistrationError(null)
    dispatch(clearAuthErrors())
    
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    dispatch(loginStart())

    try {
      const response = await authService.register(formData.name, formData.email, formData.password)
      
      // Store user data in Redux
      dispatch(loginSuccess(response.user))
      
      // Navigate to dashboard after successful registration
      navigate('/dashboard')
    } catch (err) {
      dispatch(loginFailure(err.message))
      setRegistrationError(err.message)
    }
  }

  return (
    <div className="max-w-md mx-auto card">
      {isOffline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded dark:bg-yellow-800 dark:border-yellow-600 dark:text-yellow-200">
          <p className="font-medium">You're currently offline.</p>
          <p className="text-sm">Registration may not work properly. Consider signing in with the demo account instead.</p>
          <button 
            onClick={goToLogin} 
            className="text-primary font-medium mt-1 block"
          >
            Go to Login
          </button>
        </div>
      )}

      {networkError && !isOffline && (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-4 rounded dark:bg-orange-800 dark:border-orange-600 dark:text-orange-200">
          <p className="font-medium">Network connection issue</p>
          <p className="text-sm">{error || "There's a problem connecting to the server."}</p>
          <p className="text-sm mt-1">Please try again later or use the demo account on the login page.</p>
          <button 
            onClick={goToLogin} 
            className="text-primary font-medium mt-1 block"
          >
            Go to Login
          </button>
        </div>
      )}

      <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6 text-center">
        Create Your Account
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input w-full ${formErrors.name ? 'border-error' : ''}`}
            placeholder="Enter your name"
          />
          {formErrors.name && (
            <p className="text-error text-sm mt-1">{formErrors.name}</p>
          )}
        </div>
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
            className={`input w-full ${formErrors.email ? 'border-error' : ''}`}
            placeholder="Enter your email"
            autoComplete="email"
          />
          {formErrors.email && (
            <p className="text-error text-sm mt-1">{formErrors.email}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`input w-full ${formErrors.password ? 'border-error' : ''}`}
            placeholder="Create a password"
            autoComplete="new-password"
          />
          {formErrors.password && (
            <p className="text-error text-sm mt-1">{formErrors.password}</p>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`input w-full ${formErrors.confirmPassword ? 'border-error' : ''}`}
            placeholder="Confirm your password"
            autoComplete="new-password"
          />
          {formErrors.confirmPassword && (
            <p className="text-error text-sm mt-1">{formErrors.confirmPassword}</p>
          )}
        </div>
        {registrationError && !networkError && (
          <p className="text-error text-sm">{registrationError}</p>
        )}
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:text-primary/90">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default Register