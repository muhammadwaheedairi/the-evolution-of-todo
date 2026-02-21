# Frontend Instructions - Next.js 16+ Todo AI Chatbot (Phase 1-5)

**See root `/CLAUDE.md` for comprehensive project documentation.**

This workspace contains the Next.js 16+ frontend with OpenAI ChatKit conversational interface.

## Technology Stack by Phase

**Phase 1:** Next.js 16+ (App Router), TypeScript (strict), Tailwind CSS v3.4+, Lucide React
**Phase 2:** Custom JWT (localStorage + cookies), React Hook Form, Zod validation
**Phase 3:** OpenAI ChatKit, Client Components for chat, Stateless conversations
**Phase 4:** Docker (multi-stage), non-root containers
**Phase 5:** Advanced task UI (filters, tags, priorities, due dates, recurring tasks)

## Project Structure

```
frontend/
├── app/                           # Next.js 16+ App Router
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── login/page.tsx             # Login
│   ├── register/page.tsx          # Registration
│   ├── chat/page.tsx              # Phase 3: Chat interface (Client Component)
│   └── tasks/page.tsx             # Phase 2: Task dashboard (keep for reference)
├── components/
│   ├── Header.tsx                 # Navigation (Phase 3: +chat link)
│   ├── LoginForm.tsx, RegisterForm.tsx
│   ├── chat/                      # Phase 3: Chat components
│   │   ├── ChatInterface.tsx      # Main ChatKit wrapper (Client Component)
│   │   ├── MessageList.tsx        # Conversation history
│   │   ├── ChatInput.tsx          # Message input
│   │   └── ToolCallIndicator.tsx  # Tool execution badges
│   └── tasks/                     # Phase 5: Advanced task components
│       ├── TaskFilters.tsx        # Filter by priority/tags/due date
│       ├── PriorityBadge.tsx      # Priority indicator
│       ├── TagCloud.tsx           # Tag management
│       ├── DueDatePicker.tsx      # Due date selector
│       └── RecurrenceSelector.tsx # Recurring task config
├── lib/
│   ├── api.ts                     # Phase 2: Task API client + JWT auth
│   ├── chat-api.ts                # Phase 3: Chat endpoint client
│   └── types.ts                   # TypeScript types (all phases)
├── Dockerfile                     # Phase 4: Multi-stage build
├── proxy.ts                       # Route protection middleware
├── .env.local                     # Environment variables
└── CLAUDE.md                      # Frontend-specific instructions
```

## Critical Requirements by Phase

### Phase 1-2: Next.js App Router (MANDATORY)
**Server Components (Default):**
- All components are Server Components unless they need interactivity
- Use for: data fetching, static content, layouts

**Client Components (Only When Needed):**
- Add `'use client'` directive for: forms, event handlers, React hooks, interactive elements
- Use for: LoginForm, RegisterForm, TaskForm, ChatInterface (Phase 3)

**Custom JWT Auth:**
- Store token in localStorage + cookies
- Include JWT in all API headers: `Authorization: Bearer <token>`
- Verify user_id in URL matches token
- Clear tokens on 401 errors, redirect to login

### Phase 3: ChatKit Integration (MANDATORY)
**Domain Allowlist (CRITICAL for Production):**
1. Deploy frontend to production URL
2. Add domain to OpenAI allowlist: https://platform.openai.com/settings/organization/security/domain-allowlist
3. Obtain domain key (format: `dk-...`)
4. Add to environment: `NEXT_PUBLIC_OPENAI_DOMAIN_KEY=dk-...`
5. Redeploy with new env var
6. Localhost works without domain key

**ChatKit Component:**
- MUST be Client Component (`'use client'`)
- Configure with backend chat endpoint
- Include JWT token in all requests
- Display conversation history on load
- Show loading states during agent processing
- Render tool execution indicators
- Handle errors user-friendly (not technical)

**Chat Interface Requirements:**
- Chat is PRIMARY interface (not secondary)
- User/assistant messages visually distinct
- Timestamps on all messages
- Conversational tone throughout
- Natural language examples work correctly

### Phase 4: Containerization (MANDATORY)
- Multi-stage Dockerfile (build + runtime)
- Non-root execution (adduser nextjs)
- Official base image (node:alpine)
- No secrets in images
- Layer optimization (.dockerignore)

### Phase 5: Advanced Task Features (MANDATORY)
**UI Components:**
- Priority badges (high/medium/low with colors)
- Tag cloud (multi-select, visual chips)
- Due date picker (calendar component)
- Recurrence selector (daily/weekly/monthly patterns)
- Filter panel (priority, tags, due date range, status)
- Sort controls (created_at, due_date, priority, title)

**Natural Language Support:**
- All advanced features accessible via chat
- Examples: "add high priority task", "show tasks due this week", "create recurring standup every weekday"

## API Client Patterns

### Task API Client (Phase 2)
**Location:** `lib/api.ts`

**Functions:**
- `getToken()`, `getUserId()`, `setAuthTokens()`, `clearAuthTokens()`
- `authenticatedFetch()` - Handles JWT auth + 401 errors
- `register()`, `login()`, `logout()`
- `getTasks()`, `createTask()`, `getTask()`, `updateTask()`, `deleteTask()`, `toggleTaskCompletion()`

**Phase 5 Updates:**
- Add parameters: due_date, priority, tags, recurrence_pattern
- Add filter/sort parameters to getTasks()

### Chat API Client (Phase 3)
**Location:** `lib/chat-api.ts`

**Functions:**
- `sendChatMessage(userId, request)` - Send message with JWT auth
  - Request: `{conversation_id?: int, message: string}`
  - Response: `{conversation_id: int, response: string, tool_calls: string[]}`
  - Handles 401 errors (clear tokens, redirect to login)
