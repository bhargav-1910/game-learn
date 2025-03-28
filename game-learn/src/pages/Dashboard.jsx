import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'
import CourseList from '../components/CourseList'
import StreakIndicator from '../components/StreakIndicator'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement)

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const { completedLessons, statistics, achievements, recommendations } = useSelector((state) => state.progress)
  const { score, badges, gameHistory } = useSelector((state) => state.game)

  const progressData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [statistics.completionRate || 0, 100 - (statistics.completionRate || 0)],
        backgroundColor: ['#10B981', '#E5E7EB'],
        borderWidth: 0
      }
    ]
  }

  const performanceData = {
    labels: (gameHistory || []).slice(-7).map(entry => new Date(entry?.timestamp || Date.now()).toLocaleDateString()),
    datasets: [
      {
        label: 'Score',
        data: (gameHistory || []).slice(-7).map(entry => entry?.score || 0),
        borderColor: '#4F46E5',
        tension: 0.4
      }
    ]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-900">
          Welcome back, {user?.name || 'Learner'}!
        </h1>
        <Link to="/courses" className="btn-primary">
          Continue Learning
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <StreakIndicator />
        </div>
        
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-primary/10 px-4 py-3">
            <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="font-bold text-3xl text-primary">{statistics.completedLessons || 0}</div>
                <div className="text-sm text-gray-500">Lessons Completed</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-3xl text-primary">{score || 0}</div>
                <div className="text-sm text-gray-500">Total Score</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-3xl text-primary">{badges?.length || 0}</div>
                <div className="text-sm text-gray-500">Badges Earned</div>
              </div>
            </div>
            <div className="mt-6 h-40">
              <Line data={performanceData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-display font-bold text-gray-900 mb-4">
          Available Courses
        </h2>
        <CourseList />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
          <div className="w-48 h-48 mx-auto">
            <Doughnut
              data={progressData}
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
            {statistics?.completionRate || 0}%
          </p>
          <p className="text-center text-gray-600">
            Course Completion
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance</h3>
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

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
          <div className="space-y-4">
            {(badges || []).map((badge, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-lg">🏆</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{badge.name}</p>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                </div>
              </div>
            ))}
            {(!badges || badges.length === 0) && (
              <div className="text-center py-6 text-gray-500">
                <p>No achievements yet.</p>
                <p className="text-sm mt-1">Complete courses to earn badges!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Path</h3>
          <div className="space-y-4">
            {(recommendations || []).map((recommendation, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">{index + 1}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{recommendation.title}</p>
                  <p className="text-sm text-gray-600">{recommendation.description}</p>
                </div>
              </div>
            ))}
            {(!recommendations || recommendations.length === 0) && (
              <div className="text-center py-6 text-gray-500">
                <p>No recommendations yet.</p>
                <p className="text-sm mt-1">Start learning to get personalized recommendations!</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-primary">{statistics?.streakDays || 0}</p>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{(completedLessons || []).length}</p>
              <p className="text-sm text-gray-600">Lessons Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{score || 0}</p>
              <p className="text-sm text-gray-600">Total Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{Math.round(statistics?.averageScore || 0)}</p>
              <p className="text-sm text-gray-600">Average Score</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard