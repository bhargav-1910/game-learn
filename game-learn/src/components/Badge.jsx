import React from 'react'

const Badge = ({ name, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium bg-primary/10 text-primary ${sizeClasses[size]} ${className}`}
    >
      {name}
    </span>
  )
}

export default Badge