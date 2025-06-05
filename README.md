# Task Management API

A comprehensive Task Management API built with Node.js, TypeScript, Express, and MongoDB. This API provides full CRUD operations for task management with user authentication and authorization.

## Features

- **User Authentication & Authorization**: JWT-based authentication system
- **Task Management**: Create, read, update, and delete tasks
- **User Profile Management**: User registration, login, and profile updates
- **Task Statistics**: Get insights into task completion and priority distribution
- **Search & Filtering**: Search tasks and filter by status, priority, etc.
- **Pagination**: Efficient data retrieval with pagination support
- **Input Validation**: Comprehensive request validation using Joi
- **Error Handling**: Centralized error handling with custom error classes
- **Security**: Helmet, CORS, and rate limiting for enhanced security
- **Logging**: Winston-based logging system
- **TypeScript**: Fully typed codebase for better development experience

## Tech Stack

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Joi** - Input validation
- **Winston** - Logging
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API rate limiting

## Project Structure

```
src/
├── config/
│   └── database.ts          # Database configuration
├── controllers/
│   ├── authController.ts    # Authentication logic
│   ├── taskController.ts    # Task management logic
│   └── userController.ts    # User management logic
├── middleware/
│   ├── auth.ts             # Authentication middleware
│   ├── errorHandler.ts     # Error handling middleware
│   ├── notFound.ts         # 404 handler
│   └── validation.ts       # Input validation middleware
├── models/
│   ├── User.ts             # User model
│   └── Task.ts             # Task model
├── routes/
│   ├── auth.ts             # Authentication routes
│   ├── tasks.ts            # Task routes
│   └── users.ts            # User routes
├── utils/
│   ├── AppError.ts         # Custom error class
│   └── logger.ts           # Logging configuration
└── index.ts                # Application entry point
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-management-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/task-management
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   ```

4. **Create logs directory**
   ```bash
   mkdir logs
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Build
```bash
npm run build
```

### Clean build directory
```bash
npm run clean
```

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)

### Task Routes
- `GET /api/tasks` - Get all tasks (protected)
- `POST /api/tasks` - Create a new task (protected)
- `GET /api/tasks/:id` - Get a specific task (protected)
- `PUT /api/tasks/:id` - Update a task (protected)
- `DELETE /api/tasks/:id` - Delete a task (protected)
- `GET /api/tasks/stats` - Get task statistics (protected)

### User Routes
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get a specific user (protected)
- `GET /api/users/:id/tasks` - Get user's tasks (protected)
- `PUT /api/users/deactivate` - Deactivate user account (protected)

### Health Check
- `GET /health` - Health check endpoint

## Request/Response Examples

### Register User
```json
POST /api/auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Task
```json
POST /api/tasks
Authorization: Bearer <jwt-token>
{
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation for the API",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "tags": ["documentation", "project"]
}
```

### Get Tasks with Pagination
```json
GET /api/tasks?page=1&limit=10
Authorization: Bearer <jwt-token>
```
### Update Task
```json
PUT /api/tasks/:id
Authorization: Bearer <jwt-token>
{
  "title": "Update project documentation",
  "description": "Revise the documentation based on feedback",
  "priority": "medium",
  "dueDate": "2025-01-15T23:59:59.000Z",
  "tags": ["documentation", "update"]
}
```
### Delete Task
```json
DELETE /api/tasks/:id
Authorization: Bearer <jwt-token>
```
### Get Task Statistics
```json
GET /api/tasks/stats
Authorization: Bearer <jwt-token>
```
### Get User Profile
```json
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```
### Update User Profile
```json
PUT /api/auth/profile
Authorization: Bearer <jwt-token>
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}
```
### Change Password
```json
PUT /api/auth/change-password
Authorization: Bearer <jwt-token>
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```
### Deactivate User Account
```json
PUT /api/users/deactivate
Authorization: Bearer <jwt-token>
```
```json
{
  "password": "password123"
}
```
