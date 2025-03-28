import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import courseService from '../services/courseService'
import leaderboardService from '../services/leaderboardService'

const GameInterface = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  
  // Parse course and module ID from URL params
  const queryParams = new URLSearchParams(location.search)
  const courseId = queryParams.get('courseId')
  const moduleId = queryParams.get('moduleId')
  const exerciseId = queryParams.get('exerciseId')
  
  const [currentExercise, setCurrentExercise] = useState(null)
  const [moduleData, setModuleData] = useState(null)
  const [courseData, setCourseData] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [timer, setTimer] = useState(60)
  const [gameStatus, setGameStatus] = useState('ready') // ready, playing, learning, quiz, paused, completed
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [totalExercises, setTotalExercises] = useState(0)
  const [quizQuestions, setQuizQuestions] = useState(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // Load course and module data
  useEffect(() => {
    const fetchModuleData = async () => {
      // Get parameters from URL
      const params = new URLSearchParams(location.search)
      const urlCourseId = params.get('courseId')
      const urlModuleId = params.get('moduleId')
      const urlExerciseId = params.get('exerciseId')
      
      // Use URL params or props
      const effectiveCourseId = urlCourseId || courseId
      const effectiveModuleId = urlModuleId || moduleId
      
      if (!effectiveCourseId || !effectiveModuleId) {
        console.error('Missing course or module ID:', { courseId: effectiveCourseId, moduleId: effectiveModuleId })
        setFeedback('Missing course or module information. Please select a course from the dashboard.')
        setLoading(false)
        return
      }
      
      if (!user) {
        console.error('User not authenticated')
        navigate('/login')
        return
      }
      
      try {
        setLoading(true)
        console.log(`Loading module: courseId=${effectiveCourseId}, moduleId=${effectiveModuleId}, exerciseId=${urlExerciseId || 'none'}`)
        
        // Find which level contains this module
        const course = await courseService.getCourse(effectiveCourseId)
        if (!course) {
          throw new Error(`Course not found: ${effectiveCourseId}`)
        }
        
        setCourseData(course)
        
        // Find the module in the course levels
        let foundModule = null
        let foundLevel = null
        
        for (const level of course.levels) {
          const module = level.modules.find(m => m.id === effectiveModuleId)
          if (module) {
            foundModule = module
            foundLevel = level
            break
          }
        }
        
        if (!foundModule) {
          throw new Error(`Module not found: ${effectiveModuleId}`)
        }
        
        setModuleData(foundModule)
        setTotalExercises(foundModule.exercises.length)
        
        // Find specified exercise or use the first one
        if (foundModule.exercises.length > 0) {
          if (urlExerciseId) {
            const exerciseIndex = foundModule.exercises.findIndex(ex => ex.id === urlExerciseId)
            if (exerciseIndex >= 0) {
              setExerciseIndex(exerciseIndex)
              setCurrentExercise(foundModule.exercises[exerciseIndex])
            } else {
              // If specified exercise not found, use the first one
              setCurrentExercise(foundModule.exercises[0])
              console.warn(`Exercise with ID ${urlExerciseId} not found, using first exercise instead`)
            }
          } else {
            // No exercise specified, use the first one
            setCurrentExercise(foundModule.exercises[0])
          }
        } else {
          throw new Error('No exercises found in this module')
        }
        
        // Fetch quiz questions
        const quiz = await courseService.getQuiz(effectiveModuleId)
        if (quiz) {
          setQuizQuestions(quiz)
        } else {
          console.warn('No quiz found for this module')
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Failed to load module:', error)
        setFeedback(`Failed to load exercise: ${error.message}. Please try again.`)
        setLoading(false)
      }
    }
    
    fetchModuleData()
  }, [courseId, moduleId, exerciseId, user, navigate, location.search])
  
  // Handle timer for active game - we'll keep this for timeouts but not use it as primary navigation
  useEffect(() => {
    let interval
    if (gameStatus === 'quiz' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1)
      }, 1000)
    } else if (timer === 0 && gameStatus === 'quiz') {
      // Time's up - move to next question automatically
      moveToNextExercise()
    }
    
    return () => clearInterval(interval)
  }, [gameStatus, timer])
  
  // Update progress tracking in real-time
  useEffect(() => {
    if (gameStatus === 'learning' || gameStatus === 'quiz') {
      const progressPercentage = ((exerciseIndex) / totalExercises) * 100
      setProgress(progressPercentage)
      
      // Save progress to localStorage for offline tracking
      if (user && courseId && moduleId) {
        try {
          const progressKey = `progress_${user.id}_${courseId}_${moduleId}`
          localStorage.setItem(progressKey, JSON.stringify({
            exerciseIndex,
            progress: progressPercentage,
            lastUpdated: new Date().toISOString()
          }))
        } catch (error) {
          console.error('Failed to save progress to localStorage:', error)
        }
      }
    }
  }, [exerciseIndex, totalExercises, gameStatus, user, courseId, moduleId])
  
  const startGame = () => {
    console.log('Starting game with module data:', moduleData);
    
    if (!user) {
      console.error('User not authenticated');
      setFeedback('Please log in to start learning');
      navigate('/login');
      return;
    }
    
    if (!moduleData) {
      console.error('No module data available');
      setFeedback('Module data not available. Please try selecting another module.');
      return;
    }
    
    setGameStatus('learning');
    setScore(0);
    setStreak(0);
    setTimer(60);
    setFeedback('');
    setExerciseIndex(0);
    setUserAnswers({});
    setHasAnswered(false);
    
    if (moduleData?.exercises?.length > 0) {
      console.log('Setting current exercise to:', moduleData.exercises[0]);
      const firstExercise = moduleData.exercises[0];
      setCurrentExercise(firstExercise);
      
      // Fetch quiz questions for this exercise if needed
      fetchQuizQuestions(firstExercise.id);
      
      // Track that user started this module
      try {
        if (user && courseId && moduleId) {
          courseService.updateProgress(user.id, courseId, moduleId, {
            started: true,
            lastAccessed: new Date().toISOString()
          }).catch(err => console.error('Failed to update progress:', err));
        }
      } catch (err) {
        console.error('Error tracking user progress:', err);
      }
    } else {
      console.warn('No exercises found in module data!');
      setFeedback('No exercises found for this module. Please try another module.');
    }
  }

  const fetchQuizQuestions = async (exerciseId) => {
    if (!moduleId) {
      console.error('No moduleId available for fetching quiz questions');
      setDefaultQuizQuestions();
      return;
    }
    
    try {
      console.log(`Fetching quiz questions for module ${moduleId}, exercise ${exerciseId}`);
      
      // We can either fetch quiz based on module ID or exercise ID
      // For now, let's use the moduleId since our service is set up that way
      const quiz = await courseService.getQuiz(moduleId);
      
      if (quiz && quiz.options && Array.isArray(quiz.options) && quiz.options.length > 0) {
        console.log('Quiz questions loaded successfully');
        setQuizQuestions(quiz);
      } else {
        console.warn('Invalid quiz structure received, using default questions');
        setDefaultQuizQuestions(exerciseId);
      }
    } catch (error) {
      console.error('Failed to fetch quiz questions:', error);
      setDefaultQuizQuestions(exerciseId);
    }
  };

  const setDefaultQuizQuestions = (exerciseId) => {
    // Create default questions based on the current exercise
    const exercise = currentExercise || (moduleData?.exercises && moduleData.exercises[exerciseIndex]);
    const title = exercise?.title || 'this topic';
    
    const defaultQuiz = {
      question: `What is the main concept covered in "${title}"?`,
      options: [
        `Understanding the fundamentals of ${title}`,
        `Advanced techniques in ${title}`,
        `Practical applications of ${title}`,
        `Problem-solving with ${title}`
      ],
      correctIndex: 0
    };
    
    setQuizQuestions(defaultQuiz);
  };

  const resetProgress = async () => {
    try {
      if (user && courseId && moduleId) {
        // Reset progress in backend
        await courseService.resetModuleProgress(user.id, courseId, moduleId)
        
        // Clear local progress tracking
        const progressKey = `progress_${user.id}_${courseId}_${moduleId}`
        localStorage.removeItem(progressKey)
        
        console.log('Progress reset successfully')
        
        // Restart the module
        startGame()
      }
    } catch (error) {
      console.error('Failed to reset progress:', error)
      setFeedback('Failed to reset progress. Please try again.')
    }
  }
  
  const startQuiz = () => {
    setGameStatus('quiz');
    setFeedback('');
    setHasAnswered(false);
    
    // Make sure we have quiz questions for the current exercise
    if (currentExercise && !quizQuestions) {
      fetchQuizQuestions(currentExercise.id);
    }
  }
  
  const handleAnswer = (selectedOptionIndex) => {
    if (gameStatus !== 'quiz' || hasAnswered) return
    
    // Store user's answer
    setUserAnswers(prev => ({
      ...prev,
      [currentExercise.id]: selectedOptionIndex
    }))
    
    // Mark that user has answered the current question
    setHasAnswered(true)
    
    // Check if the answer is correct
    const isCorrect = selectedOptionIndex === quizQuestions.correctIndex
    
    if (isCorrect) {
      const points = currentExercise.points + (streak * 10)
      setScore(prevScore => prevScore + points)
      setStreak(prevStreak => prevStreak + 1)
      setFeedback(`Correct! +${points} points`)
      
      // Update leaderboard
      try {
        leaderboardService.updateScore(user.id, {
          score: points,
          streak: streak + 1
        })
      } catch (error) {
        console.error('Failed to update score:', error)
      }
    } else {
      setStreak(0)
      setFeedback(`Incorrect. The correct answer was: ${quizQuestions.options[quizQuestions.correctIndex]}`)
    }
  }
  
  const moveToNextExercise = () => {
    if (exerciseIndex < totalExercises - 1) {
      const nextIndex = exerciseIndex + 1;
      setExerciseIndex(nextIndex);
      
      // Make sure moduleData exists and has exercises before accessing them
      if (moduleData && moduleData.exercises && moduleData.exercises.length > nextIndex) {
        setCurrentExercise(moduleData.exercises[nextIndex]);
        
        // Fetch quiz questions for this exercise
        fetchQuizQuestions(moduleData.exercises[nextIndex].id);
      } else {
        console.error('Cannot access next exercise: moduleData or exercises missing');
      }
      
      setFeedback('');
      setHasAnswered(false);
      setGameStatus('learning'); // Go back to learning mode for the next exercise
    } else {
      endExercise(true);
    }
  }
  
  const endExercise = async (completed) => {
    setGameStatus('completed')
    
    try {
      // Update user progress
      if (completed && user && courseId && moduleId) {
        try {
          const result = await courseService.completeModule(user.id, courseId, moduleId)
          console.log('Module completion saved:', result)
        } catch (progressError) {
          console.error('Failed to save module completion status:', progressError)
          
          // Fallback to localStorage if backend fails
          const completionKey = `completed_${user.id}_${courseId}_${moduleId}`
          localStorage.setItem(completionKey, JSON.stringify({
            completed: true,
            score,
            streak,
            completedAt: new Date().toISOString()
          }))
        }
      }
      
      // Add final game stats
      if (user) {
        try {
          await leaderboardService.updateScore(user.id, {
            score,
            streak
          })
        } catch (scoreError) {
          console.error('Failed to update leaderboard score:', scoreError)
          
          // Fallback to localStorage
          const statsKey = `stats_${user.id}`
          const existingStats = JSON.parse(localStorage.getItem(statsKey) || '{}')
          localStorage.setItem(statsKey, JSON.stringify({
            ...existingStats,
            score: (existingStats.score || 0) + score,
            streak: Math.max(existingStats.streak || 0, streak),
            lastUpdated: new Date().toISOString()
          }))
        }
        
        // Check for badges
        try {
          if (score >= 1000) {
            await leaderboardService.addBadge(user.id, 'High Scorer')
          }
          if (streak >= 5) {
            await leaderboardService.addBadge(user.id, 'Streak Master')
          }
        } catch (badgeError) {
          console.error('Failed to add badges:', badgeError)
          
          // Fallback to localStorage
          const badgesKey = `badges_${user.id}`
          const existingBadges = JSON.parse(localStorage.getItem(badgesKey) || '[]')
          if (score >= 1000 && !existingBadges.includes('High Scorer')) {
            existingBadges.push('High Scorer')
          }
          if (streak >= 5 && !existingBadges.includes('Streak Master')) {
            existingBadges.push('Streak Master')
          }
          localStorage.setItem(badgesKey, JSON.stringify(existingBadges))
        }
      }
    } catch (error) {
      console.error('Failed to save game results:', error)
    }
  }
  
  const goToCourseDetail = () => {
    navigate(`/course/${courseId || ''}`)
  }
  
  const goToDashboard = () => {
    navigate('/dashboard')
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  // Show error message if module couldn't be loaded
  if (!moduleData && feedback && !loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12 bg-white rounded-xl shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-bold text-red-600">Error Loading Module</h3>
          <p className="text-gray-700">{feedback}</p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button
              onClick={goToDashboard}
              className="btn-primary"
            >
              Go to Dashboard
            </button>
            <button
              onClick={goToCourseDetail}
              className="btn-secondary"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Get learning content for current exercise
  const getLearningContent = (exerciseId) => {
    if (!exerciseId) return null;
    
    // Map exercise IDs to learning content
    const contentMap = {
      // Python exercises
      'py-ex1': `
        <h3>Variables and Data Types in Python</h3>
        <p>Python variables are containers for storing data values. Unlike other programming languages, Python has no command for declaring a variable. A variable is created the moment you first assign a value to it.</p>
        <pre>x = 5           # integer
y = "Hello"     # string
z = 3.14        # float
is_true = True  # boolean</pre>
        <p>Python has the following data types built-in by default:</p>
        <ul>
          <li><strong>Text Type:</strong> str</li>
          <li><strong>Numeric Types:</strong> int, float, complex</li>
          <li><strong>Sequence Types:</strong> list, tuple, range</li>
          <li><strong>Mapping Type:</strong> dict</li>
          <li><strong>Set Types:</strong> set, frozenset</li>
          <li><strong>Boolean Type:</strong> bool</li>
          <li><strong>Binary Types:</strong> bytes, bytearray, memoryview</li>
          <li><strong>None Type:</strong> NoneType</li>
        </ul>
      `,
      'py-ex2': `
        <h3>Basic Operations in Python</h3>
        <p>Python supports various operations for different data types:</p>
        <h4>Arithmetic Operations</h4>
        <pre>a = 10
b = 3
print(a + b)    # Addition: 13
print(a - b)    # Subtraction: 7
print(a * b)    # Multiplication: 30
print(a / b)    # Division: 3.333...
print(a // b)   # Floor division: 3
print(a % b)    # Modulus: 1
print(a ** b)   # Exponentiation: 1000</pre>
        <h4>String Operations</h4>
        <pre>first = "Hello"
last = "World"
print(first + " " + last)  # Concatenation: Hello World
print(first * 3)           # Repetition: HelloHelloHello
print(len(first))          # Length: 5
print(first[0])            # Indexing: H
print(first[1:4])          # Slicing: ell</pre>
      `,
      'py-ex3': `
        <h3>Loops and Conditions in Python</h3>
        <p>Control flow is the order in which the program's code executes. Python uses conditional statements and loops to control this flow.</p>
        <h4>If-Else Statements</h4>
        <pre>x = 10
if x > 5:
    print("x is greater than 5")
elif x == 5:
    print("x is equal to 5")
else:
    print("x is less than 5")</pre>
        <h4>For Loops</h4>
        <pre>fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# With range
for i in range(5):  # 0 to 4
    print(i)</pre>
        <h4>While Loops</h4>
        <pre>count = 0
while count < 5:
    print(count)
    count += 1</pre>
      `,
      'py-ex4': `
        <h3>List Comprehensions in Python</h3>
        <p>List comprehensions provide a concise way to create lists based on existing lists or other iterable objects.</p>
        <h4>Basic Syntax</h4>
        <pre>new_list = [expression for item in iterable if condition]</pre>
        <h4>Examples</h4>
        <pre># Create a list of squares
squares = [x**2 for x in range(10)]
print(squares)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# Create a list of even numbers
evens = [x for x in range(20) if x % 2 == 0]
print(evens)  # [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# Convert temperatures from Celsius to Fahrenheit
celsius = [0, 10, 20, 30, 40]
fahrenheit = [(9/5) * c + 32 for c in celsius]
print(fahrenheit)  # [32.0, 50.0, 68.0, 86.0, 104.0]</pre>
        <p>List comprehensions are more concise and often faster than using a for loop with append().</p>
      `,
      'py-ex5': `
        <h3>Function Creation in Python</h3>
        <p>Functions in Python are defined using the <code>def</code> keyword, followed by a function name and parameters.</p>
        <h4>Basic Function Syntax</h4>
        <pre>def function_name(parameters):
    """Docstring explaining the function"""
    # Function body
    return result</pre>
        <h4>Examples</h4>
        <pre># Simple function
def greet(name):
    """Returns a greeting message"""
    return f"Hello, {name}!"

# Function with default parameter
def power(base, exponent=2):
    """Returns base raised to exponent power"""
    return base ** exponent

# Function with multiple return values
def stats(numbers):
    """Returns min, max, and average of a list"""
    return min(numbers), max(numbers), sum(numbers)/len(numbers)

# Function with arbitrary arguments
def sum_all(*args):
    """Sums all arguments passed to the function"""
    return sum(args)

print(greet("Alice"))  # Hello, Alice!
print(power(3))        # 9 (3^2)
print(power(2, 3))     # 8 (2^3)

min_val, max_val, avg = stats([1, 2, 3, 4, 5])
print(f"Min: {min_val}, Max: {max_val}, Avg: {avg}")  # Min: 1, Max: 5, Avg: 3.0

print(sum_all(1, 2, 3, 4))  # 10</pre>
      `,
      'html-ex1': `
        <h3>Creating Web Pages with HTML</h3>
        <p>HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser.</p>
        <h4>Basic HTML Structure</h4>
        <pre>&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;title&gt;Page Title&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;h1&gt;My First Heading&lt;/h1&gt;
    &lt;p&gt;My first paragraph.&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</pre>
        <h4>Common HTML Elements</h4>
        <ul>
          <li><strong>Headings:</strong> &lt;h1&gt; to &lt;h6&gt;</li>
          <li><strong>Paragraphs:</strong> &lt;p&gt;</li>
          <li><strong>Links:</strong> &lt;a href="url"&gt;link text&lt;/a&gt;</li>
          <li><strong>Images:</strong> &lt;img src="image.jpg" alt="description"&gt;</li>
          <li><strong>Lists:</strong> &lt;ul&gt;, &lt;ol&gt;, and &lt;li&gt;</li>
          <li><strong>Divisions:</strong> &lt;div&gt;</li>
          <li><strong>Spans:</strong> &lt;span&gt;</li>
        </ul>
      `,
      'html-ex2': `
        <h3>HTML Forms and Tables</h3>
        <p>Forms allow users to input data that can be processed by web applications, while tables help organize information in rows and columns.</p>
        <h4>Basic Form Structure</h4>
        <pre>&lt;form action="/submit-form" method="post"&gt;
    &lt;label for="name"&gt;Name:&lt;/label&gt;
    &lt;input type="text" id="name" name="name" required&gt;
    
    &lt;label for="email"&gt;Email:&lt;/label&gt;
    &lt;input type="email" id="email" name="email" required&gt;
    
    &lt;label for="message"&gt;Message:&lt;/label&gt;
    &lt;textarea id="message" name="message" rows="4"&gt;&lt;/textarea&gt;
    
    &lt;button type="submit"&gt;Submit&lt;/button&gt;
&lt;/form&gt;</pre>
        <h4>Common Form Elements</h4>
        <ul>
          <li><strong>Input types:</strong> text, email, password, number, checkbox, radio, date, file, etc.</li>
          <li><strong>Textarea:</strong> For multi-line text input</li>
          <li><strong>Select:</strong> For dropdown menus</li>
          <li><strong>Button:</strong> For submitting forms or triggering actions</li>
        </ul>
        <h4>Basic Table Structure</h4>
        <pre>&lt;table&gt;
    &lt;thead&gt;
        &lt;tr&gt;
            &lt;th&gt;Name&lt;/th&gt;
            &lt;th&gt;Age&lt;/th&gt;
            &lt;th&gt;Country&lt;/th&gt;
        &lt;/tr&gt;
    &lt;/thead&gt;
    &lt;tbody&gt;
        &lt;tr&gt;
            &lt;td&gt;John&lt;/td&gt;
            &lt;td&gt;25&lt;/td&gt;
            &lt;td&gt;USA&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;Emma&lt;/td&gt;
            &lt;td&gt;28&lt;/td&gt;
            &lt;td&gt;Canada&lt;/td&gt;
        &lt;/tr&gt;
    &lt;/tbody&gt;
&lt;/table&gt;</pre>
      `,
      'css-ex1': `
        <h3>Styling Elements with CSS</h3>
        <p>CSS (Cascading Style Sheets) is used to style HTML elements. There are three ways to add CSS to an HTML document:</p>
        <ol>
          <li>Inline CSS (using the style attribute)</li>
          <li>Internal CSS (using the &lt;style&gt; tag in the head section)</li>
          <li>External CSS (using a separate .css file)</li>
        </ol>
        <h4>CSS Syntax</h4>
        <pre>selector {
    property: value;
    property: value;
}</pre>
        <h4>Basic CSS Properties</h4>
        <pre>/* Text styling */
h1 {
    color: #3366cc;            /* Text color */
    font-family: Arial, sans-serif;  /* Font */
    font-size: 24px;           /* Text size */
    font-weight: bold;         /* Bold text */
    text-align: center;        /* Center text */
}

/* Box model properties */
.box {
    background-color: #f0f0f0;  /* Background color */
    border: 1px solid #333;     /* Border */
    padding: 20px;              /* Space inside the box */
    margin: 10px;               /* Space outside the box */
    width: 300px;               /* Width */
    height: 200px;              /* Height */
}

/* Selectors */
p {                   /* Element selector */
    line-height: 1.5;
}
.highlight {          /* Class selector */
    background-color: yellow;
}
#header {             /* ID selector */
    position: fixed;
    top: 0;
}
a:hover {             /* Pseudo-class */
    text-decoration: underline;
}</pre>
      `,
      'js-ex1': `
        <h3>JavaScript Variables and Data Types</h3>
        <p>JavaScript variables are containers for storing data values. You can declare variables using var, let, or const.</p>
        <pre>// Using let (block-scoped, can be reassigned)
let name = "John";
let age = 30;

// Using const (block-scoped, cannot be reassigned)
const PI = 3.14159;

// Using var (function-scoped, can be reassigned)
var count = 0;</pre>
        <h4>JavaScript Data Types</h4>
        <ul>
          <li><strong>String:</strong> <code>let text = "Hello";</code></li>
          <li><strong>Number:</strong> <code>let num = 42;</code></li>
          <li><strong>Boolean:</strong> <code>let isActive = true;</code></li>
          <li><strong>Object:</strong> <code>let person = {name: "John", age: 30};</code></li>
          <li><strong>Array:</strong> <code>let colors = ["red", "green", "blue"];</code></li>
          <li><strong>Undefined:</strong> <code>let result;</code></li>
          <li><strong>Null:</strong> <code>let empty = null;</code></li>
        </ul>
      `,
      'js-ex2': `
        <h3>Functions and Scope in JavaScript</h3>
        <p>Functions in JavaScript are blocks of code designed to perform a particular task and are executed when called (invoked).</p>
        <h4>Function Declaration</h4>
        <pre>// Function declaration
function greet(name) {
    return "Hello, " + name + "!";
}

// Function expression
const sayHello = function(name) {
    return "Hello, " + name + "!";
};

// Arrow function (ES6)
const welcome = (name) => {
    return "Welcome, " + name + "!";
};

// Arrow function with implicit return
const shortGreet = name => "Hi, " + name + "!";</pre>
        <h4>Scope in JavaScript</h4>
        <pre>// Global scope
let globalVar = "I'm global";

function exampleFunction() {
    // Function scope
    let functionVar = "I'm function-scoped";
    
    if (true) {
        // Block scope (only with let/const)
        let blockVar = "I'm block-scoped";
        var notBlockVar = "I'm function-scoped despite being in a block";
        
        console.log(globalVar);      // Accessible
        console.log(functionVar);    // Accessible
        console.log(blockVar);       // Accessible
    }
    
    console.log(globalVar);          // Accessible
    console.log(functionVar);        // Accessible
    console.log(notBlockVar);        // Accessible
    // console.log(blockVar);        // ERROR - Not accessible
}

exampleFunction();
console.log(globalVar);              // Accessible
// console.log(functionVar);         // ERROR - Not accessible
// console.log(notBlockVar);         // ERROR - Not accessible
// console.log(blockVar);            // ERROR - Not accessible</pre>
      `,
      'js-ex3': `
        <h3>DOM Manipulation with JavaScript</h3>
        <p>The Document Object Model (DOM) is a programming interface for web documents. It represents the page so that programs can change the document structure, style, and content.</p>
        <h4>Selecting Elements</h4>
        <pre>// Get element by ID
const header = document.getElementById('header');

// Get elements by class name
const items = document.getElementsByClassName('item');

// Get elements by tag name
const paragraphs = document.getElementsByTagName('p');

// Query selector (returns first match)
const container = document.querySelector('.container');

// Query selector all (returns all matches)
const buttons = document.querySelectorAll('button.primary');</pre>
        <h4>Modifying Elements</h4>
        <pre>// Change text content
element.textContent = 'New text';

// Change HTML content
element.innerHTML = '<span>New HTML</span>';

// Change attributes
element.setAttribute('src', 'image.jpg');
element.id = 'newId';
element.className = 'new-class';

// Change style
element.style.color = 'blue';
element.style.fontSize = '16px';
element.style.display = 'none';</pre>
        <h4>Creating and Adding Elements</h4>
        <pre>// Create new element
const newDiv = document.createElement('div');

// Add text
newDiv.textContent = 'New element';

// Add to the DOM
document.body.appendChild(newDiv);

// Insert before another element
const referenceElement = document.getElementById('reference');
document.body.insertBefore(newDiv, referenceElement);</pre>
      `,
    };
    
    return contentMap[exerciseId] || `<p>No learning content available for this exercise.</p>`;
  }
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-gray-900">
            {moduleData?.title || 'Learning Exercise'}
          </h2>
          <p className="text-gray-600">
            {courseData?.name} | Score: {score} | Streak: {streak}
          </p>
        </div>
        {gameStatus === 'quiz' && (
          <div className="text-2xl font-bold text-primary">
            {timer}s
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      {(gameStatus === 'learning' || gameStatus === 'quiz') && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Progress</span>
            <span>{exerciseIndex + 1} of {totalExercises}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      {gameStatus === 'ready' && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Ready to Start Learning?</h3>
          <p className="text-gray-600 mb-6">
            You're about to start "{moduleData?.title}" from the course "{courseData?.name}".
            <br />Complete the exercises to earn points and track your progress!
          </p>
          <button
            onClick={startGame}
            className="btn-primary"
          >
            Start Learning
          </button>
        </div>
      )}
      
      {gameStatus === 'learning' && currentExercise && (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-2 text-sm font-medium text-gray-500">
              Exercise {exerciseIndex + 1} of {totalExercises} - Learning Phase
            </div>
            <h3 className="text-xl font-bold mb-4">{currentExercise.title}</h3>
            
            <div className="prose max-w-none mb-6">
              <div dangerouslySetInnerHTML={{ 
                __html: getLearningContent(currentExercise.id) 
              }} />
            </div>
            
            <div className="flex justify-center mt-6">
              <button
                onClick={startQuiz}
                className="btn-primary"
              >
                Take Quiz
              </button>
            </div>
          </div>
        </div>
      )}
      
      {gameStatus === 'quiz' && currentExercise && quizQuestions && (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-2 text-sm font-medium text-gray-500">
              Exercise {exerciseIndex + 1} of {totalExercises} - Quiz Phase
            </div>
            <h3 className="text-xl font-bold mb-6">{currentExercise.title}</h3>
            <p className="text-gray-700 mb-6">{quizQuestions.question}</p>
            
            {/* Quiz interface */}
            <div className="space-y-4">
              <p className="font-medium">Select the correct answer:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizQuestions.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`btn-secondary ${
                      hasAnswered && index === quizQuestions.correctIndex 
                        ? 'bg-green-100 border-green-500 text-green-800' 
                        : hasAnswered && userAnswers[currentExercise.id] === index && index !== quizQuestions.correctIndex
                          ? 'bg-red-100 border-red-500 text-red-800'
                          : ''
                    }`}
                    disabled={hasAnswered}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              {/* Next button - only show after answering */}
              {hasAnswered && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={moveToNextExercise}
                    className="btn-primary"
                  >
                    {exerciseIndex < totalExercises - 1 ? 'Next Question' : 'Complete Module'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {feedback && (
            <div className={`rounded-lg p-4 text-center ${
              feedback.includes('Correct') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {feedback}
            </div>
          )}
        </div>
      )}
      
      {gameStatus === 'completed' && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-bold">Module Completed!</h3>
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary text-4xl">🏆</span>
            </div>
          </div>
          <div>
            <p className="text-lg mb-1">Final Score: {score}</p>
            <p className="text-lg mb-4">Highest Streak: {streak}</p>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button
              onClick={startGame}
              className="btn-primary"
            >
              Try Again
            </button>
            <button
              onClick={resetProgress}
              className="btn-secondary"
            >
              Reset Progress
            </button>
            <button
              onClick={goToCourseDetail}
              className="btn-secondary"
            >
              Back to Course
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameInterface