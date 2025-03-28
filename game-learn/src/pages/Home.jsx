import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)

  const features = [
    {
      title: 'Adaptive Learning',
      description: 'Personalized learning paths that adapt to your progress and learning style.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      )
    },
    {
      title: 'Interactive Games',
      description: 'Engaging mini-games and puzzles that make learning fun and effective.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
        </svg>
      )
    },
    {
      title: 'Progress Tracking',
      description: 'Detailed analytics and insights to monitor your learning journey.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      )
    },
    {
      title: 'Rewards System',
      description: 'Earn badges and climb the leaderboard as you master new skills.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      )
    }
  ]

  const testimonials = [
    {
      quote: "GameLearn made coding so much more fun. I've learned more in a month than I did in a semester of traditional classes!",
      author: "Alex K., Student",
      avatar: "https://placehold.co/100/2563eb/FFF?text=AK"
    },
    {
      quote: "The interactive approach keeps my students engaged and motivated. The progress tracking helps me identify who needs extra help.",
      author: "Maria S., Teacher",
      avatar: "https://placehold.co/100/2563eb/FFF?text=MS"
    },
    {
      quote: "I never thought learning could be this enjoyable. The gamification elements make me want to keep improving my skills.",
      author: "Jamie T., Software Developer",
      avatar: "https://placehold.co/100/2563eb/FFF?text=JT"
    }
  ]

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative py-20">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-primary/5 rounded-full"></div>
          <div className="absolute -bottom-32 right-1/3 w-80 h-80 bg-primary/5 rounded-full"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h1 className="text-5xl sm:text-6xl font-display font-bold text-gray-900 dark:text-white leading-tight">
            Learn Through <span className="text-primary">Play</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience a new way of learning with our interactive educational platform
            that combines engaging gameplay with effective learning methodologies.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn-primary text-base px-8 py-3">
                  Get Started
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-3">
                  Sign In
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="btn-primary text-base px-8 py-3">
                Go to Dashboard
              </Link>
            )}
          </div>
          
          <div className="pt-8">
            <img 
              src="https://placehold.co/1200x600/2563eb/FFF?text=Interactive+Learning+Platform" 
              alt="Interactive Learning Platform"
              className="rounded-xl shadow-lg max-w-full mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Why Choose GameLearn?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our platform combines the latest in educational technology with game design 
            principles to create an engaging and effective learning experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="text-primary bg-primary/10 dark:bg-primary/20 p-3 rounded-full w-fit mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of satisfied learners who have transformed their learning experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 relative">
                <div className="absolute -top-5 left-6 w-10 h-10 bg-primary text-white flex items-center justify-center rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <div className="pt-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <p className="text-gray-900 dark:text-white font-medium">{testimonial.author}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto text-center py-16 px-4">
        <div className="bg-primary/10 dark:bg-primary/20 rounded-2xl p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 dark:bg-primary/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/20 dark:bg-primary/30 rounded-full translate-x-1/3 translate-y-1/3"></div>
          
          <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4 relative z-10">
            Ready to Start Learning?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 relative z-10">
            Join thousands of learners who are already experiencing the future of
            education through our interactive platform.
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="btn-primary text-base px-8 py-3 inline-block relative z-10">
              Create Free Account
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home