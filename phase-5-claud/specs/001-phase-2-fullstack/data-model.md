# Data Model: Task CRUD Operations with Authentication

## 1. Entity Definitions

### 1.1 User Entity
**Description**: Represents a registered user in the system

**Fields**:
- `id`: UUID (Primary Key) - Unique identifier for the user
- `email`: String (Unique, Indexed) - User's email address (validated format, max 255 chars)
- `password_hash`: String - BCrypt hash of the user's password (max 255 chars)
- `created_at`: DateTime - Timestamp when the account was created (UTC)
- `updated_at`: DateTime - Timestamp when the account was last updated (UTC)

**Relationships**:
- One-to-Many: User has many Tasks (via `user_id` foreign key)

**Constraints**:
- Email must be unique
- Email must follow standard email format validation
- Password must be at least 8 characters (before hashing)
- Created timestamp automatically set on creation
- Updated timestamp automatically updated on modification

### 1.2 Task Entity
**Description**: Represents a task owned by a user

**Fields**:
- `id`: Integer (Primary Key, Auto-increment) - Unique identifier for the task
- `user_id`: UUID (Foreign Key to User.id, Indexed) - Owner of the task
- `title`: String (Indexed) - Title of the task (1-200 characters)
- `description`: String (Nullable, max 1000 characters) - Optional description of the task
- `completed`: Boolean (Indexed, default false) - Completion status of the task
- `created_at`: DateTime - Timestamp when the task was created (UTC)
- `updated_at`: DateTime - Timestamp when the task was last updated (UTC)

**Relationships**:
- Many-to-One: Task belongs to one User (via `user_id` foreign key)

**Constraints**:
- Title must be between 1-200 characters
- Description is optional, max 1000 characters
- Completion status defaults to false
- Created timestamp automatically set on creation
- Updated timestamp automatically updated on modification
- User_id must reference an existing user (foreign key constraint)

## 2. Entity Relationships

### 2.1 User-Task Relationship
```
User (1) <---> (Many) Task
User.id ←→ Task.user_id (Foreign Key)
```

**Relationship Type**: One-to-Many (One user owns many tasks)

**Behavior**:
- When a user is deleted, their tasks are NOT automatically deleted (no cascade)
- All queries must filter tasks by user_id to maintain data isolation
- Tasks cannot exist without a valid user owner

## 3. Data Validation Rules

### 3.1 User Validation
- Email: Must match standard email format (regex validation)
- Password: Minimum 8 characters (before hashing)
- Email: Required and unique across all users
- All timestamps: Stored in UTC format

### 3.2 Task Validation
- Title: Required, 1-200 characters
- Description: Optional, max 1000 characters
- Completed: Boolean, defaults to false
- User_id: Must reference an existing user
- All timestamps: Stored in UTC format

## 4. Indexes

### 4.1 Required Indexes
- `users.email`: Unique index for fast user lookup by email
- `users.id`: Primary key index
- `tasks.user_id`: Index for efficient filtering by user
- `tasks.completed`: Index for filtering completed tasks
- `tasks.created_at`: Index for sorting by creation date
- `tasks.id`: Primary key index

### 4.2 Composite Indexes (if needed)
- `tasks(user_id, created_at)`: For efficient user-specific chronological queries

## 5. State Transitions

### 5.1 Task State Transitions
- **Creation**: `completed` starts as `false`
- **Completion Toggle**: `completed` changes from `false` to `true`
- **Uncompletion Toggle**: `completed` changes from `true` to `false`

### 5.2 User State Transitions
- **Registration**: User account created with valid email and hashed password
- **Password Update**: Password hash updated (current password verification required)

## 6. Security Considerations

### 6.1 Data Isolation
- All task queries must include `WHERE user_id = :authenticated_user_id`
- User authentication must be validated before any data access
- Return 404 (not 403) for unauthorized access attempts

### 6.2 Field Sensitivity
- Passwords must never be stored in plain text
- Password hashes should only be accessible during authentication
- User IDs should be treated as internal identifiers, not exposed directly to clients where possible

## 7. API Representation

### 7.1 User API Model
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "created_at": "2026-01-28T10:00:00Z",
  "updated_at": "2026-01-28T10:00:00Z"
}
```

### 7.2 Task API Model
```json
{
  "id": 1,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Sample task",
  "description": "Optional description",
  "completed": false,
  "created_at": "2026-01-28T10:00:00Z",
  "updated_at": "2026-01-28T10:00:00Z"
}
```

### 7.3 Task List Response
```json
{
  "tasks": [
    {
      "id": 1,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Sample task",
      "description": "Optional description",
      "completed": false,
      "created_at": "2026-01-28T10:00:00Z",
      "updated_at": "2026-01-28T10:00:00Z"
    }
  ]
}
```

## 8. Database Schema SQL

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for tasks
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```