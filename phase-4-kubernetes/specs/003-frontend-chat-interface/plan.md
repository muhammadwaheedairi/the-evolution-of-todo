# Implementation Plan: Frontend Conversational Interface

**Branch**: `002-frontend-chat-interface` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-frontend-chat-interface/spec.md`

## Summary

Implement a conversational chat interface using OpenAI ChatKit that allows users to manage tasks through natural language. The frontend will integrate with the existing backend chat endpoint (POST /api/{user_id}/chat), maintain the same JWT authentication patterns as Phase 2, and provide a responsive, mobile-friendly UI. The implementation focuses on four main components: ChatInterface (main wrapper), MessageList (history display), ChatInput (message entry), and ToolCallIndicator (transparency badges). All conversation history persists in the backend database, and the frontend retrieves it on page load to maintain context across sessions.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode enabled)
**Primary Dependencies**:
- Next.js 16.1.6 (App Router)
- React 19+
- @openai/chatkit (ChatKit UI library)
- Tailwind CSS v3.4.19
- React Hook Form + Zod (for non-chat forms)
- Lucide React (icons)

**Storage**: Backend PostgreSQL (conversation history) - Frontend uses localStorage for JWT tokens only
**Testing**: Jest + React Testing Library (component tests), Playwright (E2E tests)
**Target Platform**: Web browsers (Chrome, Firefox, Safari) - Desktop and Mobile (375px+ width)
**Project Type**: Web application (frontend only for this feature)
**Performance Goals**:
- Chat interface loads within 2 seconds
- Message send/receive within 5 seconds
- Smooth scrolling with 50+ messages
- No layout shift on message append

**Constraints**:
- Must use Next.js 16 App Router (NOT Pages Router)
- Client Components only for interactive elements (ChatKit, forms)
- Server Components as default
- No inline styles (Tailwind only)
- Custom JWT authentication (no third-party auth libraries)
- OpenAI domain key required for production (optional for localhost)

**Scale/Scope**:
- Single chat page (/chat route)
- 4 main components (ChatInterface, MessageList, ChatInput, ToolCallIndicator)
- 1 API client module (chat-api.ts)
- Support for unlimited conversation history length
- Mobile-first responsive design

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Security First
- JWT authentication enforced on chat page (redirect to /login if unauthenticated)
- All chat API requests include Authorization header with JWT token
- User can only access their own conversations (user_id in API path)
- Chat input sanitized to prevent XSS attacks
- 401 responses trigger token clearing and redirect to login

### ✅ Stateless Design
- No conversation state stored in frontend memory beyond current session
- Conversation history fetched from backend on page load
- Each message send is independent request with full authentication
- Frontend horizontally scalable (no shared state between instances)

### ✅ Type Safety
- TypeScript strict mode enabled
- All components properly typed (no 'any' types)
- API response types defined in lib/types.ts
- ChatKit props properly typed
- Message and Conversation interfaces defined

### ✅ API-First Architecture
- Frontend communicates with backend via REST API only
- Chat endpoint: POST /api/{user_id}/chat
- Same authentication pattern as existing task API
- Request/response validation on both sides
- Natural language inputs validated before sending

### ✅ Frontend Framework
- Next.js 16+ App Router (NOT Pages Router)
- Server Components as default
- Client Components only for ChatKit and interactive elements
- Proper 'use client' directive usage

### ✅ Chat UI Library
- OpenAI ChatKit for conversational interface
- Domain allowlist configuration documented
- Tailwind CSS for custom styling
- Properly typed ChatKit integration

### ✅ Styling
- Tailwind CSS only (no inline styles, no CSS modules)
- Consistent with existing Phase 2 frontend
- Responsive design (mobile-first)
- User messages: right-aligned, blue background
- Assistant messages: left-aligned, gray background

### ✅ TypeScript
- Strict mode enabled
- All components typed
- ChatKit integration properly typed
- API client functions typed

**Constitution Compliance**: ✅ PASS - All constitutional requirements met. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/002-frontend-chat-interface/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (technical research)
├── data-model.md        # Phase 1 output (frontend data structures)
├── quickstart.md        # Phase 1 output (setup instructions)
├── contracts/           # Phase 1 output (API contracts)
│   └── chat-api.yaml    # OpenAPI spec for chat endpoint
├── checklists/          # Quality validation
│   └── requirements.md  # Spec quality checklist (complete)
└── tasks.md             # Phase 2 output (NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/
├── app/
│   ├── chat/                    # NEW - Chat page
│   │   └── page.tsx             # Main chat page (Client Component)
│   ├── tasks/                   # EXISTING - Keep for reference
│   │   └── page.tsx
│   ├── login/                   # EXISTING
│   │   └── page.tsx
│   ├── register/                # EXISTING
│   │   └── page.tsx
│   ├── layout.tsx               # EXISTING - Root layout
│   ├── page.tsx                 # EXISTING - Landing page
│   └── globals.css              # EXISTING - Global styles
│
├── components/
│   ├── chat/                    # NEW - Chat components
│   │   ├── ChatInterface.tsx    # Main ChatKit wrapper (Client Component)
│   │   ├── MessageList.tsx      # Conversation history display
│   │   ├── ChatInput.tsx        # Message input with send button
│   │   └── ToolCallIndicator.tsx # Tool execution badges
│   ├── Header.tsx               # UPDATE - Add chat link
│   ├── LoginForm.tsx            # EXISTING
│   ├── RegisterForm.tsx         # EXISTING
│   ├── TaskForm.tsx             # EXISTING
│   ├── TaskItem.tsx             # EXISTING
│   └── TaskList.tsx             # EXISTING
│
├── lib/
│   ├── api.ts                   # EXISTING - Task API client
│   ├── chat-api.ts              # NEW - Chat API client
│   └── types.ts                 # UPDATE - Add chat types
│
├── __tests__/
│   ├── components/
│   │   └── chat/                # NEW - Chat component tests
│   │       ├── ChatInterface.test.tsx
│   │       ├── MessageList.test.tsx
│   │       ├── ChatInput.test.tsx
│   │       └── ToolCallIndicator.test.tsx
│   └── e2e/                     # NEW - E2E tests
│       └── chat.spec.ts
│
├── public/                      # EXISTING - Static assets
├── .env.local                   # UPDATE - Add NEXT_PUBLIC_OPENAI_DOMAIN_KEY
├── next.config.ts               # EXISTING
├── proxy.ts                     # UPDATE - Protect /chat route
├── tailwind.config.js           # EXISTING
├── package.json                 # UPDATE - Add @openai/chatkit
├── tsconfig.json                # EXISTING
└── CLAUDE.md                    # EXISTING - Frontend instructions
```

