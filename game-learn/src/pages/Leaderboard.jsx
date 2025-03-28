import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setPlayers, updateTimeFilter, updateSortBy, setLoading, setError } from '../store/slices/leaderboardSlice'
import leaderboardService from '../services/leaderboardService'

const Leaderboard = () => {
  const dispatch = useDispatch()
  const { players, timeFilter, sortBy, loading, error } = useSelector((state) => state.leaderboard)
  const { user } = useSelector((state) => state.auth)
  const [userRank, setUserRank] = useState(null)
  const [improvedPlayers, setImprovedPlayers] = useState([])
  const [viewMode, setViewMode] = useState('global') // 'global' or 'friends'
  const [loadingState, setLoadingState] = useState({
    leaderboard: true,
    userRank: true,
    improvedPlayers: true
  })

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        dispatch(setLoading(true))
        setLoadingState(prevState => ({
          ...prevState,
          leaderboard: true
        }))
        
        let data
        if (viewMode === 'friends' && user && user.id) {
          data = await leaderboardService.getFriendsLeaderboard(user.id)
        } else {
          data = await leaderboardService.getLeaderboard(timeFilter, sortBy)
        }
        
        dispatch(setPlayers(data))
        setLoadingState(prevState => ({
          ...prevState,
          leaderboard: false
        }))
        
        // If user is logged in, get their rank
        if (user && user.id) {
          setLoadingState(prevState => ({
            ...prevState,
            userRank: true
          }))
          try {
            const rankData = await leaderboardService.getUserRank(user.id)
            setUserRank(rankData)
          } catch (rankErr) {
            console.error('Error fetching user rank:', rankErr)
            // Set a default rank object if we couldn't fetch it
            setUserRank({
              user_id: user.id,
              rank: '-',
              totalPlayers: 0,
              score: 0,
              max_streak: 0,
              completion_rate: 0
            })
          } finally {
            setLoadingState(prevState => ({
              ...prevState,
              userRank: false
            }))
          }
        }
        
        // Get most improved players
        setLoadingState(prevState => ({
          ...prevState,
          improvedPlayers: true
        }))
        try {
          const improved = await leaderboardService.getMostImprovedPlayers(3, timeFilter)
          setImprovedPlayers(improved)
        } catch (impErr) {
          console.error('Error fetching improved players:', impErr)
          setImprovedPlayers([])
        } finally {
          setLoadingState(prevState => ({
            ...prevState,
            improvedPlayers: false
          }))
        }
        
        dispatch(setLoading(false))
      } catch (err) {
        console.error('Leaderboard fetch error:', err)
        dispatch(setError(err.message))
        setLoadingState({
          leaderboard: false,
          userRank: false,
          improvedPlayers: false
        })
      }
    }

    fetchLeaderboardData()

    // Subscribe to real-time updates
    const unsubscribe = leaderboardService.subscribeToUpdates((data) => {
      dispatch(setPlayers(data))
    })

    return () => unsubscribe()
  }, [dispatch, timeFilter, sortBy, user, viewMode])

  const handleTimeFilterChange = (value) => {
    dispatch(updateTimeFilter(value))
  }

  const handleSortByChange = (value) => {
    dispatch(updateSortBy(value))
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
  }

  const handleRetry = () => {
    dispatch(setError(null))
    window.location.reload()
  }

  if (loading && loadingState.leaderboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-gray-600 mb-6">
          There was a problem loading the leaderboard. Please try again.
        </p>
        <button
          onClick={handleRetry}
          className="btn-secondary"
        >
          Retry
        </button>
      </div>
    )
  }

  const leaderboardData = players || []

  const filterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ]

  const sortOptions = [
    { value: 'score', label: 'Total Score' },
    { value: 'streak', label: 'Longest Streak' },
    { value: 'completion', label: 'Completion Rate' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
          Leaderboard
        </h1>
        <div className="flex flex-wrap gap-4">
          {/* View mode toggle */}
          {user && (
            <div className="flex rounded-md overflow-hidden">
              <button
                onClick={() => handleViewModeChange('global')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'global'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Global
              </button>
              <button
                onClick={() => handleViewModeChange('friends')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'friends'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Friends
              </button>
            </div>
          )}
          
          {/* Filters */}
          <select
            value={timeFilter}
            onChange={(e) => handleTimeFilterChange(e.target.value)}
            className="input bg-white dark:bg-gray-800"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value)}
            className="input bg-white dark:bg-gray-800"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Show message if there's no leaderboard data at all */}
      {leaderboardData.length === 0 && !loadingState.leaderboard && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {viewMode === 'friends' ? 'No Friends on Leaderboard Yet' : 'No Leaderboard Data Available'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {viewMode === 'friends'
              ? 'Add friends to see how you compare with them on the leaderboard.'
              : 'Be the first to complete lessons and earn your place at the top!'}
          </p>
          {viewMode === 'friends' && (
            <button 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
              onClick={() => {
                // Navigate to friends page or open add friends modal
                console.log('Navigate to find friends page')
              }}
            >
              Find Friends
            </button>
          )}
        </div>
      )}

      {/* User's personal stats card - show loading state or data */}
      {user && (
        <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Stats</h2>
          
          {loadingState.userRank ? (
            <div className="flex justify-center py-6">
              <div className="animate-pulse w-full">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Your Rank</p>
                <p className="text-2xl font-bold text-primary">
                  {userRank?.rank === '-' ? 'Not ranked' : `${userRank?.rank || '-'} / ${userRank?.totalPlayers || '-'}`}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Your Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{(userRank?.score || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Longest Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userRank?.max_streak || 0} days</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userRank?.completion_rate || 0}%</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Loading state for leaderboard */}
      {loadingState.leaderboard ? (
        <div className="animate-pulse">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="border dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Main leaderboard table */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          {leaderboardData.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Streak
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Completion
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Badges
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {leaderboardData.map((player) => (
                  <tr 
                    key={player.id} 
                    className={`${player.user_id === user?.id ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`
                          flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium
                          ${player.rank === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' : 
                            player.rank === 2 ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' : 
                            player.rank === 3 ? 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100' :
                            'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}
                        `}>
                          {player.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {(player.name || 'User').charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {player.name || 'User'}
                            {player.user_id === user?.id && (
                              <span className="ml-2 text-xs text-primary">(You)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">{player.score?.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900 dark:text-white">{player.max_streak || 0} days</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900 dark:text-white">{player.completion_rate || 0}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(player.badges) && player.badges.length > 0 ? (
                          player.badges.slice(0, 3).map((badge, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 dark:bg-primary/20 text-primary">
                              {badge}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">No badges yet</span>
                        )}
                        {Array.isArray(player.badges) && player.badges.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            +{player.badges.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {viewMode === 'friends' 
                ? 'No friends on the leaderboard yet' 
                : 'No leaderboard data available'}
            </div>
          )}
        </div>
      )}

      <div className="bg-primary/5 rounded-xl p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">How Rankings Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Score Points</h3>
            <p className="text-gray-600">
              Earn points by completing lessons, solving puzzles, and maintaining daily
              streaks. Higher difficulty levels award more points.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Streaks</h3>
            <p className="text-gray-600">
              Keep your learning streak alive by completing at least one lesson every
              day. Longer streaks earn bonus points and special badges.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Badges</h3>
            <p className="text-gray-600">
              Unlock badges by achieving specific milestones, mastering topics, and
              demonstrating exceptional performance in challenges.
            </p>
          </div>
        </div>
      </div>

      {/* Most Improved Players Section */}
      {improvedPlayers.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-8">
          <div className="px-6 py-4 bg-green-50 border-b border-green-100">
            <h2 className="text-xl font-semibold text-gray-900">Most Improved Players</h2>
            <p className="text-sm text-gray-600">Players who have made the biggest improvements recently</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {improvedPlayers.map((player, index) => (
              <div key={player.user_id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-green-500' : index === 1 ? 'bg-green-400' : 'bg-green-300'
                  } text-white font-bold`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{player.name || `Player ${player.user_id}`}</p>
                    <p className="text-sm text-gray-500">
                      {player.improvement > 0 
                        ? `+${player.improvement.toLocaleString()} points` 
                        : `${player.improvement.toLocaleString()} points`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {player.improvement_percent > 0 
                      ? `+${player.improvement_percent.toFixed(1)}%` 
                      : `${player.improvement_percent.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaderboard