import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Help = () => {
  const [activeTab, setActiveTab] = useState('tutorials')

  const tutorials = [
    {
      title: 'Getting Started',
      content: 'Learn the basics of the game and how to navigate through different sections.',
      steps: [
        'Create an account or sign in',
        'Visit the dashboard to see your progress',
        'Start your first game session',
        'Track your progress on the leaderboard'
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
      )
    },
    {
      title: 'Game Mechanics',
      content: 'Understanding how to play and score points.',
      steps: [
        'Answer questions within the time limit',
        'Build streaks for bonus points',
        'Earn badges for achievements',
        'Compare your score on the leaderboard'
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
        </svg>
      )
    },
    {
      title: 'Learning Paths',
      content: 'Customize your learning experience.',
      steps: [
        'Choose your difficulty level',
        'Select your preferred topics',
        'Track your progress',
        'Earn topic-specific badges'
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      )
    },
    {
      title: 'Settings & Preferences',
      content: 'Customize your gaming experience.',
      steps: [
        'Adjust game difficulty',
        'Set question timer duration',
        'Toggle sound effects',
        'Enable/disable notifications'
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]

  const faqs = [
    {
      question: 'How do I earn points?',
      answer: 'Points are earned by correctly answering questions. You get 100 base points per correct answer, plus bonus points for maintaining a streak.'
    },
    {
      question: 'What are badges?',
      answer: 'Badges are achievements you earn for reaching certain milestones, like high scores or maintaining streaks.'
    },
    {
      question: 'How does the streak system work?',
      answer: 'Each correct answer increases your streak by 1. The streak multiplier adds 10 points per streak level to your base score.'
    },
    {
      question: 'Can I change the difficulty level?',
      answer: 'Yes, you can adjust the difficulty level in the Settings page to match your learning pace.'
    },
    {
      question: 'How do I track my progress?',
      answer: 'Your progress is tracked automatically. Visit the Dashboard to see detailed statistics and progress charts.'
    },
    {
      question: 'Can I compete with friends?',
      answer: 'Yes! You can add friends and compete on the leaderboard to see who can earn the highest scores.'
    }
  ]

  const videoTutorials = [
    {
      title: 'Getting Started with GameLearn',
      duration: '3:45',
      thumbnail: 'https://placehold.co/600x400/2563eb/FFF?text=Getting+Started'
    },
    {
      title: 'Mastering Game Mechanics',
      duration: '5:10',
      thumbnail: 'https://placehold.co/600x400/2563eb/FFF?text=Game+Mechanics'
    },
    {
      title: 'Advanced Strategies for High Scores',
      duration: '4:30',
      thumbnail: 'https://placehold.co/600x400/2563eb/FFF?text=Advanced+Strategies'
    },
    {
      title: 'Customizing Your Learning Path',
      duration: '2:55',
      thumbnail: 'https://placehold.co/600x400/2563eb/FFF?text=Learning+Path'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">
        Help Center
      </h2>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <nav className="flex space-x-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab('tutorials')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'tutorials'
                ? 'bg-white shadow text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tutorials
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'faqs'
                ? 'bg-white shadow text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            FAQs
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'videos'
                ? 'bg-white shadow text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Video Tutorials
          </button>
        </nav>
      </div>

      <div className="space-y-8">
        {/* Tutorials Section */}
        {activeTab === 'tutorials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tutorials.map((tutorial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-[1.02]">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="text-primary p-2 bg-primary/10 rounded-full">
                    {tutorial.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {tutorial.title}
                    </h3>
                    <p className="text-gray-600">{tutorial.content}</p>
                  </div>
                </div>
                <ul className="space-y-3 pl-4">
                  {tutorial.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm mr-3">
                        {stepIndex + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* FAQs Section */}
        {activeTab === 'faqs' && (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-colors hover:border-primary/20">
                <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                  {faq.question}
                </h4>
                <p className="text-gray-600 ml-7">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* Video Tutorials Section */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videoTutorials.map((video, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden group">
                <div className="relative">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{video.title}</h3>
                  <p className="text-sm text-gray-500">Duration: {video.duration}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Support Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 text-center mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Still Need Help?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is ready to assist you with any questions or issues you may have.
          </p>
          <Link to="/contact" className="btn-primary">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Help