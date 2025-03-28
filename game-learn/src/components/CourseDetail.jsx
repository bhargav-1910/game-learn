import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import courseService from '../services/courseService'

const CourseDetail = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [course, setCourse] = useState(null)
  const [activeLevel, setActiveLevel] = useState(null)
  const [userProgress, setUserProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [overallProgress, setOverallProgress] = useState(0)
  const [showModuleDetails, setShowModuleDetails] = useState({})
  const [nextRecommendedModule, setNextRecommendedModule] = useState(null)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    const fetchCourseData = async () => {
      if (!courseId) {
        setError('Invalid course ID')
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        console.log(`Fetching course data for ID: ${courseId}`)
        
        const courseData = await courseService.getCourse(courseId)
        console.log('Course data received:', courseData)
        
        if (!courseData) {
          setError(`Course not found: ${courseId}`)
          setLoading(false)
          return
        }
        
        setCourse(courseData)
        
        if (user) {
          try {
            const progress = await courseService.getUserProgress(user.id, courseId) || []
            console.log('User progress:', progress)
            setUserProgress(progress)
            
            // Calculate overall progress percentage
            let totalModules = 0
            let completedModules = 0
            
            courseData.levels?.forEach(level => {
              totalModules += level.modules?.length || 0
              
              level.modules?.forEach(module => {
                const moduleProgress = progress.find(p => p.module_id === module.id)
                if (moduleProgress?.progress?.completed) {
                  completedModules++
                }
              })
            })
            
            const progressPercentage = totalModules > 0 
              ? Math.round((completedModules / totalModules) * 100) 
              : 0
              
            setOverallProgress(progressPercentage)
            
            // Find next recommended module (first incomplete module)
            if (courseData.levels?.length > 0) {
              let foundRecommended = false
              
              for (const level of courseData.levels) {
                if (foundRecommended) break
                
                for (const module of level.modules || []) {
                  const moduleProgress = progress.find(p => p.module_id === module.id)
                  if (!moduleProgress?.progress?.completed) {
                    setNextRecommendedModule({
                      levelId: level.id,
                      moduleId: module.id,
                      moduleTitle: module.title,
                      levelTitle: level.title
                    })
                    foundRecommended = true
                    break
                  }
                }
              }
            }
          } catch (progressErr) {
            console.error('Failed to load user progress:', progressErr)
            // Continue even if progress loading fails
            setUserProgress([])
          }
        }
        
        if (courseData?.levels?.length > 0) {
          setActiveLevel(courseData.levels[0])
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Failed to load course:', err)
        setError(`Failed to load course content: ${err.message || 'Unknown error'}`)
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId, user, isAuthenticated, navigate])

  const handleLevelSelect = (level) => {
    setActiveLevel(level)
  }

  const handleStartModule = async (moduleId, exerciseId) => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      console.log(`Starting module: courseId=${courseId}, moduleId=${moduleId}`)
      setLoading(true) // Show loading state while module starts
      
      const progressData = {
        started: true,
        completed: false,
        lastAccessed: new Date().toISOString()
      }
      
      const result = await courseService.updateProgress(user.id, courseId, moduleId, progressData)
      console.log('Module progress updated:', result)
      
      // Update local progress state
      const updatedProgress = [...userProgress]
      const existingIndex = updatedProgress.findIndex(p => p.module_id === moduleId)
      
      if (existingIndex >= 0) {
        updatedProgress[existingIndex].progress = progressData
      } else {
        updatedProgress.push({
          user_id: user.id,
          course_id: courseId,
          module_id: moduleId,
          progress: progressData
        })
      }
      
      setUserProgress(updatedProgress)
      
      // Navigate to game interface with module context
      const urlParams = new URLSearchParams()
      urlParams.append('courseId', courseId)
      urlParams.append('moduleId', moduleId)
      if (exerciseId) urlParams.append('exerciseId', exerciseId)
      
      const gameURL = `/game?${urlParams.toString()}`
      console.log(`Navigating to: ${gameURL}`)
      setLoading(false)
      navigate(gameURL)
    } catch (err) {
      console.error('Failed to start module:', err)
      setError('Failed to start module: ' + (err.message || 'Unknown error'))
      setLoading(false)
    }
  }

  const toggleModuleDetails = (moduleId) => {
    setShowModuleDetails(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }))
  }

  const getModuleProgress = (moduleId) => {
    const moduleProgress = userProgress.find(p => p.module_id === moduleId)
    if (!moduleProgress) return { started: false, completed: false }
    return {
      started: moduleProgress.progress?.started || false,
      completed: moduleProgress.progress?.completed || false,
      lastAccessed: moduleProgress.progress?.lastAccessed
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-4 btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Course not found</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-4 btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative">
          {course.bannerUrl ? (
            <div className="h-48 md:h-64 bg-gray-200">
              <img 
                src={course.bannerUrl} 
                alt={course.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          ) : (
            <div className="h-48 md:h-64 bg-gradient-to-r from-primary/20 to-primary/5"></div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-4xl shadow-lg">
                {course.icon}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
                  {course.name}
                </h1>
                {course.author && (
                  <p className="text-white/90 text-sm">Created by {course.author}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <p className="text-gray-600">{course.description}</p>
              
              <div className="flex flex-wrap gap-3 mt-4">
                {course.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
                {course.difficulty && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    course.difficulty === 'beginner' ? 'bg-green-100 text-green-800' : 
                    course.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' : 
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end space-y-2">
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium text-gray-700">Course Progress</div>
                <div className="text-lg font-bold text-primary">{overallProgress}%</div>
              </div>
              <div className="w-full md:w-40 bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Quick Start Button - Show next recommended module */}
          {nextRecommendedModule && (
            <div className="bg-primary/10 p-4 rounded-lg mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className="text-primary font-semibold">Continue Learning</h3>
                  <p className="text-gray-700 text-sm">
                    Your next module: 
                    <span className="font-medium"> {nextRecommendedModule.moduleTitle}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleStartModule(nextRecommendedModule.moduleId)}
                  className="btn-primary mt-3 md:mt-0"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          )}
          
          {/* Level selection tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex overflow-x-auto space-x-4 no-scrollbar">
              {course.levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => handleLevelSelect(level)}
                  className={`px-4 py-2 border-b-2 whitespace-nowrap ${
                    activeLevel?.id === level.id
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {level.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Level Content */}
      {activeLevel && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {activeLevel.title}
            </h2>
            {activeLevel.description && (
              <p className="text-gray-600 mb-6">{activeLevel.description}</p>
            )}
            
            {/* Learning Path - Module Progression */}
            {activeLevel.modules && activeLevel.modules.length > 0 ? (
              <div className="space-y-4">
                {activeLevel.modules.map((module, index) => {
                  if (!module) return null;
                  
                  const { started, completed } = getModuleProgress(module.id);
                  const isExpanded = showModuleDetails[module.id];
                  
                  return (
                    <div
                      key={module.id}
                      className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                        completed 
                          ? 'border-green-500 bg-green-50' 
                          : started
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => toggleModuleDetails(module.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex space-x-3">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              completed ? 'bg-green-500 text-white' : 
                              started ? 'bg-primary text-white' :
                              'bg-gray-200 text-gray-500'
                            }`}>
                              {completed ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {module.title || 'Untitled Module'}
                              </h3>
                              <p className="text-gray-600 text-sm">{module.content || 'No description available.'}</p>
                            </div>
                          </div>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-5 w-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Exercises - Expanded View */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 p-4 bg-white/50">
                          <div className="space-y-4">
                            {module.exercises && module.exercises.length > 0 ? (
                              module.exercises.map((exercise) => {
                                if (!exercise) return null;
                                
                                return (
                                  <div
                                    key={exercise.id}
                                    className="bg-white rounded-lg shadow-sm p-4"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-medium text-gray-900 mb-1">
                                          {exercise.title || 'Untitled Exercise'}
                                        </h4>
                                        <p className="text-gray-600 text-sm mb-2">
                                          {exercise.description || 'No description available.'}
                                        </p>
                                        <div className="flex items-center space-x-4 text-sm">
                                          <span className="text-primary">
                                            {exercise.points || 0} points
                                          </span>
                                          {exercise.estimatedTime && (
                                            <span className="text-gray-500">
                                              {exercise.estimatedTime} mins
                                            </span>
                                          )}
                                          {exercise.type && (
                                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs">
                                              {exercise.type}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleStartModule(module.id, exercise.id)}
                                        className={`${completed ? 'btn-secondary' : started ? 'btn-primary' : 'btn-secondary'} text-sm whitespace-nowrap`}
                                      >
                                        {completed ? 'Review' : started ? 'Continue' : 'Start'}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-gray-500 text-center py-4">No exercises available for this module.</p>
                            )}
                          </div>
                          
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => handleStartModule(module.id)}
                              className={`${completed ? 'btn-secondary' : 'btn-primary'}`}
                            >
                              {completed ? 'Review Module' : started ? 'Continue Module' : 'Start Module'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No modules available for this level.</p>
            )}
          </div>
          
          {/* Additional Course Resources */}
          {course.resources && course.resources.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Additional Resources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      resource.type === 'video' ? 'bg-red-100 text-red-600' :
                      resource.type === 'article' ? 'bg-blue-100 text-blue-600' :
                      resource.type === 'book' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {resource.type === 'video' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                          <path fillRule="evenodd" d="M12 5a1 1 0 011 1v8a1 1 0 01-1 1h7a1 1 0 001-1V6a1 1 0 00-1-1h-7z" clipRule="evenodd" />
                        </svg>
                      )}
                      {resource.type === 'article' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                          <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                        </svg>
                      )}
                      {!resource.type || resource.type === 'link' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-900">{resource.title}</h4>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CourseDetail