- `getConversationHistory(userId, conversationId)` - Fetch message history

**Key Features:**
- Same JWT authentication as task API
- Optional conversation_id (backend creates new if not provided)
- Returns agent response with tool execution details
- TypeScript interfaces for type safety

## Chat Components (Phase 3)

### ChatInterface Component
**Location:** `components/chat/ChatInterface.tsx`
**Type:** Client Component (`'use client'`)

**Responsibilities:**
- Render OpenAI ChatKit with proper config
- Manage conversation state (conversation_id in useState)
- Send messages to backend via chat-api
- Display agent responses conversationally
- Show tool execution indicators
- Handle loading/error states
- Maintain JWT authentication

**State Management:**
- Track current conversation_id (null for new)
- Update conversation_id after first message
- Manage loading state during API calls
- Handle errors with user-friendly messages

### MessageList Component
**Purpose:** Display conversation history with formatting

**Features:**
- Distinguish user vs assistant messages (colors/alignment)
- Show timestamps for all messages
- Display tool execution badges
- Auto-scroll to latest message
- Empty state for new conversations
- Loading indicator during agent processing

**Styling:**
- User messages: right-aligned, blue background
- Assistant messages: left-aligned, gray background
- Timestamps: small text, muted color
- Tool badges: small pills (e.g., "🛠️ add_task")

### ChatInput Component
**Purpose:** Message input with send functionality

**Features:**
- Text input with placeholder (example commands)
- Send button (disabled during loading)
- Enter to send (Shift+Enter for new line)
- Prevent empty messages
- Auto-focus on mount

### ToolCallIndicator Component
**Purpose:** Show which MCP tools were executed

**Display:**
- Only show if tool_calls array not empty
- Small badge for each tool executed
- Use icons (🛠️ or tool emoji)
- Optional: Show parameters in tooltip

## Environment Variables

```bash
# Phase 2
NEXT_PUBLIC_API_URL=http://localhost:8000

# Phase 3 (CRITICAL for production)
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=dk-your-domain-key-here
```

**Security Note:** Domain key is safe to expose (client-side), but follows NEXT_PUBLIC_ convention.

## Natural Language Examples (Phase 3 + Phase 5)

| User Input | Expected Behavior | Tool Called |
|------------|-------------------|-------------|
| "add task buy groceries" | Creates task, confirms | `add_task` |
| "show me all tasks" | Lists all tasks | `list_tasks` (status="all") |
| "mark task 3 as done" | Completes task 3 | `complete_task` |
| "add high priority task buy milk due tomorrow" | Creates with priority + due date | `add_task` (Phase 5) |
| "show me high priority tasks" | Lists filtered tasks | `list_tasks` (Phase 5) |
| "what's due this week?" | Lists tasks by due date range | `list_tasks` (Phase 5) |
| "create recurring standup every weekday" | Creates recurring task | `add_task` (Phase 5) |

**UI Feedback:**
- Show loading indicator while agent processes
- Display conversational response (not JSON)
- Show tool execution badges (optional)
- Confirm actions with positive feedback
- Show errors conversationally

## Testing

### Component Tests (Jest)
**Phase 3 Coverage:**
- ChatInterface renders correctly
- Message sending works
- Conversation history loads
- Tool indicators display
- Loading states show
- Error handling works (401, network, API errors)
- Mock chat API responses

### E2E Tests (Playwright)
**Phase 3 Scenarios:**
1. User can add task via chat
2. User can list tasks via chat
3. User can complete task via chat
4. Conversation history persists after refresh
5. Unauthenticated users redirected to login

**Phase 5 Scenarios:**
6. User can add task with priority/tags/due date via chat
7. User can filter tasks by priority
8. User can create recurring task via chat

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Lint code
npm run test         # Run component tests
npm run test:e2e     # Run E2E tests
```

## Tailwind Styling Guidelines

**Always use Tailwind classes, never inline styles or CSS modules**

**Chat Component Styling:**
- User messages: `bg-blue-600 text-white justify-end`
- Assistant messages: `bg-gray-100 text-gray-900 justify-start`
- Message bubbles: `rounded-lg p-3`
- Timestamps: `text-xs text-gray-500`
- Tool badges: `bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded`

**Phase 5 Component Styling:**
- Priority high: `bg-red-100 text-red-700`
- Priority medium: `bg-yellow-100 text-yellow-700`
- Priority low: `bg-green-100 text-green-700`
- Tags: `bg-gray-200 text-gray-700 rounded-full px-2 py-1`

## Skills to Use

**Frontend-Specific:**
- **building-nextjs-apps:** Next.js 16 patterns, App Router, breaking changes, ChatKit as Client Component
- **frontend-design:** Distinctive UI design, conversational chat interface, visual hierarchy
- **building-chat-interfaces:** ChatKit integration, authentication, context injection (Phase 3)
- **building-chat-widgets:** Interactive elements, tool indicators, rich UI (Phase 3)
- **browsing-with-playwright:** E2E testing, natural language interactions, conversation persistence (Phase 3)
- **nextjs-devtools:** Debug ChatKit integration, route configuration

## Reference Documentation

**Core:** Next.js App Router, React Server Components, Tailwind CSS, TypeScript, React Hook Form, Zod
**Phase 3:** OpenAI ChatKit, OpenAI Domain Allowlist, React Client Components, Fetch API
**Phase 4:** Docker
**Phase 5:** Advanced UI patterns

**CRITICAL:** Always verify patterns against official docs. Use context7 MCP to fetch documentation.

---

**Current Phase:** 5 - Advanced Cloud Deployment
**Frontend Version:** 3.0.0
**Last Updated:** 2026-02-15

This frontend implements AI-powered conversational task management with advanced features while maintaining secure authentication, type safety, and Next.js 16+ App Router best practices.
