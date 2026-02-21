# Implementation Plan: Advanced Task Features

**Branch**: `005-advanced-task-features` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-advanced-task-features/spec.md`

## Summary

Extend the existing Phase 4 Todo application with advanced task management features including priorities (high/medium/low), tags (flexible categorization), due dates (deadline tracking), recurring tasks (daily/weekly/monthly patterns), and search/filter capabilities. All features accessible via both traditional UI and natural language chat interface. No infrastructure changes - works on existing local deployment.

**Technical Approach**: Extend Task model with 5 new fields, add database migration, enhance REST API endpoints with query parameters, update MCP tools for natural language support, build new React components for UI, maintain backward compatibility.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5+ (frontend)
**Primary Dependencies**:
- Backend: FastAPI 0.115+, SQLModel, Alembic, OpenAI Agents SDK, Official MCP SDK, python-jose, argon2-cffi
- Frontend: Next.js 16+, React 19+, Tailwind CSS v3.4+, OpenAI ChatKit, React Hook Form, Zod, Lucide React

**Storage**: Neon Serverless PostgreSQL (existing database, add new fields and tables)
**Testing**: pytest + pytest-asyncio + httpx (backend), Jest (frontend components), Playwright (E2E)
**Target Platform**:
- Local development: Direct execution (uvicorn, npm run dev)
- Deployment: Existing Phase 4 Kubernetes (Minikube local, OKE production)

**Project Type**: Web application (separate frontend and backend)
**Performance Goals**:
- Filter operations: <500ms response time
- Search across 100+ tasks: <1 second
- Recurring task generation: <1 second after completion
- Natural language parsing: 95% accuracy

**Constraints**:
- NO infrastructure changes (no new microservices, no Kafka, no Dapr)
- Work within existing Phase 4 architecture
- Maintain backward compatibility (existing tasks continue to work)
- All new fields nullable with defaults (safe migration)
- Natural language support via existing OpenAI agent

**Scale/Scope**:
- Support 50+ unique tags per user
- Handle 1000+ tasks per user
- Support concurrent users (existing JWT auth)
- Database migration for existing production data

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Security First ✅
- User isolation maintained: All new queries filter by user_id
- JWT authentication enforced on new endpoints (search, tags)
- MCP tools validate user_id for new parameters
- Tags and search results isolated by user
- No sensitive data in new fields (tags are user-defined text)

### Stateless Design ✅
- No in-memory state for filters or search
- Agent remains stateless (new parameters passed via context)
- Recurring task logic doesn't require server state
- All data persists in database

### Type Safety ✅
- Priority enum strictly typed (high/medium/low)
- Tags typed as array of strings
- Due date typed as timestamp
- Recurrence pattern typed as JSON with schema validation
- All new TypeScript components strictly typed

### API-First Architecture ✅
- New endpoints follow REST conventions
- Query parameters for filters (GET /api/{user_id}/tasks?priority=high&tags=work)
- Search endpoint follows REST pattern (GET /api/{user_id}/tasks/search?q=keyword)
- Tags endpoint follows REST pattern (GET /api/{user_id}/tags)
- All endpoints include user_id in path

### Database Integrity ✅
- New fields added with proper defaults (priority: medium, tags: [], is_recurring: false)
- Foreign keys maintained (user_id on all tables)
- Timestamps on new tables (notifications, recurring_patterns)
- Migration backward-compatible (nullable fields)
- No cascading deletes (explicit handling)

### AI Agent Architecture ✅
- Agent system prompt updated with new tool parameters
- Natural language parsing for priority, tags, due dates
- Tool execution remains atomic
- Agent responses remain conversational
- No hallucination of new features

### Conversational Interface First ✅
- All advanced features accessible via chat
- Natural language examples: "add high priority task buy milk due tomorrow tagged work"
- Agent confirms actions with new details ("I've added 'Buy milk' (high priority, due tomorrow) to your tasks")
- Error messages remain conversational

### Infrastructure as Code ✅
- Database migration via Alembic (version controlled)
- No Kubernetes changes required (same deployment)
- Helm charts unchanged (application-level changes only)
- Docker images rebuilt with new code (no Dockerfile changes)

### Violations: NONE
All constitutional principles satisfied. No complexity violations.

## Project Structure

### Documentation (this feature)

```text
specs/005-advanced-task-features/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (next)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
│   ├── task-api.yaml    # Enhanced task endpoints
│   ├── search-api.yaml  # Search endpoint
│   └── tags-api.yaml    # Tags endpoint
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── task.py                    # MODIFY: Add 5 new fields
│   │   ├── notification.py            # NEW: Notification model
│   │   └── recurring_pattern.py       # NEW: Recurring pattern model
│   ├── schemas/
│   │   ├── task.py                    # MODIFY: Add new fields to schemas
│   │   ├── notification.py            # NEW: Notification schemas
│   │   └── recurring_pattern.py       # NEW: Recurring pattern schemas
│   ├── routers/
│   │   └── tasks.py                   # MODIFY: Add filters, search, tags endpoints
│   ├── services/
│   │   ├── task_service.py            # MODIFY: Add filter/search/tag logic
│   │   ├── notification_service.py    # NEW: Notification management
│   │   └── recurring_service.py       # NEW: Recurring task logic
│   ├── mcp/
│   │   └── tools.py                   # MODIFY: Update add_task, list_tasks with new params
│   └── utils/
│       ├── agent.py                   # MODIFY: Update system prompt
│       └── recurrence.py              # NEW: Recurrence pattern utilities
├── alembic/versions/
│   └── 2026_02_15_add_advanced_fields.py  # NEW: Migration script
└── tests/
    ├── test_task_filters.py           # NEW: Filter tests
    ├── test_search.py                 # NEW: Search tests
    ├── test_recurring.py              # NEW: Recurring task tests
    └── test_mcp_advanced.py           # NEW: MCP tool tests with new params

