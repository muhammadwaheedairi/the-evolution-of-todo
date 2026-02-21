# Data Model: Advanced Task Features

**Feature**: 005-advanced-task-features
**Date**: 2026-02-15
**Status**: Complete

This document defines the database schema changes for advanced task features.

---

## Overview

This feature extends the existing `tasks` table with 5 new fields and adds 2 new tables for future functionality. All changes are backward compatible.

---

## Extended Task Model

### Existing Fields (Unchanged)
- `id`: Integer, Primary Key, Auto-increment
- `user_id`: UUID, Foreign Key → users.id, NOT NULL, Indexed
- `title`: String(255), NOT NULL
- `description`: Text, Nullable
- `completed`: Boolean, Default: false, NOT NULL
- `created_at`: DateTime, Default: now(), NOT NULL
- `updated_at`: DateTime, Default: now(), Auto-update, NOT NULL

### New Fields (Phase 5)

#### due_date
- **Type**: DateTime (UTC)
- **Nullable**: Yes
- **Default**: NULL
- **Index**: Yes (idx_tasks_due_date)
- **Purpose**: When task should be completed
- **Validation**: Must be valid datetime, can be in past (marked as overdue)
- **Display**: Convert to user's local timezone in frontend

#### priority
- **Type**: String (Enum: 'high', 'medium', 'low')
- **Nullable**: No
- **Default**: 'medium'
- **Index**: Yes (idx_tasks_priority)
- **Purpose**: Task urgency level
- **Validation**: Must be one of: 'high', 'medium', 'low'
- **Display**: Color-coded badges (red, yellow, green)

#### tags
- **Type**: JSONB (Array of strings)
- **Nullable**: No
- **Default**: [] (empty array)
- **Index**: Yes, GIN index (idx_tasks_tags)
- **Purpose**: User-defined categorization labels
- **Validation**:
  - Each tag: 1-50 characters
  - Trimmed whitespace
  - Case-insensitive comparison (stored lowercase)
  - No duplicate tags per task
- **Example**: `["work", "urgent", "meeting"]`

#### recurrence_pattern
- **Type**: JSONB (Object)
- **Nullable**: Yes
- **Default**: NULL
- **Index**: No (queried infrequently)
- **Purpose**: Recurring task schedule definition
- **Validation**: Must match recurrence schema (see below)
- **Example**: `{"type": "weekly", "interval": 1, "days_of_week": [0,1,2,3,4]}`

#### is_recurring
- **Type**: Boolean
- **Nullable**: No
- **Default**: false
- **Index**: Yes (idx_tasks_is_recurring)
- **Purpose**: Flag to identify recurring tasks
- **Validation**: Must be true if recurrence_pattern is set

### Recurrence Pattern Schema

```json
{
  "type": "daily" | "weekly" | "monthly",
  "interval": <integer>,           // Every N days/weeks/months (min: 1)
  "days_of_week": [<integers>],    // For weekly: 0=Mon, 6=Sun (optional)
  "day_of_month": <integer>,       // For monthly: 1-31 (optional)
  "end_date": "<ISO8601>"          // Optional end date for recurrence
}
```

**Examples**:
- Daily: `{"type": "daily", "interval": 1}`
- Every 2 days: `{"type": "daily", "interval": 2}`
- Weekdays: `{"type": "weekly", "interval": 1, "days_of_week": [0,1,2,3,4]}`
- Monthly on 15th: `{"type": "monthly", "interval": 1, "day_of_month": 15}`
- With end date: `{"type": "daily", "interval": 1, "end_date": "2026-12-31T23:59:59Z"}`

---

## SQLModel Definition

```python
from sqlmodel import Field, Column
from sqlalchemy import JSONB, DateTime, String, Boolean, Index
from sqlalchemy.dialects.postgresql import ARRAY
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PriorityEnum(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    # Existing fields
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=255)
    description: Optional[str] = None
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # NEW: Phase 5 fields
    due_date: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True)))
    priority: str = Field(default="medium", sa_column=Column(String, index=True))
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSONB))
    recurrence_pattern: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
    is_recurring: bool = Field(default=False, index=True)

    # Indexes
    __table_args__ = (
        Index('idx_tasks_user_id', 'user_id'),
        Index('idx_tasks_due_date', 'due_date'),
        Index('idx_tasks_priority', 'priority'),
        Index('idx_tasks_tags', 'tags', postgresql_using='gin'),
        Index('idx_tasks_is_recurring', 'is_recurring'),
    )
```

