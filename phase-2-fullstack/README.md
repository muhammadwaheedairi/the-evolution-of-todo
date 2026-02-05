# Todo Full-Stack Web Application

<p align="center">
  <img src="https://img.shields.io/badge/next.js-16.1.6-black?logo=next.js" alt="Next.js 16.1.6" />
  <img src="https://img.shields.io/badge/fastapi-0.115+-green?logo=fastapi" alt="FastAPI 0.115+" />
  <img src="https://img.shields.io/badge/python-3.13+-blue?logo=python" alt="Python 3.13+" />
  <img src="https://img.shields.io/badge/react-19.2.3-61DAFB?logo=react" alt="React 19.2.3" />
  <img src="https://img.shields.io/badge/typescript-5+-3178C6?logo=typescript" alt="TypeScript 5+" />
  <img src="https://img.shields.io/badge/postgresql-16+-336791?logo=postgresql" alt="PostgreSQL 16+" />
</p>

<p align="center">
  🔐 Secure & Scalable Task Management Platform • Built with Modern Technologies
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/muhammadwaheed1/todo-full-stack-web-application" alt="License" />
  <img src="https://img.shields.io/github/last-commit/muhammadwaheed1/todo-full-stack-web-application" alt="Last Commit" />
  <img src="https://img.shields.io/github/repo-size/muhammadwaheed1/todo-full-stack-web-application" alt="Repo Size" />
</p>

---

## 🚀 Overview

The Todo Full-Stack Web Application is a modern, secure, and scalable task management platform built with cutting-edge technologies. It features a Next.js 16 frontend with React 19, a FastAPI backend with Python 3.13+, and a PostgreSQL database with robust authentication and authorization.

