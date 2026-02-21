# Tasks: Advanced Task Features

**Input**: Design documents from `/specs/005-advanced-task-features/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are included as requested in the feature specification (API tests, component tests, E2E tests)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/app/`, `frontend/components/`, `frontend/lib/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verification

- [x] T001 Verify existing Phase 4 application is functional (Docker, Kubernetes, Helm, database, MCP tools, ChatKit, JWT auth)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database and infrastructure changes that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create and run Alembic migration in backend/alembic/versions/2026_02_15_add_advanced_fields.py (add 5 new columns: due_date, priority, tags, recurrence_pattern, is_recurring; add search_vector column; create 5 indexes; create notifications and recurring_patterns tables; test rollback)
- [x] T003 [P] Update Task model in backend/src/models/task.py with 5 new fields and search_vector column
- [x] T004 [P] Create Notification and RecurringPattern models in backend/src/models/notification.py and backend/src/models/recurring_pattern.py
- [x] T005 Update TaskCreate, TaskUpdate, TaskResponse schemas in backend/src/schemas/task.py with new fields (due_date, priority, tags, recurrence_pattern)
- [x] T006 [P] Update Task type in frontend/lib/types.ts with new fields (dueDate, priority, tags, recurrencePattern, isRecurring)

---

## Phase 3: User Story 1 - Prioritize Tasks by Urgency (P1)

**Goal**: Users can assign priority levels (high, medium, low) to tasks

**Independent Test**: Create high priority task via chat, verify badge displays, filter by priority

- [x] T007 [P] [US1] Write API tests in backend/tests/test_priority.py (create task with priority, filter by priority, update priority, validate enum values)
- [x] T008 [US1] Implement priority filtering in backend/src/services/task_service.py (add priority parameter to get_tasks, filter query by priority)
- [x] T009 [US1] Update MCP add_task and list_tasks tools in backend/src/mcp/tools.py with priority parameter
- [x] T010 [P] [US1] Create PriorityBadge component in frontend/components/tasks/PriorityBadge.tsx (color-coded badges: red=high, yellow=medium, gray=low)
- [x] T011 [US1] Add priority selector to TaskForm and priority filter to TaskFilters in frontend/components/tasks/
- [x] T012 [US1] Update chat interface to handle priority in natural language ("add high priority task buy milk")

---

## Phase 4: User Story 2 - Organize Tasks with Tags (P2)

**Goal**: Users can add multiple tags to tasks for organization

**Independent Test**: Create task with tags via chat, click tag to filter, verify tag cloud displays

- [x] T013 [P] [US2] Write API tests in backend/tests/test_tags.py (create task with tags, filter by tags, get user tags with counts, validate JSONB array)
- [x] T014 [US2] Implement tag filtering and GET /api/{user_id}/tags endpoint in backend/src/routers/tasks.py and backend/src/services/task_service.py (filter by tags array, aggregate unique tags with counts)
- [x] T015 [US2] Update MCP add_task and list_tasks tools in backend/src/mcp/tools.py with tags parameter (array of strings)
- [x] T016 [P] [US2] Create TagCloud component in frontend/components/tasks/TagCloud.tsx (clickable tags, display counts, filter on click)
- [x] T017 [US2] Add tag input to TaskForm (Headless UI Combobox with autocomplete) and tag filter to TaskFilters in frontend/components/tasks/
- [x] T018 [US2] Update chat interface to handle tags in natural language ("add task meeting tagged work urgent")

---

## Phase 5: User Story 3 - Set Due Dates and Reminders (P3)

**Goal**: Users can set due dates on tasks and receive reminders

**Independent Test**: Create task with due date via chat, verify date displays, filter by due date range

- [x] T019 [P] [US3] Write API tests in backend/tests/test_due_dates.py (create task with due_date, filter by due_date_range, validate ISO8601 format, test overdue logic)
- [x] T020 [US3] Implement due date filtering in backend/src/services/task_service.py (add due_date_start and due_date_end parameters, filter by date range, sort by due_date)
- [x] T021 [US3] Update MCP add_task and list_tasks tools in backend/src/mcp/tools.py with due_date parameter (ISO8601 string)
- [x] T022 [US3] Update agent system prompt in backend/src/utils/agent.py to parse natural language dates ("tomorrow", "next week", "Feb 20")
- [x] T023 [P] [US3] Create DueDatePicker component in frontend/components/tasks/DueDatePicker.tsx (native HTML5 datetime-local input)
- [x] T024 [US3] Add due date picker to TaskForm and due date filter to TaskFilters in frontend/components/tasks/
- [x] T025 [US3] Update chat interface to handle due dates in natural language ("add task report due tomorrow")

---

## Phase 6: User Story 4 - Create Recurring Tasks (P4)

**Goal**: Users can create tasks that repeat on a schedule (daily, weekly, monthly)

**Independent Test**: Create recurring task via chat, verify pattern stored, complete task and verify next instance created

- [x] T026 [P] [US4] Write API tests in backend/tests/test_recurring.py (create recurring task, validate recurrence_pattern JSON schema, test pattern types: daily, weekly, monthly)
- [x] T027 [US4] Implement recurring task logic in backend/src/services/task_service.py (validate recurrence_pattern, set is_recurring flag, store pattern in JSONB)
- [x] T028 [US4] Update MCP add_task tool in backend/src/mcp/tools.py with recurrence_pattern parameter (JSON object with type and interval)
- [x] T029 [US4] Update agent system prompt in backend/src/utils/agent.py to parse recurrence patterns ("every day", "every weekday", "every Monday")
- [x] T030 [P] [US4] Create RecurrenceSelector component in frontend/components/tasks/RecurrenceSelector.tsx (dropdown with daily/weekly/monthly options)
- [x] T031 [US4] Add recurrence selector to TaskForm in frontend/components/tasks/TaskForm.tsx
- [x] T032 [US4] Update chat interface to handle recurring tasks in natural language ("create recurring task standup every weekday")

---

## Phase 7: User Story 5 - Search and Filter Tasks (P5)

**Goal**: Users can search tasks by keywords and apply multiple filters

**Independent Test**: Search for "meeting" via chat, verify results ranked by relevance, combine with priority filter

- [x] T033 [P] [US5] Write API tests in backend/tests/test_search.py (full-text search, test relevance scoring, combine search with filters, validate tsvector query)
- [x] T034 [US5] Implement GET /api/{user_id}/tasks/search endpoint in backend/src/routers/tasks.py and backend/src/services/task_service.py (use PostgreSQL tsvector, rank by ts_rank, support combined filters)
- [x] T035 [US5] Create search_tasks MCP tool in backend/src/mcp/tools.py (query parameter, returns results with relevance scores)
- [x] T036 [US5] Update agent system prompt in backend/src/utils/agent.py to handle search queries ("search for tasks about meeting")
- [x] T037 [P] [US5] Create enhanced TaskFilters component in frontend/components/tasks/TaskFilters.tsx (search input, priority dropdown, tag multi-select, due date range, sort options)
- [x] T038 [US5] Update tasks page in frontend/app/tasks/page.tsx to use URL query parameters for filter state (shareable URLs)
- [x] T039 [US5] Update chat interface to handle search queries in natural language ("find tasks about project")

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, deployment updates, and final integration

- [x] T040 Update API documentation in backend/src/main.py (OpenAPI tags, descriptions for new endpoints)
- [x] T041 Update Helm charts in helm/templates/ with new environment variables if needed (no infrastructure changes)
- [x] T042 Update README.md with Phase 5 features, natural language examples, and deployment instructions

---

## Summary

**Total Tasks**: 42 (consolidated from 130)
**Parallelizable**: 12 tasks marked [P]
**MVP Scope**: 12 tasks (T001-T012: Setup + Foundational + US1)

## Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS ALL USER STORIES
    ↓
Phase 3 (US1: Priority) ─┐
Phase 4 (US2: Tags) ─────┼─→ All independent, can run in parallel
Phase 5 (US3: Due Dates) ┤
Phase 6 (US4: Recurring) ┤
Phase 7 (US5: Search) ───┘
    ↓
Phase 8 (Polish)
```

