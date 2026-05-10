# Ethara AI - Backend API

A robust Node.js + Express + MongoDB backend for the Ethara AI project management application.

## Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── db.js           # MongoDB connection
│   │   └── env.js          # Environment variables
│   │
│   ├── models/             # Database schemas
│   │   ├── user.model.js
│   │   ├── project.model.js
│   │   └── task.model.js
│   │
│   ├── controllers/        # Request handlers
│   │   ├── auth.controller.js
│   │   ├── project.controller.js
│   │   └── task.controller.js
│   │
│   ├── routes/             # API endpoints
│   │   ├── auth.routes.js
│   │   ├── project.routes.js
│   │   └── task.routes.js
│   │
│   ├── middleware/         # Custom middleware
│   │   ├── auth.middleware.js    # JWT verification
│   │   └── error.middleware.js   # Error handling
│   │
│   ├── services/           # Business logic
│   │   ├── auth.service.js
│   │   ├── project.service.js
│   │   └── task.service.js
│   │
│   ├── utils/              # Helper functions
│   │   ├── generateToken.js
│   │   └── responseHandler.js
│   │
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
│
├── .env                    # Environment variables
├── .env.example            # Environment template
├── package.json            # Dependencies
└── README.md              # Documentation
```

## Features

- **Authentication**: JWT-based user authentication
- **Authorization**: Role-based access control (user, admin)
- **Project Management**: Create, read, update, delete projects
- **Task Management**: Full task lifecycle management
- **User Management**: Profile management and user administration
- **Error Handling**: Comprehensive error handling middleware
- **Input Validation**: Request validation and sanitization
- **CORS**: Cross-origin resource sharing support

## Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB (v4.4+)

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ethara-ai
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `POST /api/auth/logout` - Logout (protected)

### Projects
- `GET /api/projects` - List all projects (protected)
- `POST /api/projects` - Create project (protected)
- `GET /api/projects/:id` - Get project details (protected)
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)
- `POST /api/projects/:id/members` - Add member (protected)
- `DELETE /api/projects/:id/members` - Remove member (protected)
- `GET /api/projects/:id/tasks` - Get project tasks (protected)

### Tasks
- `GET /api/tasks` - List all tasks (protected)
- `POST /api/tasks` - Create task (protected)
- `GET /api/tasks/:id` - Get task details (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `PATCH /api/tasks/:id/status` - Update task status (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)
- `POST /api/tasks/:id/subtasks` - Add subtask (protected)
- `POST /api/tasks/:id/comments` - Add comment (protected)

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {}
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Database Models

### User
- `name` - User name
- `email` - Unique email
- `password` - Hashed password
- `role` - User role (user/admin)
- `avatar` - Avatar URL
- `bio` - User bio
- `isActive` - Account active status
- `lastLogin` - Last login timestamp

### Project
- `name` - Project name
- `description` - Project description
- `owner` - Project owner (User)
- `members` - Project members (User[])
- `status` - Status (active/completed/on-hold/cancelled)
- `priority` - Priority (low/medium/high/urgent)
- `startDate` - Project start date
- `endDate` - Project end date
- `budget` - Project budget
- `tags` - Project tags

### Task
- `title` - Task title
- `description` - Task description
- `project` - Associated project
- `assignee` - Assigned user
- `createdBy` - Task creator
- `status` - Status (pending/in-progress/completed/cancelled)
- `priority` - Priority level
- `dueDate` - Due date
- `estimatedHours` - Estimated hours
- `actualHours` - Actual hours spent
- `subtasks` - Task subtasks
- `comments` - Task comments

## Middleware

### Authentication Middleware
Verifies JWT token from Authorization header:
```
Authorization: Bearer <token>
```

### Error Middleware
Handles various error types:
- Validation errors
- MongoDB errors
- JWT errors
- Custom errors

## Technologies Used

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin support
- **dotenv** - Environment management

## Best Practices

- All sensitive data is hashed (passwords)
- Input validation on all endpoints
- Protected routes require authentication
- Consistent error handling
- Pagination support for list endpoints
- Proper HTTP status codes
- RESTful API design

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- CORS enabled for frontend domain
- Input validation and sanitization
- Error messages don't expose sensitive info

## Environment Variables

```
PORT              - Server port (default: 5000)
NODE_ENV         - Environment (development/production)
MONGO_URI        - MongoDB connection string
JWT_SECRET       - Secret key for JWT signing
JWT_EXPIRE       - JWT expiration time
CORS_ORIGIN      - Frontend URL for CORS
```

## Testing

Run tests:
```bash
npm test
```

## License

ISC