### ✨ Key Features
- **🔐 Secure Authentication**: JWT-based authentication with user isolation
- **📱 Responsive Design**: Works flawlessly on mobile, tablet, and desktop
- **⚡ Real-time Interactions**: Instant task updates and management
- **🎨 Beautiful UI**: Modern design with Tailwind CSS and animations
- **🛡️ Security Focused**: Password hashing, input validation, and data isolation
- **🧪 Well Tested**: Comprehensive unit and integration tests
- **🔄 Microservices**: Separate frontend and backend for scalability
- **☁️ Cloud Ready**: Designed for deployment on cloud platforms

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **[Next.js](https://nextjs.org/)** | React Framework (App Router) | 16.1.6 |
| **[React](https://reactjs.org/)** | UI Library | 19.2.3 |
| **[TypeScript](https://www.typescriptlang.org/)** | Type Safety | 5+ |
| **[Tailwind CSS](https://tailwindcss.com/)** | Styling | Latest |
| **[Lucide React](https://lucide.dev/)** | Icons | Latest |
| **[React Hook Form](https://react-hook-form.com/)** | Form Management | Latest |
| **[Zod](https://zod.dev/)** | Schema Validation | Latest |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **[FastAPI](https://fastapi.tiangolo.com/)** | Web Framework | 0.115+ |
| **[Python](https://www.python.org/)** | Language | 3.13+ |
| **[SQLModel](https://sqlmodel.tiangolo.com/)** | ORM | Latest |
| **[PostgreSQL](https://www.postgresql.org/)** | Database | 16+ |
| **[JWT](https://jwt.io/)** | Authentication | python-jose |
| **[UV](https://github.com/astral-sh/uv)** | Package Manager | Latest |

### Infrastructure
| Technology | Purpose | Version |
|------------|---------|---------|
| **[Neon](https://neon.tech/)** | Serverless PostgreSQL | Latest |
| **[Docker](https://docker.com/)** | Containerization | Latest |
| **[Alembic](https://alembic.sqlalchemy.org/)** | Database Migrations | Latest |

---

## 🏗️ Architecture

### Project Structure
```
Todo-Full-Stack-Web-Application/
├── frontend/                    # Next.js 16+ frontend
│   ├── app/                     # App Router pages
│   ├── components/              # Reusable UI components
│   ├── lib/                     # Utility functions and types
│   ├── public/                  # Static assets
│   ├── README.md                # Frontend documentation
│   └── package.json             # Dependencies
├── backend/                     # FastAPI backend
│   ├── src/                     # Source code
│   │   ├── main.py              # Application entry point
│   │   ├── config.py            # Configuration
│   │   ├── database.py          # DB connection
│   │   ├── models/              # SQLModel definitions
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── routers/             # API routes
│   │   ├── middleware/          # Auth middleware
│   │   ├── services/            # Business logic
│   │   └── utils/               # Helper functions
│   ├── alembic/                 # Database migrations
│   ├── README.md                # Backend documentation
│   └── pyproject.toml           # Dependencies
├── specs/                       # Feature specifications
├── history/                     # Architecture decisions
├── .env                         # Environment variables
├── docker-compose.yml           # Container orchestration
├── CLAUDE.md                    # Project instructions
└── README.md                    # This file
```

---

## 🗄️ Database Schema

### Tables

**users**
```sql
id UUID PRIMARY KEY
email STRING UNIQUE
name STRING
password_hash STRING
created_at TIMESTAMP
updated_at TIMESTAMP
```

**tasks**
```sql
id INTEGER PRIMARY KEY
user_id UUID FOREIGN KEY
title STRING NOT NULL
description TEXT
completed BOOLEAN DEFAULT FALSE
created_at TIMESTAMP
updated_at TIMESTAMP
```

### Indexes
- `tasks.user_id` - For user-based filtering
- `tasks.completed` - For status-based queries

---

## 🌐 API Endpoints

### Authentication
All protected endpoints require:
```
Authorization: Bearer <token>
```

### Available Routes

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | User login | ❌ |
| `GET` | `/api/{user_id}/tasks` | Get user tasks | ✅ |
| `POST` | `/api/{user_id}/tasks` | Create task | ✅ |
| `GET` | `/api/{user_id}/tasks/{id}` | Get task details | ✅ |
| `PUT` | `/api/{user_id}/tasks/{id}` | Update task | ✅ |
| `PATCH` | `/api/{user_id}/tasks/{id}/complete` | Toggle completion | ✅ |
| `DELETE` | `/api/{user_id}/tasks/{id}` | Delete task | ✅ |

---

## 🔐 Security Features

### Data Isolation
- **User Segregation**: Each query filters by `user_id`
- **URL Validation**: Confirms URL user matches authenticated user
- **Privacy Protection**: Returns 404 instead of 403 for unauthorized access

### Authentication
- **Custom JWT Implementation**: Token stored in both localStorage and cookies
- **Password Security**: bcrypt hashing for passwords
- **Input Validation**: Pydantic schemas for all inputs
- **Session Management**: Secure JWT token handling with cross-tab synchronization
- **Route Protection**: Middleware to protect authenticated routes

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- Python 3.13+
- PostgreSQL database
- UV package manager
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Todo-Full-Stack-Web-Application
   ```

2. **Set up the backend**
   ```bash
   cd backend
   uv sync
   # Set up environment variables
   cp .env.example .env
   # Update .env with your configuration
   # Run database migrations
   uv run python run_migrations.py
   # Start the backend server
   uv run python -m src.main
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   # Set up environment variables
   cp .env.local.example .env.local
   # Update .env.local with your configuration
   # Start the frontend server
   npm run dev
   ```

4. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000) to see the application

---

## 🏗️ Development Workflow

### Backend Development
1. Navigate to the `backend/` directory
2. Install dependencies with `uv sync`
3. Run the development server with `uv run python -m src.main`
4. Run tests with `uv run pytest`
5. Create migrations with `uv run alembic revision --autogenerate -m "description"`

### Frontend Development
1. Navigate to the `frontend/` directory
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`
4. Build for production with `npm run build`

### Database Migrations
1. Make changes to SQLModel models in `backend/src/models/`
2. Generate migration: `uv run alembic revision --autogenerate -m "description"`
3. Apply migration: `uv run alembic upgrade head`

---

## 🧪 Testing

### Backend Tests
```bash
# Run all backend tests
cd backend
uv run pytest

# Run tests with coverage
uv run pytest --cov=src --cov-report=html

# Run specific test module
uv run pytest tests/unit/test_models.py
```

### Frontend Tests
```bash
# Run frontend tests
cd frontend
npm test
```

---

## 📦 Deployment

### Production Setup
1. **Environment Configuration**: Update environment variables for production
2. **Database**: Set up production PostgreSQL database
3. **SSL Certificates**: Configure HTTPS
4. **Reverse Proxy**: Set up nginx or similar
5. **Process Manager**: Use PM2 or similar for backend

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### CI/CD Pipeline
- Automated testing on push
- Database migration on deploy
- Environment-specific configurations
- Health checks and monitoring

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with proper TypeScript/Python typing
4. **Ensure all components follow the architecture patterns**
5. **Add tests** for new functionality
6. **Update documentation** as needed
7. **Commit your changes** (`git commit -m 'Add amazing feature'`)
8. **Push to the branch** (`git push origin feature/amazing-feature`)
9. **Open a Pull Request** with clear description

### Development Guidelines
- **Frontend**: Use Server Components by default, Client Components only when needed
- **Backend**: Follow FastAPI best practices and SQLModel patterns
- **Security**: Always implement user data isolation
- **Testing**: Maintain high test coverage
- **Documentation**: Update README files as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

For support or questions:
- Check the [Issues](../../issues) section
- Review the documentation in `frontend/README.md` and `backend/README.md`
- Contact the development team

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the excellent React framework
- [FastAPI](https://fastapi.tiangolo.com/) for the blazing fast web framework
- [SQLModel](https://sqlmodel.tiangolo.com/) for the great ORM
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [PostgreSQL](https://www.postgresql.org/) for the powerful database

---

<p align="center">
Made with ❤️ using Next.js 16, FastAPI, Python 3.13+, React 19 & PostgreSQL
</p>

<p align="center">
<a href="#todo-full-stack-web-application">Back to Top</a>
</p>