# Quickstart Guide: Advanced Task Features

**Feature**: 005-advanced-task-features
**Date**: 2026-02-15
**Audience**: Developers implementing this feature

This guide provides step-by-step instructions for setting up, implementing, and testing advanced task features.

---

## Prerequisites

- Existing Phase 4 Todo application running locally
- Python 3.13+ with UV package manager
- Node.js 20+ with npm
- PostgreSQL client (for Neon database)
- Git
- OpenAI API key (for chat interface)

---

## Setup Instructions

### 1. Checkout Feature Branch

```bash
cd /path/to/Todo-Full-Stack-Web-Application
git checkout 005-advanced-task-features
```

### 2. Backend Setup

#### Install Dependencies (if any new ones)

```bash
cd backend
uv sync
```

#### Run Database Migration

```bash
# Create migration
uv run alembic revision --autogenerate -m "Add advanced task fields"

# Review generated migration in alembic/versions/
# Ensure it matches data-model.md

# Apply migration
uv run alembic upgrade head

# Verify migration
uv run alembic current
```

#### Verify Database Schema

```bash
# Connect to Neon database
psql $DATABASE_URL

# Check tasks table
\d tasks

# Verify new columns exist:
# - due_date (timestamp with time zone)
# - priority (character varying, default 'medium')
# - tags (jsonb, default '[]')
# - recurrence_pattern (jsonb)
# - is_recurring (boolean, default false)

# Check indexes
\di

# Verify new indexes:
# - idx_tasks_due_date
# - idx_tasks_priority
# - idx_tasks_tags (GIN)
# - idx_tasks_is_recurring
# - idx_tasks_search (GIN on search_vector)

# Check new tables
\dt

# Verify:
# - notifications
# - recurring_patterns

\q
```

### 3. Frontend Setup

#### Install Dependencies (if any new ones)

```bash
cd frontend
npm install
```

#### Update Environment Variables

```bash
# No new environment variables required
# Existing NEXT_PUBLIC_API_URL and NEXT_PUBLIC_OPENAI_DOMAIN_KEY still valid
```

---

## Development Workflow

### Backend Development

#### 1. Update Models

```bash
# Edit backend/src/models/task.py
# Add 5 new fields as per data-model.md

# Create new models
# backend/src/models/notification.py
# backend/src/models/recurring_pattern.py
```

#### 2. Update Schemas

```bash
# Edit backend/src/schemas/task.py
# Add new fields to TaskCreate, TaskUpdate, TaskResponse schemas
```

#### 3. Update Services

```bash
# Edit backend/src/services/task_service.py
# Add filter, search, and tag logic
```

#### 4. Update API Endpoints

```bash
# Edit backend/src/routers/tasks.py
# Add query parameters to GET /api/{user_id}/tasks
# Add GET /api/{user_id}/tasks/search
# Add GET /api/{user_id}/tags
```

#### 5. Update MCP Tools

```bash
# Edit backend/src/mcp/tools.py
# Update add_task tool with new parameters
# Update list_tasks tool with filter parameters
```

#### 6. Update Agent System Prompt

```bash
# Edit backend/src/utils/agent.py
# Add instructions for parsing priority, tags, due dates
# Add examples of natural language commands
```

#### 7. Run Backend

```bash
cd backend
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

#### 1. Update Types

```bash
# Edit frontend/lib/types.ts
# Add new Task fields
```

#### 2. Update API Client

```bash
# Edit frontend/lib/api.ts
# Add filter parameters to getTasks()
# Add searchTasks() function
# Add getUserTags() function
```

#### 3. Create New Components

```bash
# Create frontend/components/tasks/PriorityBadge.tsx
# Create frontend/components/tasks/TagCloud.tsx
# Create frontend/components/tasks/DueDatePicker.tsx
# Create frontend/components/tasks/RecurrenceSelector.tsx
# Create frontend/components/tasks/TaskFilters.tsx
```

#### 4. Update Existing Components

```bash
# Edit frontend/components/tasks/TaskItem.tsx
# Display priority badge, tags, due date

# Edit frontend/components/tasks/TaskForm.tsx
# Add inputs for new fields

# Edit frontend/app/chat/page.tsx
# Handle new tool responses
```

#### 5. Run Frontend

```bash
cd frontend
npm run dev
```

---

## Testing

### Backend Tests

#### Unit Tests

```bash
cd backend

# Test task service with filters
uv run pytest tests/test_task_filters.py -v

# Test search functionality
uv run pytest tests/test_search.py -v

# Test recurring task logic
uv run pytest tests/test_recurring.py -v

# Test MCP tools with new parameters
uv run pytest tests/test_mcp_advanced.py -v

# Run all tests
uv run pytest -v
```

#### Manual API Testing

```bash
# Create task with priority and tags
curl -X POST http://localhost:8000/api/{user_id}/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "priority": "high",
    "tags": ["shopping", "urgent"],
    "due_date": "2026-02-20T18:00:00Z"
  }'

# Filter by priority
curl http://localhost:8000/api/{user_id}/tasks?priority=high \
  -H "Authorization: Bearer $TOKEN"

# Filter by tags
curl http://localhost:8000/api/{user_id}/tasks?tags=work,urgent \
  -H "Authorization: Bearer $TOKEN"

# Search tasks
curl http://localhost:8000/api/{user_id}/tasks/search?q=meeting \
  -H "Authorization: Bearer $TOKEN"