frontend/
├── app/
│   ├── chat/page.tsx                  # MODIFY: Support new features in chat
│   └── tasks/page.tsx                 # MODIFY: Add filters, search UI
├── components/
│   ├── tasks/
│   │   ├── PriorityBadge.tsx          # NEW: Color-coded priority badges
│   │   ├── TagCloud.tsx               # NEW: Clickable tag cloud
│   │   ├── DueDatePicker.tsx          # NEW: Date/time picker
│   │   ├── RecurrenceSelector.tsx     # NEW: Recurrence pattern selector
│   │   ├── TaskFilters.tsx            # NEW: Filter panel
│   │   ├── TaskItem.tsx               # MODIFY: Display new fields
│   │   └── TaskForm.tsx               # MODIFY: Add new field inputs
│   └── chat/
│       └── ChatInterface.tsx          # MODIFY: Handle new tool responses
├── lib/
│   ├── api.ts                         # MODIFY: Add filter/search/tags functions
│   ├── chat-api.ts                    # No changes (agent handles new params)
│   └── types.ts                       # MODIFY: Add new Task fields
└── tests/
    ├── components/
    │   ├── PriorityBadge.test.tsx     # NEW: Component tests
    │   ├── TagCloud.test.tsx          # NEW: Component tests
    │   └── TaskFilters.test.tsx       # NEW: Component tests
    └── e2e/
        └── advanced-features.spec.ts  # NEW: E2E tests for all features
