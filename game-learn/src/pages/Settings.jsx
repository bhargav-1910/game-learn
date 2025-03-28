import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateStatistics } from '../store/slices/progressSlice'
import { updateSettings } from '../store/slices/settingsSlice'

const Settings = () => {
  const dispatch = useDispatch()
  const { statistics } = useSelector((state) => state.progress)
  const appSettings = useSelector((state) => state.settings)
  const [settings, setSettings] = useState({
    difficulty: 'medium',
    soundEnabled: true,
    notificationsEnabled: true,
    questionTimer: 30,
    language: 'en'
  })

  // Initialize settings from redux store
  useEffect(() => {
    setSettings({
      difficulty: appSettings.difficulty,
      soundEnabled: appSettings.soundEnabled,
      notificationsEnabled: appSettings.notificationsEnabled,
      questionTimer: appSettings.questionTimer,
      language: appSettings.language
    })
  }, [appSettings])

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }))

    // Update settings in redux
    dispatch(updateSettings({ [setting]: value }))
  }

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ]

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' }
  ]

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-display font-bold text-gray-900 mb-8">
        Settings
      </h2>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Game Settings</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={settings.difficulty}
                onChange={(e) => handleSettingChange('difficulty', e.target.value)}
                className="input w-full bg-white"
              >
                {difficultyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Timer (seconds)
              </label>
              <input
                type="number"
                value={settings.questionTimer}
                onChange={(e) => handleSettingChange('questionTimer', parseInt(e.target.value))}
                min="10"
                max="60"
                className="input w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="soundEnabled"
                checked={settings.soundEnabled}
                onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                className="h-4 w-4 text-primary border-gray-300 rounded"
              />
              <label htmlFor="soundEnabled" className="ml-2 text-sm text-gray-700">
                Enable Sound Effects
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notificationsEnabled"
                checked={settings.notificationsEnabled}
                onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                className="h-4 w-4 text-primary border-gray-300 rounded"
              />
              <label htmlFor="notificationsEnabled" className="ml-2 text-sm text-gray-700">
                Enable Notifications
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Display Settings</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="input w-full bg-white"
            >
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Time Spent</p>
              <p className="font-semibold text-gray-900">{statistics.totalTimeSpent} hours</p>
            </div>
            <div>
              <p className="text-gray-600">Average Score</p>
              <p className="font-semibold text-gray-900">{statistics.averageScore}</p>
            </div>
            <div>
              <p className="text-gray-600">Completion Rate</p>
              <p className="font-semibold text-gray-900">{statistics.completionRate}%</p>
            </div>
            <div>
              <p className="text-gray-600">Streak Days</p>
              <p className="font-semibold text-gray-900">{statistics.streakDays} days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings