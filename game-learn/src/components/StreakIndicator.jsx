import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import leaderboardService from '../services/leaderboardService'

const StreakIndicator = () => {
  const { user } = useSelector((state) => state.auth)
  const [streak, setStreak] = useState(0)
  const [lastActivity, setLastActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [calendarData, setCalendarData] = useState([])
  
  useEffect(() => {
    const fetchStreakData = async () => {
      if (!user || !user.id) return
      
      try {
        setLoading(true)
        
        // Get user statistics
        const stats = await leaderboardService.getUserStatistics(user.id)
        
        if (stats) {
          setStreak(stats.current_streak || 0)
          setLastActivity(stats.last_activity_date)
          
          // Generate calendar data
          generateCalendarData(stats.last_activity_date, stats.current_streak)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching streak data:', error)
        setLoading(false)
      }
    }
    
    fetchStreakData()
  }, [user])
  
  const generateCalendarData = (lastActivityDate, currentStreak) => {
    if (!lastActivityDate || currentStreak === 0) {
      setCalendarData([])
      return
    }
    
    // Parse last activity date
    const lastDate = new Date(lastActivityDate)
    const today = new Date()
    
    // Check if the streak is still active (activity within the last day)
    const isStreakActive = (today - lastDate) / (1000 * 60 * 60 * 24) < 1
    
    // Generate days for last 7 days
    const days = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      
      // Calculate if this day was part of the streak
      let status = 'inactive'
      
      if (isStreakActive) {
        // If streak is active, count back from today
        if (i < currentStreak && i <= 6) {
          status = 'active'
        }
      } else {
        // If streak is broken, count back from last activity
        const dayDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24)) - 
                        Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))
        
        if (dayDiff >= 0 && dayDiff < currentStreak) {
          status = 'active'
        }
      }
      
      // Current day gets special styling
      if (i === 0) {
        status = isStreakActive ? 'today-active' : 'today-inactive'
      }
      
      days.push({
        date: date.getDate(),
        day: dayNames[date.getDay()],
        status
      })
    }
    
    setCalendarData(days)
  }
  
  if (loading) {
    return <div className="h-12 w-full bg-gray-100 animate-pulse rounded-lg"></div>
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-primary/10 px-4 py-3">
        <h3 className="text-lg font-semibold text-gray-900">Your Learning Streak</h3>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="block text-3xl font-bold text-primary">{streak}</span>
            <span className="text-sm text-gray-500">days in a row</span>
          </div>
          
          {streak > 0 && (
            <div className="bg-primary/10 px-3 py-1 rounded-full">
              <div className="flex items-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
                <span className="text-sm font-medium">On fire!</span>
              </div>
            </div>
          )}
        </div>
        
        {calendarData.length > 0 && (
          <div className="grid grid-cols-7 gap-2">
            {calendarData.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{day.day}</div>
                <div 
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm ${
                    day.status === 'active' ? 'bg-primary text-white' :
                    day.status === 'today-active' ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' :
                    day.status === 'today-inactive' ? 'bg-gray-100 text-gray-700 ring-2 ring-gray-300 ring-offset-2' :
                    'bg-gray-100 text-gray-700'
                  }`}
                >
                  {day.date}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {streak === 0 && (
          <div className="text-center py-6">
            <div className="text-gray-400 mx-auto w-16 h-16 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600">Complete a lesson today to start your streak!</p>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-500">
          {streak > 0 ? (
            <p>Keep your streak alive by completing at least one lesson every day.</p>
          ) : (
            <p>Daily learning helps you retain information better and builds good habits.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default StreakIndicator 