# Quick Start Guide: Task CRUD Operations with Authentication

## Overview
This guide provides instructions for setting up and running the Task Management application with authentication.

## Prerequisites
- Node.js 18+ (for frontend)
- Python 3.13+ (for backend)
- PostgreSQL 16 (or Neon Serverless account)
- Docker and Docker Compose (for containerized setup)
- Git

## Repository Structure
```
todo-full-stack-app/
├── backend/              # FastAPI backend
│   ├── src/
│   │   ├── main.py       # Application entry point
│   │   ├── models/       # SQLModel definitions
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── routers/      # API route handlers
│   │   └── utils/        # Utility functions
│   ├── alembic/          # Database migrations
│   └── pyproject.toml    # Python dependencies
├── frontend/             # Next.js frontend
│   ├── app/              # App Router pages
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utilities and API client
│   └── package.json      # Node.js dependencies
└── specs/                # Feature specifications
    └── 001-task-crud-auth/
        ├── spec.md       # Feature specification
        ├── plan.md       # Implementation plan
        ├── research.md   # Research summary
        ├── data-model.md # Data model
        └── contracts/    # API contracts
```

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd todo-full-stack-app
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
uv pip install -r requirements.txt
# Or if using poetry: poetry install
# Or if using pip: pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn src.main:app --reload
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your backend API URL

# Start the frontend development server
npm run dev
```

### 4. Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/todo_db
BETTER_AUTH_SECRET=your-super-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7
UV_ENVIRONMENT=development
LOG_LEVEL=INFO
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-super-secret-key-change-in-production
NEXT_PUBLIC_APP_NAME=Todo App
NEXT_PUBLIC_APP_DESCRIPTION=Full-Stack Todo Application
```

## Running with Docker Compose
```bash
# From the repository root
docker-compose up --build
```

## Development Commands

### Backend
```bash
# Run development server
uv run uvicorn src.main:app --reload

# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=src

# Create database migration
uv run alembic revision --autogenerate -m "migration message"

# Apply database migrations
uv run alembic upgrade head

# Format code
uv run black src/
uv run isort src/
```

### Frontend
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check

# Format code
npm run format
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Log out user

### Tasks
- `GET /api/{user_id}/tasks` - Get all user tasks
- `POST /api/{user_id}/tasks` - Create new task
- `GET /api/{user_id}/tasks/{task_id}` - Get specific task
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle task completion
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task

## Database Models

### User Model
- `id`: UUID (Primary Key)
- `email`: String (Unique, Indexed)
- `password_hash`: String (BCrypt hash)
- `created_at`: DateTime
- `updated_at`: DateTime

### Task Model
- `id`: Integer (Primary Key, Auto-increment)
- `user_id`: UUID (Foreign Key to User)
- `title`: String (1-200 chars)
- `description`: String (Optional, max 1000 chars)
- `completed`: Boolean (Default: false)
- `created_at`: DateTime
- `updated_at`: DateTime

## Frontend Pages

- `/` - Landing page
- `/register` - User registration
- `/login` - User login
- `/tasks` - Task list
- `/tasks/new` - Create task
- `/tasks/[id]` - Edit task

## Security Features

1. **JWT Authentication**: All protected endpoints require valid JWT token
2. **User Data Isolation**: All queries filter by user_id to prevent cross-user access
3. **Password Hashing**: All passwords stored as bcrypt hashes
4. **Input Validation**: All inputs validated on both frontend and backend
5. **Proper Error Handling**: Unauthorized access returns 404 (not 403) to prevent information leakage

## Testing

### Backend Tests
```bash
# Run all tests
uv run pytest

# Run specific test file
uv run pytest tests/unit/test_models.py

# Run with coverage
uv run pytest --cov=src --cov-report=html
```

### Frontend Tests
```bash
# Run component tests
npm run test

# Run end-to-end tests
npm run test:e2e
```

## Deployment

### Backend
The backend is designed to be deployed as a containerized application. Use the provided Dockerfile for containerization.

### Frontend
The frontend is designed for deployment to platforms like Vercel. The Next.js app is configured for server-side rendering and static export capabilities.

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify DATABASE_URL is correctly set in .env
   - Check that PostgreSQL server is running
   - Ensure database name and credentials are correct

2. **Authentication Issues**
   - Verify that BETTER_AUTH_SECRET is the same in both frontend and backend
   - Check that JWT configuration matches between services
   - Ensure CORS settings allow communication between frontend and backend

3. **Frontend/Backend Communication**
   - Verify NEXT_PUBLIC_API_URL points to the correct backend address
   - Check that both services are running simultaneously during development
   - Ensure JWT tokens are properly transmitted in requests

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **Environment Consistency**: Use the same BETTER_AUTH_SECRET in both frontend and backend
3. **Database Migrations**: Always run migrations after pulling code changes that affect the database schema
4. **Local Development**: Use http://localhost:3000 for frontend and http://localhost:8000 for backend in local development

## Performance Considerations

- API requests should complete in under 1 second
- Authentication requests should complete in under 2 seconds
- Database queries are optimized with proper indexing
- JWT tokens provide stateless authentication for horizontal scaling