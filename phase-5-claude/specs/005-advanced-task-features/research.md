# Research & Technical Decisions: Advanced Task Features

**Feature**: 005-advanced-task-features
**Date**: 2026-02-15
**Status**: Complete

This document captures research findings and technical decisions for implementing advanced task features.

---

## Research Topic 1: PostgreSQL JSON Field Best Practices

### Decision: Use JSONB for tags and recurrence_pattern

**Rationale**:
- JSONB provides better query performance than JSON (binary format, indexed)
- SQLModel/SQLAlchemy supports JSONB with proper type hints
- Allows flexible schema evolution without migrations
- Native PostgreSQL operators for JSON queries (contains, exists)
- Neon PostgreSQL fully supports JSONB

**Implementation**:
```python
# SQLModel field definition
tags: List[str] = Field(default_factory=list, sa_column=Column(JSONB))
recurrence_pattern: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
```

**Alternatives Considered**:
- Separate tags table with many-to-many relationship - Rejected: Overkill for simple tag list, adds query complexity
- Plain TEXT field with comma-separated values - Rejected: No type safety, difficult to query
- PostgreSQL ARRAY type - Rejected: Less flexible than JSONB for recurrence_pattern

---

## Research Topic 2: Full-Text Search Implementation

### Decision: PostgreSQL tsvector with GIN index

**Rationale**:
- Native PostgreSQL full-text search (no external dependencies)
- GIN index provides fast search on title and description
- Supports ranking and relevance scoring
- Works seamlessly with SQLModel queries
- Sufficient for 1000+ tasks per user

**Implementation**:
```python
# Add tsvector column in migration
search_vector = Column(
    TSVector(),
    Computed("to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))")
)

# Create GIN index
CREATE INDEX idx_tasks_search ON tasks USING GIN(search_vector);

# Query example
tasks = session.exec(
    select(Task).where(
        Task.user_id == user_id,
        Task.search_vector.match(search_query)
    )
).all()
```

**Alternatives Considered**:
- Simple LIKE/ILIKE queries - Rejected: Poor performance on large datasets, no ranking
- Elasticsearch - Rejected: Overkill, adds infrastructure complexity, violates Phase 5 Part A constraints
- PostgreSQL pg_trgm extension - Rejected: Less accurate than tsvector for full words

---

## Research Topic 3: Recurring Task Pattern Representation

### Decision: Custom JSON schema with type and config fields

**Rationale**:
- Flexible enough for daily, weekly, monthly patterns
- Extensible for future custom patterns
- Human-readable and debuggable
- Easy to validate with Pydantic schemas
- No external cron library dependencies

**Schema Structure**:
```json
{
  "type": "daily" | "weekly" | "monthly",
  "interval": 1,  // Every N days/weeks/months
  "days_of_week": [0, 1, 2, 3, 4],  // For weekly (0=Monday)
  "day_of_month": 15,  // For monthly
  "end_date": "2026-12-31T23:59:59Z"  // Optional
}
```

**Examples**:
- Daily: `{"type": "daily", "interval": 1}`
- Every weekday: `{"type": "weekly", "interval": 1, "days_of_week": [0,1,2,3,4]}`
- Monthly on 15th: `{"type": "monthly", "interval": 1, "day_of_month": 15}`

**Alternatives Considered**:
- Cron expressions - Rejected: Too complex for users, difficult to parse in natural language
- Separate fields (type, interval, days) - Rejected: Less flexible, requires schema changes for new patterns
- iCalendar RRULE format - Rejected: Overly complex for simple use cases

---

## Research Topic 4: Natural Language Date Parsing

### Decision: Leverage OpenAI agent's built-in date understanding

**Rationale**:
- GPT-4 has excellent natural language date parsing capabilities
- No additional libraries needed (dateparser, parsedatetime)
- Agent can handle relative dates ("tomorrow", "next Monday", "in 3 days")
- Agent can handle absolute dates ("February 20", "2026-02-20")
- Agent returns ISO 8601 format directly

