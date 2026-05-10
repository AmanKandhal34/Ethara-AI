# Ethara AI - Frontend

A modern React + Vite + Tailwind CSS project management application.

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API service layer (axios instance, API calls)
│   ├── assets/           # Images and icons
│   ├── components/       # Reusable React components
│   ├── pages/            # Page components (Login, Dashboard, etc.)
│   ├── layouts/          # Layout components
│   ├── routes/           # Route protection
│   ├── context/          # Context API (Auth context)
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main app component with routing
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── .env.example          # Environment variables example
```

## Features

- **Authentication**: Login/Register with JWT tokens
- **Dashboard**: Overview of projects and tasks
- **Projects**: Create, read, update, delete projects
- **Tasks**: Create, read, update, delete tasks
- **Profile**: User profile management
- **Protected Routes**: Authenticated-only pages
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## Prerequisites

- Node.js (v16+)
- npm or yarn

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your API URL:
```
VITE_API_URL=http://localhost:5000/api
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Build for production:
```bash
npm run build
```

## API Integration

The application expects these API endpoints:

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/register` - Register new user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update user profile

### Projects
- `GET /projects` - List projects
- `GET /projects/:id` - Get project details
- `POST /projects` - Create project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/:id/tasks` - Get project tasks

### Tasks
- `GET /tasks` - List tasks
- `GET /tasks/:id` - Get task details
- `POST /tasks` - Create task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `PATCH /tasks/:id/status` - Update task status

## Technologies Used

- **React** 18.2+ - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Context API** - State management

## Key Components

### Pages
- **Login** - User authentication
- **Register** - User registration
- **Dashboard** - Main dashboard with stats
- **Projects** - Project management
- **Tasks** - Task management
- **Profile** - User profile settings

### Components
- **Navbar** - Top navigation
- **Sidebar** - Side menu
- **Card** - Generic card component
- **TaskCard** - Task display card
- **ProjectCard** - Project display card
- **Loader** - Loading spinner
- **EmptyState** - Empty state message

### Utilities
- **formatDate** - Date formatting utilities
- **constants** - Application constants
- **useAuth** - Authentication hook
- **AuthContext** - Authentication context provider

## Environment Variables

```
VITE_API_URL=http://localhost:5000/api
```

## License

ISC
