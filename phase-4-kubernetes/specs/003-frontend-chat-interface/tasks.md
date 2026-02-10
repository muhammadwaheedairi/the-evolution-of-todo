# Tasks: Frontend Conversational Interface

**Input**: Design documents from `/specs/002-frontend-chat-interface/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/chat-api.yaml

**Tests**: Tests are not explicitly requested in the specification, so test tasks are not included. Focus is on implementation and manual testing per quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/` directory at repository root
- All paths relative to frontend directory
- Components: `components/chat/`
- Pages: `app/chat/`
- API client: `lib/`
- Types: `lib/types.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure environment for chat feature

- [x] T001 Install @openai/chatkit package in frontend directory using npm install
- [x] T002 Add NEXT_PUBLIC_OPENAI_DOMAIN_KEY to frontend/.env.local (optional for localhost, document for production)
- [x] T003 [P] Update frontend/package.json with @openai/chatkit dependency and verify installation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and API client that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Define chat TypeScript interfaces in frontend/lib/types.ts (Message, Conversation, ChatRequest, ChatResponse, ChatState)
- [x] T005 [P] Create chat API client in frontend/lib/chat-api.ts with sendChatMessage and getConversationHistory functions
- [x] T006 [P] Add JWT authentication helpers to chat API client (reuse existing getToken, clearAuthTokens from lib/api.ts)
- [x] T007 Verify chat API client handles 401 errors with token clearing and redirect to /login

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 + 4 - Basic Chat with Authentication (Priority: P1) 🎯 MVP

**Goal**: Users can send messages via chat interface and receive AI responses. Authentication is enforced - unauthenticated users are redirected to login.

**Independent Test**: Navigate to /chat without authentication → redirected to /login. Login → navigate to /chat → send "add task buy groceries" → verify message appears and assistant responds → verify task created in /tasks page.

**Why Combined**: Authentication (US4) is a prerequisite for chat functionality (US1). Both are P1 priority and must work together for MVP.

### Implementation for User Story 1 + 4

- [x] T008 [P] [US1] Create ChatInput component in frontend/components/chat/ChatInput.tsx with textarea, send button, and Enter key handling
- [x] T009 [P] [US1] Create MessageList component in frontend/components/chat/MessageList.tsx with message display and auto-scroll
- [x] T010 [US1] Create ChatInterface component in frontend/components/chat/ChatInterface.tsx integrating ChatKit with state management
- [x] T011 [US1] Implement message sending logic in ChatInterface with loading states and error handling
- [x] T012 [US4] Create chat page in frontend/app/chat/page.tsx with Server Component authentication check
- [x] T013 [US4] Add authentication redirect logic to chat page (redirect to /login if not authenticated)
- [x] T014 [US1] Add input validation to ChatInput (prevent empty messages, enforce 1000 character limit)
- [x] T015 [US1] Update frontend/components/Header.tsx to add navigation link to /chat route

**Checkpoint**: At this point, authenticated users can access chat, send messages, and receive responses. This is the MVP.

---

## Phase 4: User Story 2 - Conversation History Persistence (Priority: P2)

**Goal**: Users see their conversation history when they return to the chat page. History persists across page refreshes.

**Independent Test**: Send 3 messages in chat → refresh page → verify all 3 messages still visible in correct chronological order with timestamps.

### Implementation for User Story 2

- [x] T016 [US2] Add conversation history loading to ChatInterface useEffect hook on component mount
- [x] T017 [US2] Implement getConversationHistory API call in ChatInterface with error handling
- [x] T018 [US2] Add timestamp display to MessageList component for all messages
- [x] T019 [US2] Handle empty conversation state in MessageList with example commands placeholder

**Checkpoint**: At this point, conversation history persists and loads correctly on page refresh.

---

## Phase 5: User Story 5 - Responsive Mobile Experience (Priority: P2)

**Goal**: Chat interface works seamlessly on mobile devices with touch-friendly controls and responsive layout.

**Independent Test**: Open chat page on mobile device (or browser dev tools mobile emulation) → verify no horizontal scrolling → send message → verify input accessible and send button tappable → scroll through messages smoothly.

### Implementation for User Story 5

- [x] T020 [P] [US5] Add responsive Tailwind classes to ChatInterface for mobile layout (max-width, padding adjustments)
- [x] T021 [P] [US5] Add responsive Tailwind classes to MessageList for mobile message display (max-width 80%, touch-friendly spacing)
- [x] T022 [US5] Add responsive Tailwind classes to ChatInput for mobile input field (fixed bottom positioning, proper keyboard handling)

**Checkpoint**: At this point, chat interface is fully functional on mobile devices.

---

## Phase 6: User Story 3 - Visual Tool Execution Feedback (Priority: P3)

**Goal**: Users see which backend tools were executed by the AI agent, providing transparency into actions taken.

**Independent Test**: Send "add task buy milk" → verify assistant response includes tool badge showing "🛠️ add_task" below the message.

### Implementation for User Story 3

- [x] T023 [P] [US3] Create ToolCallIndicator component in frontend/components/chat/ToolCallIndicator.tsx with badge rendering
- [x] T024 [US3] Integrate ToolCallIndicator into MessageList component for assistant messages
- [x] T025 [US3] Add conditional rendering logic to only show ToolCallIndicator when toolCalls array is not empty

**Checkpoint**: All user stories are now complete and independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, documentation, and validation

- [x] T026 [P] Add loading spinner to ChatInterface while waiting for assistant response
- [x] T027 [P] Add error message display to ChatInterface for API failures with user-friendly messages
- [x] T028 [P] Verify all Tailwind CSS classes follow design system (user messages: blue, assistant: gray, proper spacing)
- [ ] T029 Run manual testing scenarios from frontend/specs/002-frontend-chat-interface/quickstart.md
- [x] T030 Update frontend/CLAUDE.md with chat feature documentation if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1+US4 (Phase 3): Can start after Foundational - No dependencies on other stories
  - US2 (Phase 4): Can start after Foundational - Integrates with US1 but independently testable
  - US5 (Phase 5): Can start after Foundational - Enhances US1 but independently testable
  - US3 (Phase 6): Can start after Foundational - Enhances US1 but independently testable
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1+4 (P1)**: MVP - Must complete first. No dependencies on other stories.
- **User Story 2 (P2)**: Depends on US1 components existing, but adds independent history feature
- **User Story 5 (P2)**: Depends on US1 components existing, but adds independent mobile support
- **User Story 3 (P3)**: Depends on US1 components existing, but adds independent tool badges

### Within Each User Story

- Components can be built in parallel if marked [P]
- ChatInterface depends on ChatInput and MessageList being complete
- Chat page depends on ChatInterface being complete
- Integration tasks depend on component tasks

### Parallel Opportunities

- All Setup tasks (T001-T003) can run in parallel
- All Foundational tasks (T004-T007) can run in parallel
- Within US1+US4: T008, T009 can run in parallel (different components)
- Within US2: T016-T019 can run sequentially (same component modifications)
- Within US5: T020-T022 can run in parallel (different components)
- Within US3: T023-T025 can run sequentially (component creation then integration)
- All Polish tasks (T026-T028) can run in parallel

---

## Parallel Example: User Story 1+4

```bash
# Launch component creation in parallel:
Task T008: "Create ChatInput component in frontend/components/chat/ChatInput.tsx"
Task T009: "Create MessageList component in frontend/components/chat/MessageList.tsx"