**Implementation**:
- Update agent system prompt with date parsing instructions
- Agent extracts due_date as ISO 8601 string
- Backend validates and converts to datetime object
- Fallback: If agent fails, ask user for clarification

**Agent Prompt Addition**:
```
When user specifies a due date:
- Parse relative dates: "tomorrow" = next day, "next week" = 7 days from now
- Parse absolute dates: "February 20" = 2026-02-20 (assume current year if not specified)
- Return as ISO 8601 format: "2026-02-20T23:59:59Z"
- Default time to end of day (23:59:59) if not specified
- Ask for clarification if date is ambiguous
```

**Alternatives Considered**:
- dateparser library - Rejected: Adds dependency, agent already handles this
- Manual parsing with regex - Rejected: Fragile, doesn't handle all cases
- Require structured date input - Rejected: Defeats purpose of natural language interface

---

## Research Topic 5: Database Migration Strategy

### Decision: Alembic migration with nullable fields and defaults

**Rationale**:
- Backward compatible (existing code works with new schema)
- Safe for production (no data loss risk)
- Rollback-friendly (can revert migration)
- Follows SQLModel/Alembic best practices
- Existing Phase 4 app already uses Alembic

**Migration Structure**:
```python
def upgrade():
    # Add new columns (all nullable with defaults)
    op.add_column('tasks', sa.Column('due_date', sa.DateTime(), nullable=True))
    op.add_column('tasks', sa.Column('priority', sa.String(), nullable=False, server_default='medium'))
    op.add_column('tasks', sa.Column('tags', JSONB, nullable=False, server_default='[]'))
    op.add_column('tasks', sa.Column('recurrence_pattern', JSONB, nullable=True))
    op.add_column('tasks', sa.Column('is_recurring', sa.Boolean(), nullable=False, server_default='false'))

    # Create indexes
    op.create_index('idx_tasks_priority', 'tasks', ['priority'])
    op.create_index('idx_tasks_due_date', 'tasks', ['due_date'])
    op.create_index('idx_tasks_tags', 'tasks', ['tags'], postgresql_using='gin')

    # Create new tables
    op.create_table('notifications', ...)
    op.create_table('recurring_patterns', ...)

def downgrade():
    # Drop tables
    op.drop_table('recurring_patterns')
    op.drop_table('notifications')

    # Drop indexes
    op.drop_index('idx_tasks_tags')
    op.drop_index('idx_tasks_due_date')
    op.drop_index('idx_tasks_priority')

    # Drop columns
    op.drop_column('tasks', 'is_recurring')
    op.drop_column('tasks', 'recurrence_pattern')
    op.drop_column('tasks', 'tags')
    op.drop_column('tasks', 'priority')
    op.drop_column('tasks', 'due_date')
```

**Testing Strategy**:
1. Test on local database copy
2. Verify existing tasks unaffected
3. Test rollback (downgrade)
4. Test with production-like data volume

**Alternatives Considered**:
- Non-nullable fields - Rejected: Requires data migration for existing tasks
- Separate migration per field - Rejected: Too many migrations, deployment complexity
- Manual SQL scripts - Rejected: Alembic provides version control and rollback

---

## Research Topic 6: Frontend Date Picker Library

### Decision: Native HTML5 datetime-local input with Tailwind styling

**Rationale**:
- No additional dependencies (keeps bundle size small)
- Works across all modern browsers
- Accessible by default (keyboard navigation, screen readers)
- Mobile-friendly (native date picker on mobile devices)
- Easy to style with Tailwind CSS
- Sufficient for MVP (can upgrade to react-datepicker later if needed)

**Implementation**:
```tsx
<input
  type="datetime-local"
  value={dueDate}
  onChange={(e) => setDueDate(e.target.value)}
  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
/>
```

**Alternatives Considered**:
- react-datepicker - Rejected: Adds 50KB to bundle, overkill for simple date selection
- date-fns + custom picker - Rejected: More code to maintain
- Headless UI date picker - Rejected: Not yet available in Headless UI

---

## Research Topic 7: Tag Input Component Pattern

### Decision: Combobox with autocomplete (Headless UI + custom logic)