## Parallel Execution Examples

**After Foundational Phase Complete:**
- Backend: T007, T013, T019, T026, T033 (all API tests in parallel)
- Frontend: T010, T016, T023, T030, T037 (all components in parallel)

**Within Each User Story:**
- Tests (T007, T013, T019, T026, T033) can run before implementation
- Components (T010, T016, T023, T030) can be built in parallel with backend services

## Implementation Strategy

1. **MVP First**: Complete T001-T012 (Setup + Foundational + US1) for first deployable increment
2. **Incremental Delivery**: Each user story (US2-US5) is independently testable and deployable
3. **TDD Approach**: Tests written first for each user story (T007, T013, T019, T026, T033)
4. **Parallel Work**: Backend and frontend teams can work simultaneously on different user stories

## Natural Language Test Scenarios

**Priority (US1):**
- "add high priority task buy milk" → Task created with priority=high
- "show me high priority tasks" → Filtered list returned

**Tags (US2):**
- "add task meeting tagged work urgent" → Task created with tags=["work", "urgent"]
- "show tasks tagged work" → Filtered by tag

**Due Dates (US3):**
- "add task report due tomorrow" → Task created with due_date set
- "show overdue tasks" → Filtered by past due_date

**Recurring (US4):**
- "create recurring task standup every weekday" → Recurring pattern stored
- Complete task → Next instance auto-created

**Search (US5):**
- "search for tasks about meeting" → Full-text search results
- "find high priority tasks tagged work" → Combined filters

---

**Status**: Ready for implementation
**Branch**: `005-advanced-task-features`
**Next Step**: Begin with T001 (verify existing application)
