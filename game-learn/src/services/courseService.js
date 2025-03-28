import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

class CourseService {
  constructor() {
    this.courses = {
      python: {
        name: 'Python Programming',
        description: 'Learn Python from basics to advanced concepts including data structures, algorithms, and web development',
        icon: '🐍',
        author: 'Python Learning Team',
        difficulty: 'beginner',
        estimatedHours: 30,
        tags: ['Programming', 'Backend', 'Data Science'],
        bannerUrl: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        prerequisites: [
          { title: 'Basic computer skills', required: true },
          { title: 'Problem-solving mindset', required: true },
          { title: 'Mathematics knowledge', required: false }
        ],
        learningOutcomes: [
          'Write Python code to solve real-world problems',
          'Work with Python data structures and algorithms',
          'Understand object-oriented programming concepts',
          'Build web applications using Python frameworks',
          'Connect to and manipulate databases'
        ],
        resources: [
          {
            title: 'Python Documentation',
            description: 'Official Python language documentation',
            url: 'https://docs.python.org/3/',
            type: 'article'
          },
          {
            title: 'Intro to Python Video Series',
            description: 'A comprehensive video series on Python basics',
            url: 'https://www.youtube.com/watch?v=JJmcL1N2KQs',
            type: 'video'
          },
          {
            title: 'Python Crash Course (Book)',
            description: 'A hands-on, project-based introduction to Python',
            url: 'https://nostarch.com/pythoncrashcourse2e',
            type: 'book'
          }
        ],
        levels: [
          {
            id: 'py-beginner',
            title: 'Python Basics',
            modules: [
              {
                id: 'py-intro',
                title: 'Introduction to Python',
                content: 'Learn about Python syntax, variables, and basic data types. Python is a high-level, interpreted programming language known for its readability and simplicity.',
                estimatedTime: 60, // in minutes
                learningOutcomes: [
                  'Install Python and set up a development environment',
                  'Understand Python syntax and structure',
                  'Work with basic data types and variables',
                  'Use the Python REPL for interactive coding'
                ],
                exercises: [
                  {
                    id: 'py-ex1',
                    title: 'Variables and Data Types',
                    description: 'Practice working with Python variables and data types including strings, integers, floats, and booleans.',
                    points: 100,
                    estimatedTime: 30, // in minutes
                    type: 'practice'
                  },
                  {
                    id: 'py-ex2',
                    title: 'Basic Operations',
                    description: 'Learn to perform mathematical operations and string manipulations in Python.',
                    points: 120,
                    estimatedTime: 30,
                    type: 'challenge'
                  }
                ]
              },
              {
                id: 'py-control',
                title: 'Control Flow',
                content: 'Master if statements, loops, and conditional logic to control program execution flow in Python.',
                estimatedTime: 90,
                learningOutcomes: [
                  'Write conditional statements using if, elif, and else',
                  'Create and control loops with for and while',
                  'Use logical operators for complex conditions',
                  'Implement control flow in real applications'
                ],
                exercises: [
                  {
                    id: 'py-ex3',
                    title: 'Loops and Conditions',
                    description: 'Create programs using for loops, while loops, and if-else conditional statements.',
                    points: 150,
                    estimatedTime: 45,
                    type: 'practice'
                  },
                  {
                    id: 'py-ex4',
                    title: 'List Comprehensions',
                    description: 'Learn to use list comprehensions for concise and powerful list manipulations.',
                    points: 180,
                    estimatedTime: 45,
                    type: 'challenge'
                  }
                ]
              }
            ]
          },
          {
            id: 'py-intermediate',
            title: 'Intermediate Python',
            modules: [
              {
                id: 'py-functions',
                title: 'Functions and Modules',
                content: 'Learn to create reusable code with functions and modules. Organize your code efficiently for better maintainability.',
                estimatedTime: 120,
                learningOutcomes: [
                  'Create and call functions with parameters and return values',
                  'Work with default arguments and variable-length parameters',
                  'Organize code into modules and packages',
                  'Use Python\'s standard library effectively'
                ],
                exercises: [
                  {
                    id: 'py-ex5',
                    title: 'Function Creation',
                    description: 'Build custom functions with parameters, return values, and default arguments.',
                    points: 200,
                    estimatedTime: 60,
                    type: 'practice'
                  },
                  {
                    id: 'py-ex6',
                    title: 'Working with Modules',
                    description: 'Learn to import and use modules, create your own modules, and work with packages.',
                    points: 220,
                    estimatedTime: 60,
                    type: 'project'
                  }
                ]
              },
              {
                id: 'py-data-structures',
                title: 'Data Structures',
                content: 'Master Python data structures like lists, dictionaries, sets, and tuples to efficiently store and process data.',
                estimatedTime: 150,
                learningOutcomes: [
                  'Choose appropriate data structures for different problems',
                  'Manipulate complex nested data structures',
                  'Optimize code using efficient data structure operations',
                  'Implement common algorithms using Python data structures'
                ],
                exercises: [
                  {
                    id: 'py-ex7',
                    title: 'Working with Lists and Dictionaries',
                    description: 'Practice manipulating lists and dictionaries for data storage and retrieval.',
                    points: 230,
                    estimatedTime: 75,
                    type: 'practice'
                  },
                  {
                    id: 'py-ex8',
                    title: 'Advanced Data Structure Operations',
                    description: 'Learn complex operations and algorithms using Python data structures.',
                    points: 250,
                    estimatedTime: 75,
                    type: 'challenge'
                  }
                ]
              }
            ]
          },
          {
            id: 'py-advanced',
            title: 'Advanced Python',
            modules: [
              {
                id: 'py-oop',
                title: 'Object-Oriented Programming',
                content: 'Learn object-oriented programming principles in Python, including classes, inheritance, and polymorphism.',
                estimatedTime: 180,
                learningOutcomes: [
                  'Design and implement Python classes',
                  'Apply inheritance for code reuse',
                  'Use polymorphism and duck typing',
                  'Implement special methods for customized object behavior'
                ],
                exercises: [
                  {
                    id: 'py-ex9',
                    title: 'Creating Classes',
                    description: 'Design and implement classes with attributes and methods in Python.',
                    points: 300,
                    estimatedTime: 90,
                    type: 'practice'
                  },
                  {
                    id: 'py-ex10',
                    title: 'Inheritance and Polymorphism',
                    description: 'Master inheritance hierarchies and polymorphic behavior in Python classes.',
                    points: 320,
                    estimatedTime: 90,
                    type: 'project'
                  }
                ]
              },
              {
                id: 'py-advanced-topics',
                title: 'Advanced Topics',
                content: 'Explore advanced Python features like decorators, generators, context managers, and more.',
                estimatedTime: 240,
                learningOutcomes: [
                  'Create and use decorators for metaprogramming',
                  'Build generators for memory-efficient data processing',
                  'Implement context managers for resource management',
                  'Apply advanced Python features to real-world problems'
                ],
                exercises: [
                  {
                    id: 'py-ex11',
                    title: 'Decorators and Generators',
                    description: 'Learn to use and create decorators and generators for advanced Python programming.',
                    points: 350,
                    estimatedTime: 120,
                    type: 'challenge'
                  },
                  {
                    id: 'py-ex12',
                    title: 'Context Managers and Special Methods',
                    description: 'Master context managers with the with statement and implement special methods.',
                    points: 380,
                    estimatedTime: 120,
                    type: 'project'
                  }
                ]
              }
            ]
          }
        ]
      },
      webdev: {
        name: 'HTML & CSS',
        description: 'Master web development fundamentals including responsive design, CSS frameworks, and modern layout techniques',
        icon: '🌐',
        author: 'Web Design Team',
        difficulty: 'beginner',
        estimatedHours: 25,
        tags: ['Frontend', 'Web Design', 'UI/UX'],
        bannerUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        prerequisites: [
          { title: 'Basic computer skills', required: true },
          { title: 'Basic internet knowledge', required: true }
        ],
        learningOutcomes: [
          'Build responsive web pages from scratch',
          'Style web content effectively with CSS',
          'Create modern layouts using Flexbox and Grid',
          'Implement interactive elements with CSS animations',
          'Structure content semantically using HTML5'
        ],
        resources: [
          {
            title: 'MDN Web Docs',
            description: 'Comprehensive web development documentation',
            url: 'https://developer.mozilla.org/',
            type: 'article'
          },
          {
            title: 'CSS Crash Course',
            description: 'A quick introduction to CSS styling',
            url: 'https://www.youtube.com/watch?v=yfoY53QXEnI',
            type: 'video'
          },
          {
            title: 'HTML & CSS Design and Build Websites',
            description: 'Popular book on HTML and CSS fundamentals',
            url: 'https://www.htmlandcssbook.com/',
            type: 'book'
          }
        ],
        levels: [
          {
            id: 'web-beginner',
            title: 'Web Fundamentals',
            modules: [
              {
                id: 'html-basics',
                title: 'HTML Basics',
                content: 'Learn HTML tags, elements, and document structure to build the foundation of web pages.',
                estimatedTime: 90,
                learningOutcomes: [
                  'Structure web content with HTML elements',
                  'Create valid HTML documents with proper syntax',
                  'Use semantic HTML for better accessibility',
                  'Link between pages and external resources'
                ],
                exercises: [
                  {
                    id: 'html-ex1',
                    title: 'Creating Web Pages',
                    description: 'Build your first web page using HTML tags and elements.',
                    points: 100,
                    estimatedTime: 45,
                    type: 'practice'
                  },
                  {
                    id: 'html-ex2',
                    title: 'HTML Forms and Tables',
                    description: 'Create forms for user input and tables for organizing data.',
                    points: 120,
                    estimatedTime: 45,
                    type: 'project'
                  }
                ]
              },
              {
                id: 'css-basics',
                title: 'CSS Fundamentals',
                content: 'Style web pages using CSS selectors and properties to create attractive layouts.',
                estimatedTime: 120,
                learningOutcomes: [
                  'Apply CSS styles using different selector types',
                  'Work with the CSS box model for layout',
                  'Implement typography with CSS',
                  'Use colors and backgrounds effectively'
                ],
                exercises: [
                  {
                    id: 'css-ex1',
                    title: 'Styling Elements',
                    description: 'Apply CSS styles to HTML elements including colors, fonts, and borders.',
                    points: 150,
                    estimatedTime: 60,
                    type: 'practice'
                  },
                  {
                    id: 'css-ex2',
                    title: 'CSS Box Model',
                    description: 'Master the CSS box model with margins, padding, borders, and dimensions.',
                    points: 170,
                    estimatedTime: 60,
                    type: 'challenge'
                  }
                ]
              }
            ]
          },
          {
            id: 'web-intermediate',
            title: 'Advanced Web Design',
            modules: [
              {
                id: 'css-layout',
                title: 'CSS Layout',
                content: 'Master modern layout techniques using flexbox, grid, and responsive design principles.',
                estimatedTime: 180,
                learningOutcomes: [
                  'Create flexible layouts with CSS Flexbox',
                  'Design complex grid systems with CSS Grid',
                  'Build responsive designs that work on all devices',
                  'Implement accessibility best practices in layouts'
                ],
                exercises: [
                  {
                    id: 'css-ex3',
                    title: 'Flexbox Layout',
                    description: 'Create flexible layouts using CSS Flexbox properties.',
                    points: 200,
                    estimatedTime: 60,
                    type: 'practice'
                  },
                  {
                    id: 'css-ex4',
                    title: 'CSS Grid',
                    description: 'Build complex grid-based layouts with CSS Grid.',
                    points: 220,
                    estimatedTime: 60,
                    type: 'challenge'
                  },
                  {
                    id: 'css-ex5',
                    title: 'Responsive Design',
                    description: 'Create responsive websites that work on all devices using media queries.',
                    points: 250,
                    estimatedTime: 60,
                    type: 'project'
                  }
                ]
              },
              {
                id: 'css-advanced',
                title: 'Advanced CSS',
                content: 'Learn advanced CSS techniques including animations, transitions, and custom properties.',
                estimatedTime: 150,
                learningOutcomes: [
                  'Create engaging animations with CSS',
                  'Implement smooth transitions between states',
                  'Use CSS custom properties for maintainable code',
                  'Apply advanced selectors for precise styling'
                ],
                exercises: [
                  {
                    id: 'css-ex6',
                    title: 'CSS Animations',
                    description: 'Create engaging animations using CSS keyframes and transitions.',
                    points: 280,
                    estimatedTime: 75,
                    type: 'challenge'
                  },
                  {
                    id: 'css-ex7',
                    title: 'CSS Custom Properties',
                    description: 'Use CSS variables for maintainable and dynamic styling.',
                    points: 300,
                    estimatedTime: 75,
                    type: 'project'
                  }
                ]
              }
            ]
          }
        ]
      },
      javascript: {
        name: 'JavaScript Essentials',
        description: 'Learn modern JavaScript programming from fundamentals to advanced concepts like async programming and frameworks',
        icon: '📜',
        levels: [
          {
            id: 'js-beginner',
            title: 'JavaScript Basics',
            modules: [
              {
                id: 'js-intro',
                title: 'Introduction to JavaScript',
                content: 'Learn about JavaScript syntax, variables, and data types for building interactive web applications.',
                exercises: [
                  {
                    id: 'js-ex1',
                    title: 'Variables and Data Types',
                    description: 'Practice with JavaScript variables, primitives, and objects.',
                    points: 100
                  },
                  {
                    id: 'js-ex2',
                    title: 'Functions and Scope',
                    description: 'Create JavaScript functions and understand variable scope.',
                    points: 120
                  }
                ]
              },
              {
                id: 'js-dom',
                title: 'DOM Manipulation',
                content: 'Learn to interact with the Document Object Model (DOM) to create dynamic web pages.',
                exercises: [
                  {
                    id: 'js-ex3',
                    title: 'Selecting and Modifying Elements',
                    description: 'Use JavaScript to select and modify DOM elements.',
                    points: 150
                  },
                  {
                    id: 'js-ex4',
                    title: 'Event Handling',
                    description: 'Add interactivity to web pages with JavaScript event listeners.',
                    points: 180
                  }
                ]
              }
            ]
          },
          {
            id: 'js-intermediate',
            title: 'Intermediate JavaScript',
            modules: [
              {
                id: 'js-async',
                title: 'Asynchronous JavaScript',
                content: 'Master asynchronous programming with callbacks, promises, and async/await syntax.',
                exercises: [
                  {
                    id: 'js-ex5',
                    title: 'Working with Promises',
                    description: 'Use promises for handling asynchronous operations in JavaScript.',
                    points: 200
                  },
                  {
                    id: 'js-ex6',
                    title: 'Async/Await',
                    description: 'Simplify asynchronous code with async/await syntax.',
                    points: 230
                  }
                ]
              },
              {
                id: 'js-modern',
                title: 'Modern JavaScript Features',
                content: 'Explore ES6+ features like arrow functions, destructuring, and modules.',
                exercises: [
                  {
                    id: 'js-ex7',
                    title: 'ES6 Syntax',
                    description: 'Practice with arrow functions, template literals, and destructuring.',
                    points: 250
                  },
                  {
                    id: 'js-ex8',
                    title: 'JavaScript Modules',
                    description: 'Organize code with ES modules for maintainable applications.',
                    points: 280
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  }

  // Get all available courses
  async getCourses() {
    try {
      console.log('Fetching courses from Supabase')
      
      // Try to fetch from Supabase
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
        
        if (error) {
          console.warn('Supabase API returned an error:', error)
          throw error
        }
        
        if (data && data.length > 0) {
          return data
        } else {
          console.log('No data from Supabase, using local course data')
          throw new Error('No courses found in database')
        }
      } catch (apiError) {
        // If the API call fails, use the local course data
        console.log('Falling back to local course data')
        const formattedCourses = Object.entries(this.courses).map(([id, course]) => ({
          id,
          name: course.name,
          description: course.description,
          icon: course.icon,
          levels: course.levels.map(level => level.title)
        }))
        
        return formattedCourses
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      // Return local course data as fallback
      const formattedCourses = Object.entries(this.courses).map(([id, course]) => ({
        id,
        name: course.name,
        description: course.description,
        icon: course.icon,
        levels: course.levels.map(level => level.title)
      }))
      
      return formattedCourses
    }
  }

  // Get course by ID
  async getCourse(courseId) {
    try {
      // Check localStorage cache first
      const cachedCourse = localStorage.getItem(`cached_course_${courseId}`);
      const cacheTimestamp = localStorage.getItem(`cached_course_${courseId}_timestamp`);
      
      // Use cache if it's less than 1 hour old
      const cacheAge = cacheTimestamp ? (Date.now() - parseInt(cacheTimestamp)) : Infinity;
      const cacheValid = cacheAge < 3600000; // 1 hour in milliseconds
      
      if (cachedCourse && cacheValid) {
        console.log(`Using cached course data for ${courseId}`);
        return JSON.parse(cachedCourse);
      }
      
      // Add a small delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!courseId || !this.courses[courseId]) {
        console.error(`Course not found: ${courseId}`);
        return null;
      }
      
      const courseData = this.courses[courseId];
      
      // Cache the result
      localStorage.setItem(`cached_course_${courseId}`, JSON.stringify(courseData));
      localStorage.setItem(`cached_course_${courseId}_timestamp`, Date.now().toString());
      
      return courseData;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      
      // Try to use cache even if expired in case of error
      const cachedCourse = localStorage.getItem(`cached_course_${courseId}`);
      if (cachedCourse) {
        console.log(`Using expired cached course data for ${courseId} due to error`);
        return JSON.parse(cachedCourse);
      }
      
      throw new Error(`Failed to load course: ${error.message}`);
    }
  }

  // Get course level
  async getCourseLevel(courseId, levelId) {
    try {
      const course = await this.getCourse(courseId);
      if (!course) return null;
      
      return course.levels.find(level => level.id === levelId) || null;
    } catch (error) {
      console.error(`Error fetching course level ${levelId}:`, error);
      throw new Error(`Failed to load course level: ${error.message}`);
    }
  }

  // Get module content
  async getModule(courseId, levelId, moduleId) {
    try {
      const level = await this.getCourseLevel(courseId, levelId);
      if (!level) return null;
      
      return level.modules.find(module => module.id === moduleId) || null;
    } catch (error) {
      console.error(`Error fetching module ${moduleId}:`, error);
      throw new Error(`Failed to load module: ${error.message}`);
    }
  }

  // Track user progress
  async updateProgress(userId, courseId, moduleId, progress) {
    try {
      // First try to save to Supabase
      try {
        const { data, error } = await supabase
          .from('course_progress')
          .upsert([
            {
              user_id: userId,
              course_id: courseId,
              module_id: moduleId,
              progress,
              updated_at: new Date().toISOString()
            }
          ])

        if (error) {
          console.warn('Supabase update progress error, falling back to localStorage:', error)
          throw error
        }
        
        return data
      } catch (supabaseError) {
        // Fall back to localStorage if Supabase fails
        const storageKey = `course_progress_${userId}`
        let existingProgress = JSON.parse(localStorage.getItem(storageKey) || '[]')
        
        // Find if there's existing progress for this module
        const existingIndex = existingProgress.findIndex(
          p => p.user_id === userId && p.course_id === courseId && p.module_id === moduleId
        )
        
        if (existingIndex >= 0) {
          // Update existing entry
          existingProgress[existingIndex].progress = progress
          existingProgress[existingIndex].updated_at = new Date().toISOString()
        } else {
          // Add new entry
          existingProgress.push({
            user_id: userId,
            course_id: courseId,
            module_id: moduleId,
            progress,
            updated_at: new Date().toISOString()
          })
        }
        
        // Save back to localStorage
        localStorage.setItem(storageKey, JSON.stringify(existingProgress))
        console.log('Progress saved to localStorage as fallback')
        
        return existingProgress.filter(p => p.course_id === courseId)
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      return []
    }
  }

  // Get user progress for a course
  async getUserProgress(userId, courseId) {
    try {
      // First try to get from Supabase
      try {
        const { data, error } = await supabase
          .from('course_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', courseId)

        if (error) {
          console.warn('Supabase get progress error, falling back to localStorage:', error)
          throw error
        }
        
        return data || []
      } catch (supabaseError) {
        // Fall back to localStorage
        const storageKey = `course_progress_${userId}`
        const allProgress = JSON.parse(localStorage.getItem(storageKey) || '[]')
        
        // Filter progress for this course
        const courseProgress = allProgress.filter(
          p => p.user_id === userId && p.course_id === courseId
        )
        
        console.log('Retrieved progress from localStorage fallback:', courseProgress)
        return courseProgress
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
      return []
    }
  }
  
  // Get user progress for all courses
  async getAllUserProgress(userId) {
    try {
      // First try to get from Supabase
      try {
        const { data, error } = await supabase
          .from('course_progress')
          .select('*')
          .eq('user_id', userId)

        if (error) {
          console.warn('Supabase get all progress error, falling back to localStorage:', error)
          throw error
        }
        
        return data || []
      } catch (supabaseError) {
        // Fall back to localStorage
        const storageKey = `course_progress_${userId}`
        const allProgress = JSON.parse(localStorage.getItem(storageKey) || '[]')
        
        // Filter progress for this user
        const userProgress = allProgress.filter(p => p.user_id === userId)
        
        console.log('Retrieved all progress from localStorage fallback:', userProgress)
        return userProgress
      }
    } catch (error) {
      console.error('Error fetching all progress:', error)
      return []
    }
  }
  
  // Mark a module as completed
  async completeModule(userId, courseId, moduleId) {
    try {
      const progressData = {
        started: true,
        completed: true,
        completedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      }
      
      return await this.updateProgress(userId, courseId, moduleId, progressData)
    } catch (error) {
      console.error('Error completing module:', error)
      return []
    }
  }

  // Reset a user's progress for a specific module
  async resetModuleProgress(userId, courseId, moduleId) {
    if (!userId || !courseId || !moduleId) {
      throw new Error('Missing required parameters for resetModuleProgress')
    }
    
    try {
      console.log(`Resetting progress for user ${userId} on module ${moduleId}`)
      
      // Remove the progress record from Supabase
      const { error } = await supabase
        .from('user_progress')
        .delete()
        .match({ 
          user_id: userId,
          course_id: courseId,
          module_id: moduleId
        })
      
      if (error) {
        throw error
      }
      
      // Also reset any scores/achievements associated with this module
      await supabase
        .from('user_scores')
        .delete()
        .match({ 
          user_id: userId,
          course_id: courseId,
          module_id: moduleId
        })
      
      return { success: true, message: 'Progress reset successfully' }
    } catch (error) {
      console.error('Error resetting module progress:', error)
      
      // Even if the database operation fails, clear localStorage
      const progressKey = `progress_${userId}_${courseId}_${moduleId}`
      const completionKey = `completed_${userId}_${courseId}_${moduleId}`
      localStorage.removeItem(progressKey)
      localStorage.removeItem(completionKey)
      
      throw error
    }
  }

  // Get quiz questions for a module
  async getQuiz(moduleId) {
    if (!moduleId) {
      return null
    }
    
    try {
      console.log(`Fetching quiz for module ${moduleId}`)
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('module_id', moduleId)
        .single()
      
      if (error) {
        // If no quiz found in database, generate a default quiz based on module ID
        return this.generateDefaultQuiz(moduleId)
      }
      
      return data
    } catch (error) {
      console.error('Error fetching quiz:', error)
      return this.generateDefaultQuiz(moduleId)
    }
  }
  
  // Generate a default quiz if none is found in the database
  generateDefaultQuiz(moduleId) {
    // Map module IDs to default quiz questions
    const quizMap = {
      'py-intro': {
        question: "Which of the following is NOT a built-in data type in Python?",
        options: [
          "Integer",
          "String", 
          "Array", 
          "Boolean"
        ],
        correctIndex: 2 // Array is not a built-in type (it's List in Python)
      },
      'py-control': {
        question: "Which loop is used when you want to iterate over a sequence?",
        options: [
          "for loop", 
          "while loop", 
          "do-while loop", 
          "repeat-until loop"
        ],
        correctIndex: 0 // for loop is the answer
      },
      'py-functions': {
        question: "What keyword is used to define a function in Python?",
        options: [
          "function", 
          "def", 
          "fun", 
          "define"
        ],
        correctIndex: 1 // def is the keyword
      },
      'html-basics': {
        question: "Which HTML tag is used to define a paragraph?",
        options: [
          "<para>", 
          "<p>", 
          "<paragraph>", 
          "<text>"
        ],
        correctIndex: 1 // <p> is correct
      },
      'css-basics': {
        question: "Which CSS property is used to change the text color?",
        options: [
          "text-color", 
          "font-color", 
          "color", 
          "text-style"
        ],
        correctIndex: 2 // color is correct
      },
      'js-intro': {
        question: "Which keyword is used to declare a constant variable in JavaScript?",
        options: [
          "let", 
          "var", 
          "const", 
          "constant"
        ],
        correctIndex: 2 // const is correct
      }
    };
    
    return quizMap[moduleId] || {
      question: "Sample question about this topic",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0
    };
  }
}

const courseService = new CourseService()
export default courseService