**Structure Decision**: This is a web application with frontend-only changes for Phase 3. The backend chat endpoint already exists and is functional. We're adding new components in `components/chat/`, a new page at `app/chat/page.tsx`, and a new API client module `lib/chat-api.ts`. All existing Phase 2 components remain unchanged. The structure follows Next.js 16 App Router conventions with clear separation between Server Components (default) and Client Components (marked with 'use client').

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitutional requirements are met without exceptions.

## Phase 0: Research & Technical Decisions

### Research Tasks

1. **OpenAI ChatKit Integration Patterns**
   - Research: Official ChatKit documentation and setup guide
   - Research: Domain allowlist configuration process
   - Research: ChatKit props and customization options
   - Research: ChatKit with Next.js 16 App Router compatibility

2. **Next.js 16 Client Component Best Practices**
   - Research: When to use 'use client' directive
   - Research: Server Component vs Client Component data flow
   - Research: State management in Client Components
   - Research: Authentication in Client Components

3. **Chat UI/UX Patterns**
   - Research: Message display patterns (user vs assistant)
   - Research: Loading states for async operations
   - Research: Auto-scroll behavior for chat interfaces
   - Research: Mobile chat interface best practices

4. **JWT Authentication in Chat Context**
   - Research: Token refresh strategies during long chat sessions
   - Research: Handling 401 errors in chat interface
   - Research: Secure token storage and retrieval

5. **Testing Strategies for Chat Interfaces**
   - Research: Mocking ChatKit in component tests
   - Research: E2E testing for conversational flows
   - Research: Testing async message sending/receiving

### Output Location
All research findings will be consolidated in `specs/002-frontend-chat-interface/research.md`

## Phase 1: Design & Contracts

### Data Model (Frontend)

**Output**: `specs/002-frontend-chat-interface/data-model.md`