---

## New Table: notifications

**Purpose**: Track notification delivery for reminders (Phase 5 Part B - future use)

### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique notification ID |
| user_id | UUID | Foreign Key → users.id, NOT NULL, Indexed | Owner of the task |
| task_id | Integer | Foreign Key → tasks.id, NOT NULL, Indexed | Related task |
| notification_type | String | Enum: 'reminder', 'overdue', NOT NULL | Type of notification |
| sent_at | DateTime | Nullable | When notification was sent |
| status | String | Enum: 'pending', 'sent', 'failed', NOT NULL | Delivery status |
| created_at | DateTime | Default: now(), NOT NULL | When notification was created |

### SQLModel Definition

```python
class NotificationTypeEnum(str, Enum):
    REMINDER = "reminder"
    OVERDUE = "overdue"

class NotificationStatusEnum(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"

class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    task_id: int = Field(foreign_key="tasks.id", index=True)
    notification_type: str = Field(sa_column=Column(String))
    sent_at: Optional[datetime] = None
    status: str = Field(default="pending", sa_column=Column(String))
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## New Table: recurring_patterns

**Purpose**: Store recurring task pattern definitions (Phase 5 Part B - future use)

### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique pattern ID |
| user_id | UUID | Foreign Key → users.id, NOT NULL, Indexed | Owner of the pattern |
| task_template | JSONB | NOT NULL | Template for generated tasks |
| pattern_type | String | Enum: 'daily', 'weekly', 'monthly', NOT NULL | Recurrence type |
| pattern_config | JSONB | NOT NULL | Pattern-specific configuration |
| start_date | DateTime | NOT NULL | When recurrence starts |
| end_date | DateTime | Nullable | When recurrence ends (optional) |
| is_active | Boolean | Default: true, NOT NULL | Whether pattern is active |
| created_at | DateTime | Default: now(), NOT NULL | When pattern was created |
| updated_at | DateTime | Default: now(), Auto-update, NOT NULL | Last update time |

### Task Template Schema

```json
{
  "title": "Task title template",
  "description": "Task description template",
  "priority": "medium",
  "tags": ["tag1", "tag2"]
}
```

### SQLModel Definition

```python
class RecurringPattern(SQLModel, table=True):
    __tablename__ = "recurring_patterns"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    task_template: dict = Field(sa_column=Column(JSONB))
    pattern_type: str = Field(sa_column=Column(String))
    pattern_config: dict = Field(sa_column=Column(JSONB))
    start_date: datetime = Field(sa_column=Column(DateTime(timezone=True)))
    end_date: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True)))
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## Relationships

```
users (existing)
  ↓ (1:N)
tasks (extended)
  ↓ (1:N)
notifications (new)

users (existing)
  ↓ (1:N)
recurring_patterns (new)
```

**Note**: No direct relationship between tasks and recurring_patterns in Phase 5 Part A. Relationship will be established in Part B when recurring task generation is implemented.

---

## Indexes Summary

### tasks table
- `idx_tasks_user_id` - B-tree on user_id (existing)
- `idx_tasks_due_date` - B-tree on due_date (NEW)
- `idx_tasks_priority` - B-tree on priority (NEW)
- `idx_tasks_tags` - GIN on tags (NEW)
- `idx_tasks_is_recurring` - B-tree on is_recurring (NEW)
- `idx_tasks_search` - GIN on search_vector (NEW - for full-text search)

### notifications table
- `idx_notifications_user_id` - B-tree on user_id (NEW)
- `idx_notifications_task_id` - B-tree on task_id (NEW)

### recurring_patterns table
- `idx_recurring_patterns_user_id` - B-tree on user_id (NEW)

---

## Full-Text Search Support

### Search Vector Column

Add computed column for full-text search:

