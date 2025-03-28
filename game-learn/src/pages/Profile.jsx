import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'
import courseService from '../services/courseService'
import leaderboardService from '../services/leaderboardService'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement)

const Profile = () => {
  const { user } = useSelector((state) => state.auth)
  const { badges, score, gameHistory } = useSelector((state) => state.game)
  const { completedLessons, statistics } = useSelector((state) => state.progress)
  
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [progressData, setProgressData] = useState([])
  const [achievements, setAchievements] = useState([])
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        
        // Fetch all courses
        const coursesData = await courseService.getCourses()
        setCourses(coursesData)
        
        // Fetch user progress across all courses
        if (user) {
          const progress = await courseService.getAllUserProgress(user.id)
          setProgressData(progress)
          
          // Fetch user achievements/badges
          const userAchievements = await leaderboardService.getUserAchievements(user.id) || []
          setAchievements(userAchievements)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Failed to load profile data:', error)
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [user])
  
  // Calculate completion statistics
  const calculateCompletionStats = () => {
    if (!progressData.length) return { completed: 0, total: 0, percentage: 0 }
    
    const completed = progressData.filter(p => p.progress?.completed).length
    const total = progressData.length
    const percentage = total ? Math.round((completed / total) * 100) : 0
    
    return { completed, total, percentage }
  }
  
  const stats = calculateCompletionStats()
  
  const chartData = {
    labels: ['Completed', 'In Progress'],
    datasets: [
      {
        data: [stats.completed, Math.max(stats.total - stats.completed, 0)],
        backgroundColor: ['#10B981', '#E5E7EB'],
        borderWidth: 0
      }
    ]
  }
  
  const performanceData = {
    labels: gameHistory.slice(-7).map(entry => new Date(entry.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Score',
        data: gameHistory.slice(-7).map(entry => entry.score),
        borderColor: '#4F46E5',
        tension: 0.4
      }
    ]
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-4xl">
            {user?.name?.charAt(0) || '?'}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-1">
              {user?.name || 'User'}
            </h1>
            <p className="text-gray-600 mb-2">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {achievements.slice(0, 3).map((badge, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                >
                  🏆 {badge.name}
                </span>
              ))}
              {achievements.length > 3 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  +{achievements.length - 3} more
                </span>
              )}
            </div>
          </div>
          <div className="md:ml-auto text-center md:text-right">
            <div className="text-3xl font-bold text-primary mb-1">{score}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h2>
          <div className="w-48 h-48 mx-auto">
            <Doughnut
              data={chartData}
              options={{
                cutout: '70%',
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
          </div>
          <p className="text-center mt-4 text-2xl font-bold text-primary">
            {stats.percentage}%
          </p>
          <p className="text-center text-gray-600">
            {stats.completed} of {stats.total} modules completed
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance</h2>
          <Line
            data={performanceData}
            options={{
              scales: {
                y: {
                  beginAtZero: true
                }
              },
              plugins: {
                legend: {
                  display: false
                }
              }
            }}
          />
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h2>
          {achievements.length > 0 ? (
            <div className="space-y-4">
              {achievements.map((badge, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary text-lg">🏆</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{badge.name}</p>
                    <p className="text-sm text-gray-600">{badge.description || 'Achievement unlocked!'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No achievements yet.</p>
              <p className="text-sm mt-1">Complete courses to earn badges!</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Courses</h2>
        
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => {
              // Count modules completed in this course
              const courseProgress = progressData.filter(p => p.course_id === course.id)
              const completedInCourse = courseProgress.filter(p => p.progress?.completed).length
              const moduleCount = courseProgress.length
              
              return (
                <Link 
                  key={course.id} 
                  to={`/course/${course.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors duration-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">{course.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.name}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        {moduleCount > 0 
                          ? `${completedInCourse}/${moduleCount} modules completed`
                          : 'Not started yet'}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-primary h-1.5 rounded-full" 
                          style={{ width: `${moduleCount ? (completedInCourse / moduleCount) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No courses available.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile 