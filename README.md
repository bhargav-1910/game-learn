Generative AI interactive learning platform


Link of the output or application video : https://youtu.be/NPiN-66hyx4

# Educational Game Platform
Game Learn is an AI-powered, interactive learning platform designed to enhance educational experiences by blending gamification with AI-based assistance. The platform offers personalized learning support, real-time progress tracking, and interactive modules, making learning engaging, efficient, and accessible.

The integration of an AI chatbot further elevates the platform by providing instant query resolution, personalized recommendations, and 24/7 learner assistance.Technical Architecture
The Game Learn platform is built using modern web technologies to ensure a scalable, responsive, and high-performance user experience.

Frontend Stack:
Vite: Next-generation frontend tooling for faster development.

React: JavaScript library for building user interfaces.

React Router: For dynamic, client-side routing.

State Management: Redux or Context API for managing global application state.

Material UI / Tailwind CSS: Component libraries for building responsive, modern UI.

Backend/Database Stack:
Supabase: A backend-as-a-service (BaaS) solution with the following features:

Authentication: Secure user login and account management.

Real-time Database: Sync user data and progress across devices.

PostgreSQL Database: For data storage and queries.

File Storage: Store media and static files.

Serverless Functions: Handle server-side logic and API requests.

AI Chatbot Integration:
AI-Powered Agent: Leveraging Jotform AI and OpenAI APIs for intelligent, context-aware learning assistance.

Real-Time Chat Interface: Facilitates seamless interaction between users and the AI assistant.

Key Capabilities:

Multi-language Support

Personalized Learning Suggestions

Query Resolution and FAQ Handling



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
npm install --legacy-peer-deps
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