```sql
ALTER TABLE tasks ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED;

CREATE INDEX idx_tasks_search ON tasks USING GIN(search_vector);
```

### SQLModel Definition

```python
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import TSVECTOR

class Task(SQLModel, table=True):
    # ... existing fields ...

    search_vector: Optional[str] = Field(
        default=None,
        sa_column=Column(
            TSVECTOR,
            Computed("to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))")
        )
    )
```

---

## Migration Strategy

### Phase 1: Add columns to tasks table
```sql
ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN priority VARCHAR DEFAULT 'medium' NOT NULL;
ALTER TABLE tasks ADD COLUMN tags JSONB DEFAULT '[]' NOT NULL;
ALTER TABLE tasks ADD COLUMN recurrence_pattern JSONB;
ALTER TABLE tasks ADD COLUMN is_recurring BOOLEAN DEFAULT false NOT NULL;
```

### Phase 2: Create indexes
```sql
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);
CREATE INDEX idx_tasks_is_recurring ON tasks(is_recurring);
```

### Phase 3: Add search support
```sql
ALTER TABLE tasks ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED;

CREATE INDEX idx_tasks_search ON tasks USING GIN(search_vector);
```

### Phase 4: Create new tables
```sql
CREATE TABLE notifications (...);
CREATE TABLE recurring_patterns (...);
```

### Rollback Strategy
All operations are reversible:
```sql
DROP TABLE recurring_patterns;
DROP TABLE notifications;
DROP INDEX idx_tasks_search;
ALTER TABLE tasks DROP COLUMN search_vector;
DROP INDEX idx_tasks_is_recurring;
DROP INDEX idx_tasks_tags;
DROP INDEX idx_tasks_priority;
DROP INDEX idx_tasks_due_date;
ALTER TABLE tasks DROP COLUMN is_recurring;
ALTER TABLE tasks DROP COLUMN recurrence_pattern;
ALTER TABLE tasks DROP COLUMN tags;
ALTER TABLE tasks DROP COLUMN priority;
ALTER TABLE tasks DROP COLUMN due_date;
```

---

## Validation Rules

### Priority
- Must be one of: 'high', 'medium', 'low'
- Case-sensitive (lowercase only)
- Default: 'medium'

### Tags
- Array of strings
- Each tag: 1-50 characters
- Trimmed whitespace
- Stored lowercase for consistency
- No duplicates within same task
- Empty array allowed

### Due Date
- Valid datetime in ISO 8601 format
- Stored as UTC
- Can be in past (marked as overdue in UI)
- Nullable (not all tasks have deadlines)

### Recurrence Pattern
- Must match JSON schema
- type: Required, one of 'daily', 'weekly', 'monthly'
- interval: Required, integer >= 1
- days_of_week: Optional, array of integers 0-6 (for weekly)
- day_of_month: Optional, integer 1-31 (for monthly)
- end_date: Optional, ISO 8601 datetime

### Is Recurring
- Boolean
- Must be true if recurrence_pattern is set
- Must be false if recurrence_pattern is null

---

## Query Patterns

### Filter by priority
```python
tasks = session.exec(
    select(Task)
    .where(Task.user_id == user_id)
    .where(Task.priority == "high")
).all()
```

### Filter by tags (contains any)
```python
tasks = session.exec(
    select(Task)
    .where(Task.user_id == user_id)
    .where(Task.tags.contains(["work"]))
).all()
```

### Filter by due date range
```python
tasks = session.exec(
    select(Task)
    .where(Task.user_id == user_id)
    .where(Task.due_date >= start_date)
    .where(Task.due_date <= end_date)
).all()
```

### Full-text search
```python
tasks = session.exec(
    select(Task)
    .where(Task.user_id == user_id)
    .where(Task.search_vector.match(search_query))
).all()
```

### Combined filters
```python
tasks = session.exec(
    select(Task)
    .where(Task.user_id == user_id)
    .where(Task.priority == "high")
    .where(Task.tags.contains(["work"]))
    .where(Task.due_date >= datetime.now())
    .order_by(Task.due_date.asc())
).all()
```

---

## Data Model Complete

All schema changes defined. Ready to generate API contracts.