# Get user tags
curl http://localhost:8000/api/{user_id}/tags \
  -H "Authorization: Bearer $TOKEN"
```

### Frontend Tests

#### Component Tests

```bash
cd frontend

# Test priority badge
npm test -- PriorityBadge.test.tsx

# Test tag cloud
npm test -- TagCloud.test.tsx

# Test task filters
npm test -- TaskFilters.test.tsx

# Run all component tests
npm test
```

#### E2E Tests

```bash
cd frontend

# Run Playwright tests
npm run test:e2e

# Run specific test
npx playwright test advanced-features.spec.ts
```

### Natural Language Testing

Test via chat interface at http://localhost:3000/chat:

1. **Priority**: "add high priority task buy milk"
2. **Tags**: "add task meeting tagged work urgent"
3. **Due Date**: "add task report due tomorrow"
4. **Combined**: "add high priority task buy milk due tomorrow tagged shopping"
5. **Filter**: "show me high priority tasks"
6. **Filter by Tags**: "show tasks tagged work"
7. **Search**: "search for tasks about meeting"
8. **Recurring**: "create recurring task standup every weekday"

Expected: Agent correctly interprets all commands and creates/filters tasks accordingly.

---

## Natural Language Examples

### Creating Tasks

| User Input | Expected Result |
|------------|-----------------|
| "add task buy milk" | Task created with default priority (medium) |
| "add high priority task buy milk" | Task created with high priority |
| "add task buy milk due tomorrow" | Task created with due date set to tomorrow |
| "add task buy milk tagged shopping groceries" | Task created with tags ["shopping", "groceries"] |
| "add high priority task buy milk due tomorrow tagged shopping" | Task with all features |
| "create recurring task standup every weekday" | Recurring task (Mon-Fri) |

### Filtering Tasks

| User Input | Expected Result |
|------------|-----------------|
| "show me all tasks" | All tasks listed |
| "show high priority tasks" | Only high priority tasks |
| "show tasks tagged work" | Tasks with "work" tag |
| "show tasks due this week" | Tasks due within 7 days |
| "show overdue tasks" | Tasks past due date |

### Searching Tasks

| User Input | Expected Result |
|------------|-----------------|
| "search for meeting" | Tasks containing "meeting" in title/description |
| "find tasks about project" | Full-text search results |

---

## Troubleshooting

### Migration Issues

**Problem**: Migration fails with "column already exists"
**Solution**: Check if migration was already applied. Run `alembic current` to verify.

**Problem**: Existing tasks don't have new fields
**Solution**: New fields are nullable with defaults. Existing tasks will have:
- priority: "medium"
- tags: []
- is_recurring: false
- due_date: null
- recurrence_pattern: null

### Search Not Working

**Problem**: Search returns no results
**Solution**: Verify search_vector column exists and GIN index is created:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'tasks' AND column_name = 'search_vector';
```

### Natural Language Parsing Issues

**Problem**: Agent doesn't recognize priority/tags/due dates
**Solution**: Verify agent system prompt includes new instructions. Check OpenAI API logs for errors.

### Filter Performance Issues

**Problem**: Filtering is slow with many tasks
**Solution**: Verify indexes exist:
```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'tasks';
```

---

## Deployment

### Local Deployment (No Changes)

```bash
# Backend
cd backend
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm run build
npm start
```

### Kubernetes Deployment (Phase 4)

```bash
# Rebuild Docker images
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# Deploy to Minikube
eval $(minikube docker-env)
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# Run migration as Kubernetes Job (before deployment)
kubectl create job alembic-migrate --image=todo-backend:latest \
  --namespace=todo-app \
  -- alembic upgrade head

# Deploy via Helm (existing charts)
helm upgrade todo-app ./helm \
  --namespace todo-app \
  --values ./helm/values-dev.yaml

# Verify deployment
kubectl get pods -n todo-app
kubectl logs -f deployment/backend-deployment -n todo-app
```

---

## Rollback Procedure

If issues arise, rollback the migration:

```bash
# Backend
cd backend

# Rollback one migration
uv run alembic downgrade -1

# Or rollback to specific version
uv run alembic downgrade <revision_id>

# Verify rollback
uv run alembic current
```

For Kubernetes deployment:

```bash
# Rollback Helm release
helm rollback todo-app -n todo-app

# Verify rollback
helm history todo-app -n todo-app
```

---

## Performance Benchmarks

Expected performance with 1000 tasks:

- **Filter by priority**: <100ms
- **Filter by tags**: <200ms
- **Filter by due date range**: <150ms
- **Combined filters**: <500ms
- **Full-text search**: <1 second
- **Get user tags**: <50ms

If performance is slower, check:
1. Indexes are created
2. Database connection pool is configured
3. Query optimization (use EXPLAIN ANALYZE)

---

## Next Steps

After completing implementation:

1. Run `/sp.tasks` to generate detailed task breakdown
2. Implement tasks in order (backend → frontend → tests)
3. Test thoroughly with natural language examples
4. Deploy to Minikube for integration testing
5. Deploy to OKE production (if Phase 4 complete)

---

## Support

For issues or questions:
- Check spec.md for requirements
- Check data-model.md for schema details
- Check API contracts in contracts/ directory
- Review research.md for technical decisions
- Consult root CLAUDE.md for project standards
