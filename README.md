# Educational Game Platform

An interactive educational game platform built with React, Phaser, and Supabase. This platform combines gaming elements with educational content to create an engaging learning experience.

## Tech Stack

- **Frontend Framework**: React 18
- **Game Engine**: Phaser 3
- **Database & Authentication**: Supabase
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **UI Components**: Material-UI
- **Charts**: Chart.js with React-Chartjs-2

## Features

- Interactive educational games
- Real-time multiplayer capabilities via Socket.IO
- User authentication and progress tracking
- Responsive design with Tailwind CSS
- Data visualization with Chart.js
- Material-UI components for consistent UI/UX

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager
- Supabase account for backend services

## Installation


```

1. Navigate to the project directory:
```bash
cd game-learn
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
- Copy `.env.example` to `.env`
- Update the Supabase credentials in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

Start the development server:
```bash
npm run dev
```



## Project Structure

```
/
├── src/
│   ├── components/    # Reusable React components
│   ├── pages/         # Page components
│   ├── services/      # API and service integrations
│   ├── store/         # Redux store configuration
│   └── main.jsx       # Application entry point
├── public/            # Static assets
└── supabase/          # Supabase configurations
```