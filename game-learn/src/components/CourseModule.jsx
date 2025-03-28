import React from 'react'
import { useNavigate } from 'react-router-dom'

const CourseModule = ({ module, progress, onStart }) => {
  const navigate = useNavigate()

  const handleExerciseStart = (exerciseId) => {
    onStart(module.id, exerciseId)
    navigate(`/exercise/${exerciseId}`)
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors duration-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {module.title}
      </h3>
      <p className="text-gray-600 mb-4">{module.content}</p>
      
      <div className="space-y-4">
        {module.exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-gray-50 rounded-lg p-4"
          >
            <h4 className="font-medium text-gray-900 mb-1">
              {exercise.title}
            </h4>
            <p className="text-gray-600 text-sm mb-2">
              {exercise.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">
                {exercise.points} points
              </span>
              {progress?.completed ? (
                <span className="text-sm font-medium text-green-600">
                  Completed
                </span>
              ) : (
                <button
                  onClick={() => handleExerciseStart(exercise.id)}
                  className="btn-secondary text-sm"
                >
                  Start Exercise
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CourseModule