Frontend data structures (TypeScript interfaces):

1. **Message Interface**
   - id: string
   - role: 'user' | 'assistant'
   - content: string
   - timestamp: Date
   - toolCalls?: string[]

2. **Conversation Interface**
   - id: number
   - userId: string
   - messages: Message[]
   - createdAt: Date
   - updatedAt: Date

3. **ChatRequest Interface**
   - conversationId?: number
   - message: string

4. **ChatResponse Interface**
   - conversationId: number
   - response: string
   - toolCalls: string[]

5. **ChatState Interface** (component state)
   - conversationId: number | null
   - messages: Message[]
   - isLoading: boolean
   - error: string | null

### API Contracts

**Output**: `specs/002-frontend-chat-interface/contracts/chat-api.yaml`

OpenAPI specification for chat endpoint integration:

```yaml
POST /api/{user_id}/chat
  Request:
    - conversationId (optional): integer
    - message (required): string
  Response:
    - conversationId: integer
    - response: string
    - toolCalls: string[]
  Authentication: Bearer JWT token
  Status Codes:
    - 200: Success
    - 401: Unauthorized
    - 400: Bad Request
    - 500: Server Error
```

### Component Architecture

**Output**: Documented in `data-model.md`

1. **ChatInterface Component** (Client Component)
   - Manages conversation state
   - Handles message sending
   - Integrates ChatKit
   - Manages authentication

2. **MessageList Component**
   - Displays conversation history
   - Shows timestamps
   - Renders tool badges
   - Auto-scrolls to latest

3. **ChatInput Component**
   - Message input field
   - Send button
   - Input validation
   - Character limit

4. **ToolCallIndicator Component**
   - Displays tool execution badges
   - Conditional rendering
   - Styled with Tailwind

### Quickstart Guide

**Output**: `specs/002-frontend-chat-interface/quickstart.md`

Developer setup instructions:
1. Install dependencies (npm install)
2. Configure environment variables
3. Run development server
4. Access chat interface
5. Test natural language commands

### Agent Context Update

After Phase 1 completion, run:
```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This will update the Claude-specific context file with new technologies and patterns from this plan.

## Phase 2: Task Generation

**NOT EXECUTED BY /sp.plan** - Use `/sp.tasks` command after plan approval.

The tasks phase will break down the implementation into:
- Dependency installation tasks
- Component implementation tasks
- API client implementation tasks
- Routing and authentication tasks
- Styling tasks
- Testing tasks

## Implementation Notes

### Critical Path
1. Install @openai/chatkit package
2. Create chat API client (lib/chat-api.ts)
3. Implement ChatInterface component
4. Implement MessageList component
5. Implement ChatInput component
6. Implement ToolCallIndicator component
7. Create /chat page with authentication
8. Update Header with chat link
9. Add environment variable for domain key
10. Write component tests
11. Write E2E tests

### Risk Mitigation
- **Risk**: ChatKit compatibility with Next.js 16
  - **Mitigation**: Research and test ChatKit integration early
- **Risk**: Domain allowlist configuration delays
  - **Mitigation**: Document localhost testing (no key required)
- **Risk**: JWT token expiration during chat session
  - **Mitigation**: Implement token refresh or graceful logout
- **Risk**: Performance with large conversation history
  - **Mitigation**: Implement pagination or lazy loading if needed

### Dependencies on Other Work
- Backend chat endpoint must be functional (COMPLETE per spec)
- JWT authentication system must be working (COMPLETE from Phase 2)
- Task CRUD endpoints must be available (COMPLETE from Phase 2)

### Testing Strategy
- Unit tests for each component
- Integration tests for chat API client
- E2E tests for complete chat workflows
- Manual testing on multiple browsers and devices

## Success Metrics

Implementation will be considered complete when:
- All 18 functional requirements from spec are met
- All 10 success criteria are achieved
- All component tests pass
- All E2E tests pass
- Chat interface works on mobile and desktop
- Authentication is properly enforced
- Conversation history persists across sessions
- All natural language examples work correctly

## Next Steps

1. Review and approve this plan
2. Execute Phase 0 research (automated)
3. Execute Phase 1 design (automated)
4. Run `/sp.tasks` to generate implementation tasks
5. Begin implementation via `/sp.implement`
