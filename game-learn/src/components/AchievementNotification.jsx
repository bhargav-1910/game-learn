import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { clearNewlyAwarded } from '../store/slices/achievementsSlice'

// Icons for achievements (same as in Achievements.jsx)
const icons = {
  trophy: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  star: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  fire: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
  users: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  footprints: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  default: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

const AchievementNotification = () => {
  const dispatch = useDispatch()
  const { newlyAwarded } = useSelector((state) => state.achievements)
  const [currentAchievement, setCurrentAchievement] = useState(null)
  const [visible, setVisible] = useState(false)
  
  // Get icon for achievement
  const getIcon = (iconName) => {
    return icons[iconName] || icons.default
  }

  useEffect(() => {
    // If there are newly awarded achievements, show them one by one
    if (newlyAwarded.length > 0 && !currentAchievement) {
      setCurrentAchievement(newlyAwarded[0])
      setVisible(true)
      
      // Set a timer to clear this achievement from the display
      const timer = setTimeout(() => {
        setVisible(false)
        
        // After animation out, remove from state
        setTimeout(() => {
          const remainingAchievements = [...newlyAwarded].slice(1)
          
          // If no more achievements, clear them from Redux
          if (remainingAchievements.length === 0) {
            dispatch(clearNewlyAwarded())
          }
          
          setCurrentAchievement(null)
        }, 500) // Match this with CSS transition duration
      }, 5000) // Show for 5 seconds
      
      return () => clearTimeout(timer)
    }
  }, [newlyAwarded, currentAchievement, dispatch])
  
  if (!currentAchievement) return null
  
  return (
    <div 
      className={`fixed bottom-6 right-6 w-80 bg-white shadow-lg rounded-lg overflow-hidden transform transition-all duration-500 ease-in-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ zIndex: 50 }}
    >
      <div className="bg-primary/10 px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Achievement Unlocked!
        </h3>
        <button 
          onClick={() => setVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-center space-x-4">
          <div className="bg-primary text-white p-3 rounded-full">
            {getIcon(currentAchievement.icon)}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{currentAchievement.name}</h4>
            <p className="text-sm text-gray-600">{currentAchievement.description}</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            +{currentAchievement.points || 0} points
          </span>
          <Link 
            to="/achievements" 
            className="text-sm text-primary hover:text-primary-dark"
          >
            View all achievements
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AchievementNotification 