```

**Structure Decision**: Web application structure (Option 2) with separate backend/ and frontend/ directories. This matches the existing Phase 4 architecture. All changes are modifications to existing files or new files within the established structure. No infrastructure changes required.

## Complexity Tracking

> **No violations - this section intentionally left empty**

All constitutional requirements satisfied without exceptions. Feature adds complexity to data model (5 new fields) but maintains architectural simplicity (no new services, no new infrastructure).

---

## Phase 0: Research & Technical Decisions

**Status**: Ready to generate research.md

**Research Topics**:
1. PostgreSQL JSON field best practices for tags and recurrence_pattern
2. Full-text search implementation in PostgreSQL (tsvector vs simple LIKE)
3. Recurring task pattern representation (cron vs custom JSON schema)
4. Natural language date parsing strategies (OpenAI agent capabilities)
5. Database migration strategy for adding fields to existing table with data
6. Frontend date picker library selection (native vs third-party)
7. Tag input component patterns (autocomplete, multi-select)
8. Filter state management (URL params vs local state)

**Decisions to Document**:
- Priority enum values and defaults
- Tag storage format (JSON array vs separate table)
- Recurrence pattern JSON schema structure
- Search implementation approach (PostgreSQL full-text vs external)
- Due date timezone handling
- Filter combination logic (AND vs OR for multiple tags)
- Recurring task generation trigger (on completion vs scheduled job)

---

## Phase 1: Data Model & Contracts

**Status**: Ready to generate after Phase 0

**Data Model Artifacts**:
- Extended Task model with 5 new fields
- Notification model (for future reminder tracking)
- RecurringPattern model (for recurring task definitions)
- Field validation rules
- Migration script structure

**API Contract Artifacts**:
- Enhanced POST /api/{user_id}/tasks (accept new fields)
- Enhanced GET /api/{user_id}/tasks (add query parameters)
- New GET /api/{user_id}/tasks/search (full-text search)
- New GET /api/{user_id}/tags (list unique tags)
- Updated MCP tool schemas (add_task, list_tasks)

**Quickstart Artifact**:
- Setup instructions for new dependencies (if any)
- Migration execution steps
- Testing new features locally
- Natural language examples for chat interface

---

## Phase 2: Task Breakdown

**Status**: Not started (requires /sp.tasks command)

Will generate detailed implementation tasks after Phase 0 and Phase 1 complete.

---

## Implementation Strategy

### Migration Strategy
1. Create Alembic migration with new fields (all nullable with defaults)
2. Test migration on copy of production database
3. Run migration in development environment
4. Verify existing tasks unaffected
5. Deploy migration to production (backward compatible)

### Backend Implementation Order
1. Database models and migration (foundation)
2. Service layer enhancements (business logic)
3. API endpoint modifications (interface)
4. MCP tool updates (natural language support)
5. Agent system prompt updates (intent recognition)
6. Comprehensive testing (unit, integration, E2E)

### Frontend Implementation Order
1. TypeScript types and API client functions (foundation)
2. Basic UI components (PriorityBadge, TagCloud, DueDatePicker)
3. Filter panel component (TaskFilters)
4. Recurrence selector component (RecurrenceSelector)
5. Update existing components (TaskItem, TaskForm)
6. Chat interface enhancements (display new fields)
7. Component and E2E testing

### Testing Strategy
- Unit tests for each new service function
- API tests for new endpoints and query parameters
- MCP tool tests with new parameters
- Component tests for all new React components
- E2E tests for complete user flows (create with priority, filter, search)
- Natural language tests for chat interface
- Migration tests (up and down)

### Deployment Strategy
- No infrastructure changes required
- Rebuild Docker images with new code
- Deploy via existing Helm charts
- Run database migration as pre-deployment step
- Verify health checks pass
- Test in Minikube before OKE deployment

---

## Risk Mitigation

### Risk 1: Database Migration Complexity
**Mitigation**:
- All new fields nullable with defaults
- Test migration on database copy first
- Backward compatible (old code works with new schema)
- Rollback plan documented

### Risk 2: Natural Language Parsing Accuracy
**Mitigation**:
- Extensive testing with varied phrasings
- Provide examples in chat interface
- Agent asks for clarification on ambiguous input
- Fallback to form-based input if chat fails

### Risk 3: Performance with Large Tag Sets
**Mitigation**:
- Database indexes on new fields
- Pagination for tag cloud if needed
- Query optimization for filter combinations
- Performance testing with 1000+ tasks

### Risk 4: Recurring Task Logic Complexity
**Mitigation**:
- Start with simple patterns (daily, weekly, monthly)
- Comprehensive test coverage for edge cases
- Clear documentation of recurrence behavior
- Defer complex patterns to future iteration

### Risk 5: Filter Combination Complexity
**Mitigation**:
- Clear AND logic for multiple filters
- Database query optimization
- Test with all filter combinations
- Performance monitoring

---

## Success Metrics

- All 23 functional requirements implemented and tested
- All 8 success criteria met (see spec.md)
- Zero regression in existing functionality
- Database migration completes successfully
- Natural language parsing achieves 95% accuracy
- Filter operations complete in <500ms
- Search operations complete in <1 second
- All E2E tests pass

---

## Next Steps

1. Generate research.md (Phase 0) - Resolve technical decisions
2. Generate data-model.md (Phase 1) - Define database schema changes
3. Generate API contracts (Phase 1) - Document endpoint changes
4. Generate quickstart.md (Phase 1) - Setup and testing guide
5. Run /sp.tasks to generate detailed task breakdown
6. Begin implementation following task order