# Then integrate:
Task T010: "Create ChatInterface component integrating ChatKit"
Task T011: "Implement message sending logic"

# Then add page and auth:
Task T012: "Create chat page with authentication check"
Task T013: "Add authentication redirect logic"
```

---

## Implementation Strategy

### MVP First (User Story 1+4 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007) - CRITICAL
3. Complete Phase 3: User Story 1+4 (T008-T015)
4. **STOP and VALIDATE**: Test chat functionality independently
5. Deploy/demo MVP

**MVP Scope**: Authenticated users can access /chat, send messages, receive AI responses, and manage tasks via natural language.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1+4 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (history persistence)
4. Add User Story 5 → Test independently → Deploy/Demo (mobile support)
5. Add User Story 3 → Test independently → Deploy/Demo (tool transparency)
6. Add Polish → Final validation → Production deployment

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T007)
2. Once Foundational is done:
   - Developer A: User Story 1+4 (T008-T015) - MVP
   - Developer B: User Story 2 (T016-T019) - Can start in parallel
   - Developer C: User Story 5 (T020-T022) - Can start in parallel
3. After US1+4 complete:
   - Developer D: User Story 3 (T023-T025) - Depends on US1 components
4. All developers: Polish tasks (T026-T030) in parallel

---

## Task Summary

**Total Tasks**: 30

**Tasks by Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 4 tasks
- Phase 3 (US1+US4 - MVP): 8 tasks
- Phase 4 (US2): 4 tasks
- Phase 5 (US5): 3 tasks
- Phase 6 (US3): 3 tasks
- Phase 7 (Polish): 5 tasks

**Tasks by User Story**:
- US1 (Basic Chat): 7 tasks (T008-T011, T014-T015, plus shared T010)
- US4 (Authentication): 3 tasks (T012-T013, plus shared T010)
- US2 (History): 4 tasks (T016-T019)
- US5 (Mobile): 3 tasks (T020-T022)
- US3 (Tool Badges): 3 tasks (T023-T025)
- Setup/Foundation: 7 tasks (T001-T007)
- Polish: 5 tasks (T026-T030)

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel within their phase

**MVP Scope**: Tasks T001-T015 (15 tasks) deliver the minimum viable product

**Independent Test Criteria**:
- US1+US4: Send message → receive response → verify task created
- US2: Refresh page → verify history persists
- US5: Test on mobile → verify responsive layout
- US3: Send message → verify tool badge appears

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US1 and US4 combined because authentication is prerequisite for chat
- No test tasks included (not explicitly requested in spec)
- Manual testing via quickstart.md scenarios (Task T029)
- All tasks follow strict checklist format with IDs, labels, and file paths
