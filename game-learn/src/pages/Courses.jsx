import React from 'react'
import CourseList from '../components/CourseList'

const Courses = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Courses</h1>
            <p className="text-gray-600 mt-1">
              Browse all available courses or search for specific topics
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <CourseList />
        </div>
      </div>
    </div>
  )
}

export default Courses 