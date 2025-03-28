import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import courseService from '../services/courseService'

const CourseList = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [userProgress, setUserProgress] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesData = await courseService.getCourses();
        console.log("Courses data:", coursesData);
        setCourses(coursesData);
        
        // Extract categories from courses
        const allCategories = [...new Set(coursesData.map(course => course.category || 'Uncategorized'))];
        setCategories(allCategories);
        
        // If user is logged in, fetch their progress
        if (user?.id) {
          try {
            const progressData = await courseService.getAllUserProgress(user.id);
            console.log("User progress:", progressData);
            
            // Convert to a more usable format
            const progressMap = {};
            progressData.forEach(item => {
              if (!progressMap[item.course_id]) {
                progressMap[item.course_id] = {
                  totalModules: 0,
                  completedModules: 0,
                  modules: {}
                };
              }
              
              progressMap[item.course_id].modules[item.module_id] = item.progress;
              if (item.progress?.completed) {
                progressMap[item.course_id].completedModules += 1;
              }
            });
            
            // Count total modules for each course
            coursesData.forEach(course => {
              if (progressMap[course.id]) {
                let totalModulesCount = 0;
                course.levels?.forEach(level => {
                  totalModulesCount += level.modules?.length || 0;
                });
                progressMap[course.id].totalModules = totalModulesCount;
              }
            });
            
            setUserProgress(progressMap);
          } catch (progressErr) {
            console.error("Error fetching user progress:", progressErr);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err.message || "Failed to load courses");
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  const filteredCourses = courses
    .filter(course => {
      if (filter === 'all') return true;
      return course.category === filter;
    })
    .filter(course => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        course.name.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    });

  const getProgressPercentage = (courseId) => {
    const progress = userProgress[courseId];
    if (!progress || progress.totalModules === 0) return 0;
    return Math.round((progress.completedModules / progress.totalModules) * 100);
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return { text: 'Beginner', color: 'bg-green-100 text-green-800' };
      case 'intermediate':
        return { text: 'Intermediate', color: 'bg-blue-100 text-blue-800' };
      case 'advanced':
        return { text: 'Advanced', color: 'bg-purple-100 text-purple-800' };
      default:
        return { text: 'All Levels', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 btn-secondary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No courses available at this time.</p>
      </div>
    );
  }

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <svg 
            className="absolute right-3 top-2.5 w-5 h-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                filter === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-600">No courses match your search criteria.</p>
          <button
            onClick={() => {
              setFilter('all');
              setSearchQuery('');
            }}
            className="mt-4 text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const progressPercent = getProgressPercentage(course.id);
            const difficulty = getDifficultyLabel(course.difficulty);
            const isStarted = progressPercent > 0;
            
            return (
              <div
                key={course.id || course.name}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                onClick={() => handleCourseClick(course.id || course.name.toLowerCase().replace(/\s+/g, '-'))}
              >
                {course.imageUrl && (
                  <div className="h-40 bg-gray-200 overflow-hidden">
                    <img 
                      src={course.imageUrl} 
                      alt={course.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <span className="text-4xl flex-shrink-0 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-lg">{course.icon}</span>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-display font-bold text-gray-900">
                          {course.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${difficulty.color}`}>
                          {difficulty.text}
                        </span>
                        {course.estimatedHours && (
                          <span className="text-xs text-gray-500">
                            {course.estimatedHours} hours
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mt-1">{course.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    {user && (
                      <div className="mb-3">
                        <div className="flex justify-between mb-1 text-xs">
                          <span className="text-gray-700">{isStarted ? 'Your progress' : 'Not started'}</span>
                          {isStarted && <span className="font-medium text-primary">{progressPercent}%</span>}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {course.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs text-gray-500">
                        {(course.levels?.length || 0)} levels · {course.modules || 0} modules
                      </span>
                      <button 
                        className="text-sm text-primary font-medium group-hover:underline"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent div's onClick
                          handleCourseClick(course.id || course.name.toLowerCase().replace(/\s+/g, '-'));
                        }}
                      >
                        {isStarted ? 'Continue' : 'Start learning'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

export default CourseList