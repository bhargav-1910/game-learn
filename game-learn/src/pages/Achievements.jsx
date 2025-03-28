import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import leaderboardService from '../services/leaderboardService'

// Icons for achievements
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

const Achievements = () => {
  const { user } = useSelector((state) => state.auth)
  const [earnedAchievements, setEarnedAchievements] = useState([])
  const [availableAchievements, setAvailableAchievements] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('earned')

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user || !user.id) return
      
      try {
        setLoading(true)
        
        // Get user's earned achievements
        const userAchievements = await leaderboardService.getUserAchievements(user.id)
        setEarnedAchievements(userAchievements || [])
        
        // Get all available achievements
        const allAchievements = await leaderboardService.getAvailableAchievements()
        
        // Get user statistics for progress tracking
        const userStats = await leaderboardService.getUserStatistics(user.id)
        setStats(userStats)
        
        // Filter out earned achievements
        const earnedIds = userAchievements.map(a => a.achievement_id)
        const notEarnedAchievements = allAchievements.filter(a => !earnedIds.includes(a.id))
        setAvailableAchievements(notEarnedAchievements)
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching achievements:', error)
        setLoading(false)
      }
    }
    
    fetchAchievements()
  }, [user])
  
  // Calculate progress towards an achievement
  const calculateProgress = (achievement) => {
    if (!stats) return 0
    
    const requirements = achievement.requirements || {}
    
    if (requirements.min_score) {
      return Math.min(100, Math.floor((stats.score / requirements.min_score) * 100))
    }
    
    if (requirements.streak_days) {
      return Math.min(100, Math.floor((stats.current_streak / requirements.streak_days) * 100))
    }
    
    if (requirements.lessons_completed) {
      return Math.min(100, Math.floor((stats.lessons_completed / requirements.lessons_completed) * 100))
    }
    
    if (requirements.quiz_score) {
      return Math.min(100, Math.floor((stats.highest_quiz_score / requirements.quiz_score) * 100))
    }
    
    return 0
  }
  
  // Get icon for achievement
  const getIcon = (iconName) => {
    return icons[iconName] || icons.default
  }
  
  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-900">
          Achievements
        </h1>
        <div className="bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('earned')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'earned'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Earned ({earnedAchievements.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'available'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Available ({availableAchievements.length})
          </button>
        </div>
      </div>
      
      {activeTab === 'earned' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {earnedAchievements.length === 0 ? (
            <div className="col-span-full bg-gray-50 rounded-xl p-8 text-center">
              <div className="mx-auto w-16 h-16 text-gray-400 mb-4">
                {icons.trophy}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Achievements Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Complete lessons, maintain streaks, and participate in challenges to earn your first achievement!
              </p>
            </div>
          ) : (
            earnedAchievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                <div className="bg-primary/10 p-4 flex items-center space-x-4">
                  <div className="bg-primary text-white p-3 rounded-full">
                    {getIcon(achievement.icon)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                    <p className="text-sm text-gray-500">Earned on {formatDate(achievement.earned_at)}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 mb-3">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {achievement.category && achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      +{achievement.points || 0} points
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableAchievements.length === 0 ? (
            <div className="col-span-full bg-gray-50 rounded-xl p-8 text-center">
              <div className="mx-auto w-16 h-16 text-gray-400 mb-4">
                {icons.star}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Achievements Earned!</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Congratulations! You've unlocked all available achievements. Check back later for new challenges.
              </p>
            </div>
          ) : (
            availableAchievements.map((achievement) => {
              const progress = calculateProgress(achievement);
              
              return (
                <div 
                  key={achievement.id} 
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                >
                  <div className="bg-gray-100 p-4 flex items-center space-x-4">
                    <div className="bg-gray-500 text-white p-3 rounded-full">
                      {getIcon(achievement.icon)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                      <p className="text-sm text-gray-500">{progress}% complete</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 mb-3">{achievement.description}</p>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {achievement.category && achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{achievement.points || 0} points
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Achievement Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-primary">{icons.trophy}</div>
              <h3 className="font-semibold text-gray-900">Bonus Points</h3>
            </div>
            <p className="text-gray-600">
              Each achievement earns you bonus points that boost your position on the leaderboard.
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-primary">{icons.star}</div>
              <h3 className="font-semibold text-gray-900">Unlock Features</h3>
            </div>
            <p className="text-gray-600">
              Some special features and content are unlocked by earning specific achievements.
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-primary">{icons.fire}</div>
              <h3 className="font-semibold text-gray-900">Track Progress</h3>
            </div>
            <p className="text-gray-600">
              Achievements help you track your learning journey and celebrate your milestones.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Achievements 