**Rationale**:
- Autocomplete from user's existing tags (good UX)
- Allows free-form text entry (flexibility)
- Accessible (Headless UI provides ARIA attributes)
- Tailwind-styled chips for selected tags
- No heavy dependencies (Headless UI already in project)

**Implementation**:
```tsx
// TagInput.tsx
- Combobox from Headless UI
- Fetch user's existing tags via GET /api/{user_id}/tags
- Filter tags as user types
- Allow creating new tags (not in list)
- Display selected tags as removable chips
- Validate: trim whitespace, lowercase for comparison, prevent duplicates
```

**Alternatives Considered**:
- react-select - Rejected: Heavy dependency, overkill
- Plain input with comma separation - Rejected: Poor UX, no autocomplete
- react-tag-input - Rejected: Unmaintained library

---

## Research Topic 8: Filter State Management

### Decision: URL query parameters with Next.js useSearchParams

**Rationale**:
- Shareable URLs (users can bookmark filtered views)
- Browser back/forward works correctly
- No additional state management library needed
- Next.js 16 App Router provides useSearchParams hook
- Persists across page refreshes

**Implementation**:
```tsx
// app/tasks/page.tsx
const searchParams = useSearchParams();
const priority = searchParams.get('priority');
const tags = searchParams.get('tags')?.split(',');
const dueDateStart = searchParams.get('due_date_start');

// Update URL when filters change
const updateFilters = (newFilters) => {
  const params = new URLSearchParams();
  if (newFilters.priority) params.set('priority', newFilters.priority);
  if (newFilters.tags) params.set('tags', newFilters.tags.join(','));
  router.push(`/tasks?${params.toString()}`);
};
```

**Alternatives Considered**:
- React Context - Rejected: Doesn't persist across refreshes, not shareable
- Local state (useState) - Rejected: Lost on page refresh
- Zustand/Redux - Rejected: Overkill for simple filters

---

## Additional Decisions

### Priority Enum Values
**Decision**: `high`, `medium`, `low` (lowercase strings)
- Rationale: Simple, intuitive, matches common task management apps
- Default: `medium` (neutral priority)
- Database: String enum (not integer) for readability

### Tag Storage Format
**Decision**: JSONB array of strings, case-insensitive comparison
- Rationale: Flexible, queryable, no separate table needed
- Validation: Trim whitespace, prevent empty strings, max 50 chars per tag
- Display: Lowercase for consistency

### Due Date Timezone Handling
**Decision**: Store as UTC in database, display in user's local timezone
- Rationale: Standard practice, avoids timezone bugs
- Backend: Store as datetime (UTC)
- Frontend: Convert to local timezone for display, send as ISO 8601 with timezone

### Filter Combination Logic
**Decision**: AND logic for multiple filters
- Rationale: More intuitive (narrow down results)
- Example: priority=high AND tags=work,urgent → tasks with high priority AND both tags
- Alternative OR logic can be added later if needed

### Recurring Task Generation Trigger
**Decision**: Generate next instance immediately on completion (not scheduled)
- Rationale: Simpler implementation, no background jobs needed for Phase 5 Part A
- User completes task → Backend checks is_recurring → Creates next instance
- Scheduled generation deferred to Phase 5 Part B (with Dapr Jobs API)

---

## Summary of Decisions

| Topic | Decision | Key Benefit |
|-------|----------|-------------|
| JSON Storage | JSONB with indexes | Performance + flexibility |
| Search | PostgreSQL tsvector + GIN | Native, fast, no dependencies |
| Recurrence | Custom JSON schema | Flexible, extensible |
| Date Parsing | OpenAI agent built-in | No extra libraries |
| Migration | Alembic with nullable fields | Backward compatible |
| Date Picker | Native datetime-local | Zero dependencies |
| Tag Input | Headless UI Combobox | Accessible, autocomplete |
| Filter State | URL query parameters | Shareable, persistent |

---

## Implementation Readiness

All technical decisions resolved. Ready to proceed to Phase 1 (Data Model & Contracts).

**No blockers identified.**
