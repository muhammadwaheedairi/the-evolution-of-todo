# Frontend Workspace Instructions - Next.js 16+ App Router with AI Chatbot (Phase 3)

This workspace contains the Next.js 16+ frontend for the Todo AI Chatbot Application with OpenAI ChatKit conversational interface.

## Technology Stack

- **Framework**: Next.js 16.1.6 (App Router - NOT Pages Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v3.4.19
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation (for non-chat forms)
- **Authentication**: Custom JWT implementation (localStorage + cookies)
- **State Management**: React Server Components + Client Components
- **HTTP Client**: Native fetch API
- **Testing**: Jest (components), Playwright (E2E)
- **Chat UI**: OpenAI ChatKit - **NEW for Phase 3**

## Critical Requirements

### Next.js App Router Rules

1. **Default to Server Components**: All components are Server Components unless they need interactivity
2. **Client Components Only When Needed**: Use `'use client'` directive for:
   - Forms with `onSubmit`, `onClick`, event handlers
   - Components using React hooks (`useState`, `useEffect`, `useContext`)
   - Interactive elements (buttons with onClick, input fields)
   - **ChatKit UI (requires interactivity)** - NEW
3. **Server Components for**:
   - Data fetching (async components)
   - Static content
   - Layout components
   - Pages without interactivity

### **ChatKit Requirements (NEW for Phase 3)**

1. **Domain Allowlist Configuration (CRITICAL)**:
   - Production domain MUST be added to OpenAI platform before deployment
   - Navigate to: https://platform.openai.com/settings/organization/security/domain-allowlist
   - Add deployed frontend URL (e.g., `https://your-app.vercel.app`)
   - Obtain domain key after approval
   - Store in `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` environment variable
   - Localhost development works without domain key

2. **ChatKit Integration**:
   - ChatKit component MUST be Client Component (`'use client'`)
   - Configure with backend chat endpoint URL
   - Handle authentication (include JWT token in requests)
   - Display conversation history on page load
   - Show loading states during agent processing
   - Render tool execution results (optional transparency feature)

3. **Natural Language Interface**:
   - Chat is PRIMARY interface (not secondary to forms)
   - User and agent messages must be visually distinct
   - Timestamps shown for all messages
   - Error messages must be user-friendly (not technical)
   - Conversational tone throughout interface

### Component Structure

The frontend follows Next.js 16+ App Router conventions:
- Server Components are the default (no directive needed)
- Client Components require the 'use client' directive and are used only for interactive elements
- Components are organized in the components/ directory for reusability
- **NEW: Chat components in components/chat/** for conversational interface

## Project Structure

```
frontend/
├── app/                        # Next.js 16+ App Router
│   ├── api/                    # API routes (if any)
│   ├── favicon.ico
│   ├── globals.css             # Global styles with Tailwind
│   ├── layout.tsx              # Root layout component
│   ├── page.tsx                # Landing page (marketing)
│   ├── login/page.tsx          # Login page
│   ├── register/page.tsx       # Registration page
│   ├── chat/                   # Chat interface - NEW for Phase 3
│   │   └── page.tsx            # Main chat page (Client Component)
│   ├── tasks/                  # Traditional task UI (keep for reference)
│   │   └── page.tsx            # Task management dashboard
│   └── error.tsx
├── components/                 # Reusable UI components
│   ├── Header.tsx              # Navigation header (update with chat link)
│   ├── EmptyState.tsx
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── chat/                   # Chat components - NEW for Phase 3
│   │   ├── ChatInterface.tsx   # Main ChatKit wrapper (Client Component)
│   │   ├── MessageList.tsx     # Conversation history display
│   │   ├── ChatInput.tsx       # Message input field
│   │   └── ToolCallIndicator.tsx  # Shows which tools were executed
│   ├── TaskForm.tsx            # Form for creating/editing tasks (keep)
│   ├── TaskItem.tsx            # Individual task display component (keep)
│   └── TaskList.tsx            # Task list container component (keep)
├── lib/                        # Utility functions and types
│   ├── api.ts                  # API client and authentication functions
│   ├── chat-api.ts             # Chat endpoint client - NEW for Phase 3
│   └── types.ts                # TypeScript type definitions (add chat types)
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── next.config.ts              # Next.js configuration
├── proxy.ts                    # Route protection middleware (protect chat route)
├── tailwind.config.js          # Tailwind CSS configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── .gitignore
├── CLAUDE.md                   # Frontend-specific instructions
└── README.md                   # Project documentation
```

## API Client Pattern

**Location**: `lib/api.ts`

The frontend implements a custom JWT authentication system using both localStorage and cookies with the following components:

- **API_URL**: Base URL for backend API calls
- **getToken**: Retrieves JWT token from both localStorage and cookies
- **getUserId**: Retrieves user ID from localStorage
- **setAuthTokens**: Stores JWT tokens in both localStorage and cookies
- **clearAuthTokens**: Removes JWT tokens from both localStorage and cookies
- **authenticatedFetch**: Makes authenticated API requests with proper error handling for 401 responses
- **API functions**: Implement all necessary CRUD operations for user authentication (register, login, logout) and tasks (list, create, get, update, delete, toggle completion)

All API calls include the JWT token in the Authorization header and verify user authentication before making requests. The authentication state is synchronized across tabs using storage events.

### **Chat API Client (NEW for Phase 3)**

**Location**: `lib/chat-api.ts`

The chat API client handles communication with the backend chat endpoint:

**Required Functions:**
- `sendChatMessage(userId, request)`: Send message to chat endpoint with JWT authentication
  - Request includes: optional conversation_id, required message text
  - Returns: conversation_id, agent response text, array of tool_calls executed
  - Handles 401 errors by clearing tokens and redirecting to login
  - Throws errors for network failures or API errors

- `getConversationHistory(userId, conversationId)`: Fetch message history for a conversation
  - Returns array of messages with role (user/assistant), content, timestamp
  - Used to load conversation when user returns to chat

**Key Features:**
- Maintains same JWT authentication pattern as task API
- Handles conversation_id (optional - backend creates new if not provided)
- Returns agent response with tool execution details
- Proper error handling with 401 redirects to login
- TypeScript interfaces for type safety

## Component Guidelines

### Forms (Always Client Components)

Forms in the application are always Client Components since they require interactivity. They utilize React state hooks and form handling libraries like React Hook Form with Zod validation.

**NEW for Phase 3:** Chat interface is also a Client Component due to real-time interaction requirements.

### **Chat Components (NEW for Phase 3)**

#### ChatInterface Component

**Location**: `components/chat/ChatInterface.tsx`

**Type**: Client Component (`'use client'` directive required)

**Responsibilities:**
- Render OpenAI ChatKit component with proper configuration
- Manage conversation state (current conversation_id in useState)
- Send messages to backend chat endpoint using chat-api functions
- Display agent responses in conversational format
- Show tool execution indicators (which MCP tools were called)
- Handle loading states while agent processes request
- Maintain authentication (include JWT token in all requests)

**State Management:**
- Track current conversation_id (null for new conversation)
- Update conversation_id after first message sent
- Manage loading state during API calls
- Handle error states with user-friendly messages

**ChatKit Configuration:**
- Pass handleMessage function that calls backend API
- Include NEXT_PUBLIC_OPENAI_DOMAIN_KEY from environment
- Configure placeholder text with example commands
- Style with Tailwind classes for visual consistency

#### MessageList Component

**Location**: `components/chat/MessageList.tsx`

**Purpose:** Display conversation history with proper formatting

**Features:**
- Distinguish user vs assistant messages visually (different colors/alignment)
- Show timestamps for all messages
- Display tool execution badges when tools were called
- Auto-scroll to latest message on new messages
- Empty state for new conversations ("Start chatting...")
- Loading indicator when waiting for agent response

**Styling Guidelines:**
- User messages: right-aligned, blue background
- Assistant messages: left-aligned, gray background
- Timestamps: small text, muted color below messages
- Tool badges: small pills showing tool names (e.g., "🛠️ add_task")

#### ChatInput Component

**Location**: `components/chat/ChatInput.tsx`

**Purpose:** Message input field with send functionality

**Features:**
- Text input with placeholder showing example commands
- Send button (disabled during loading)
- Enter key to send (Shift+Enter for new line)
- Character limit indicator (optional)
- Auto-focus on mount for better UX

**Validation:**
- Prevent sending empty messages
- Trim whitespace before sending
- Show error if message too long

#### ToolCallIndicator Component

**Location**: `components/chat/ToolCallIndicator.tsx`

**Purpose:** Show which MCP tools were executed by agent

**Display Logic:**
- Only show if tool_calls array is not empty
- Render small badge for each tool executed
- Use icons to make visually clear (🛠️ or tool emoji)
- Optional: Show tool parameters in tooltip on hover

**Styling:**
- Small pills/badges below assistant messages
- Different colors for different tool types (optional)
- Clear but not distracting from main conversation

### Tailwind CSS Styling

**Always use Tailwind classes, never inline styles or CSS modules**

The application uses Tailwind CSS for styling with a utility-first approach. Components are styled using predefined Tailwind classes for consistency and maintainability.

**NEW for Phase 3:** ChatKit components can be styled with Tailwind for custom theming

**Chat Component Styling Guidelines:**
- Use `bg-blue-600 text-white` for user messages
- Use `bg-gray-100 text-gray-900` for assistant messages
- Use flexbox for message alignment (`justify-end` for user, `justify-start` for assistant)
- Use `rounded-lg` for message bubbles
- Use `text-xs text-gray-500` for timestamps
- Use `bg-blue-100 text-blue-700` for tool execution badges

## Environment Variables

The application uses environment variables for configuration. The following variables are used:

**Phase 2 Variables (keep):**
- `NEXT_PUBLIC_API_URL`: The backend API base URL (required)
  - Example: `http://localhost:8000` for development
  - Example: `https://api.yourdomain.com` for production

**Phase 3 New Variables:**
- `NEXT_PUBLIC_OPENAI_DOMAIN_KEY`: OpenAI ChatKit domain key (required for production)
  - Obtain from OpenAI platform after adding domain to allowlist
  - Not required for localhost development
  - Format: `dk-` followed by alphanumeric string
  - Must be prefixed with `NEXT_PUBLIC_` to be accessible in browser

**Example .env.local:**
```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# OpenAI ChatKit (Phase 3)
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=dk-your-domain-key-here
```

**Security Note:** Domain key is safe to expose (it's client-side), but still follows NEXT_PUBLIC_ convention.

## Testing

The application includes testing capabilities:

### Component Tests (Jest)
Component testing using Jest and React Testing Library to test individual UI components.

**NEW for Phase 3 Test Coverage:**
- ChatInterface component renders correctly
- Message sending functionality works
- Conversation history loads properly
- Tool call indicators display correctly
- Loading states show appropriately
- Error handling works (401, network errors, API errors)
- Mock chat API responses for predictable testing

**Test Files to Add:**
- `__tests__/components/chat/ChatInterface.test.tsx`
- `__tests__/components/chat/MessageList.test.tsx`
- `__tests__/components/chat/ToolCallIndicator.test.tsx`
- `__tests__/lib/chat-api.test.ts`

### E2E Tests (Playwright)

End-to-end testing using Playwright to test complete user workflows.

**NEW for Phase 3 E2E Scenarios:**
- Complete chat workflow (send message → receive response → verify task created)
- Natural language task operations via chat (add, list, complete, delete, update)
- Conversation persistence (refresh page, history remains visible)
- Authentication in chat interface (redirects to login if not authenticated)
- Error handling in chat (network failure, rate limits, invalid requests)
- Multi-turn conversation (context maintained across messages)

**Test Scenarios:**
1. User can add task via natural language chat
2. User can list tasks via chat command
3. User can complete task via chat message
4. User can delete task via conversational request
5. User can update task title through chat
6. Conversation history persists after page refresh
7. Unauthenticated users redirected to login from chat page

## Development Commands

The application provides several npm scripts for development:

- `npm run dev`: Start development server with hot reload
- `npm run build`: Create production build
- `npm run start`: Start production server
- `npm run lint`: Lint code
- `npm run test`: Run component tests (Jest)
- `npm run test:e2e`: Run E2E tests (Playwright)
- `npm run test:watch`: Run tests in watch mode for development

## Critical Security Rules

1. **Never expose secrets in client-side code**
2. **Use NEXT_PUBLIC_ prefix only for safe env vars**
3. **Validate all user input (client and server)**
4. **Sanitize output to prevent XSS**
5. **All API requests must include JWT token in Authorization header**
6. **NEW: Validate OpenAI domain key is set before production deployment**
7. **NEW: Never send sensitive data in chat messages (backend filters, but frontend should also validate)**
8. **NEW: Chat API calls must use same authentication pattern as task API**

## Common Patterns

### Protected Route Pattern

The application implements protected routes that require authentication before allowing access to user-specific content like task management and chat interface.

**NEW for Phase 3:** Chat page also requires authentication
- Check for valid JWT token before rendering chat interface
- Redirect to login page if token missing or invalid
- Verify user_id available in localStorage
- Show loading state while checking authentication

**Protected Routes:**
- `/tasks` - Task management dashboard (Phase 2)
- `/chat` - AI chatbot interface (Phase 3) - NEW

### Error Handling

The application includes proper error boundaries and error handling patterns to gracefully handle runtime errors.

**NEW for Phase 3 Chat-Specific Error Handling:**

**OpenAI API Errors:**
- Rate limit errors → Show "Too many requests. Please wait a moment."
- Network errors → Show "Network error. Please check your connection."
- Authentication errors → Clear tokens, redirect to login
- Generic errors → Show "Something went wrong. Please try again."

**Chat Interface Errors:**
- Empty message → Prevent sending, show inline validation
- Message too long → Show character count warning
- Backend timeout → Show retry option
- Conversation not found → Create new conversation automatically

**Error Display:**
- Use toast notifications for temporary errors
- Use inline error messages for form validation
- Log errors to console in development (not production)
- Never show technical stack traces to users

## **OpenAI ChatKit Setup (NEW for Phase 3)**

### Installation

**Package:** `@openai/chatkit`

**Install Command:** Add to package.json dependencies and run npm install

**Required for:** Phase 3 conversational interface

### Domain Allowlist Configuration (CRITICAL)

**This step is MANDATORY before production deployment. App will not work without it.**

**Step-by-Step Process:**

1. **Deploy Frontend First:**
   - Deploy to Vercel, your hosting platform
   - Note the production URL (e.g., `https://your-app.vercel.app`)
   - Custom domains also supported (e.g., `https://yourdomain.com`)

2. **Add Domain to OpenAI Allowlist:**
   - Navigate to: https://platform.openai.com/settings/organization/security/domain-allowlist
   - Click "Add domain" button
   - Enter your production URL exactly (no trailing slash)
   - Save changes and wait for approval (usually instant)

3. **Obtain Domain Key:**
   - After adding domain, OpenAI provides a unique domain key
   - Key format: `dk-` followed by alphanumeric characters
   - Copy this key immediately (shown once)

4. **Add to Environment Variables:**
   - Create or update `.env.local` file
   - Add: `NEXT_PUBLIC_OPENAI_DOMAIN_KEY=dk-your-actual-key`
   - Redeploy application with new environment variable

5. **Verify Configuration:**
   - Open production URL in browser
   - Navigate to chat page
   - Send a test message
   - ChatKit should render without CORS errors
   - Messages should send and receive successfully

**Important Notes:**
- Localhost (`http://localhost:3000`) works without domain allowlist
- Development testing does not require domain key
- Production MUST have domain key configured
- Each domain needs separate allowlist entry
- Subdomains count as different domains

### ChatKit Props Reference

**Essential Props:**
- `endpoint`: Function to handle message sending to backend
- `domainKey`: OpenAI domain key from environment variable
- `placeholder`: Placeholder text for input field

**Optional Styling Props:**
- `className`: Container styling classes
- `messageClassName`: Styling for all messages
- `userMessageClassName`: Styling specifically for user messages
- `assistantMessageClassName`: Styling specifically for assistant messages

**Optional Feature Props:**
- `showTimestamps`: Boolean to show/hide message timestamps
- `autoFocus`: Boolean to auto-focus input on component mount
- `maxLength`: Maximum character limit for messages

**Configuration Best Practices:**
- Always check domain key exists before rendering ChatKit
- Provide fallback UI if domain key missing
- Use Tailwind classes for consistent styling
- Configure placeholder with example commands for better UX

## **Natural Language Examples (Phase 3)**

The chat interface should handle these natural language inputs correctly:

| User Input | Expected Agent Behavior | Backend Tool Called |
|------------|------------------------|---------------------|
| "add task buy groceries" | Creates task, responds: "I've added 'Buy groceries' to your tasks." | `add_task` |
| "show me all tasks" | Lists all tasks in conversational format | `list_tasks` (status="all") |
| "what's pending?" | Lists pending tasks only | `list_tasks` (status="pending") |
| "mark task 3 as done" | Completes task 3, confirms action | `complete_task` (task_id=3) |
| "delete the meeting task" | Lists tasks, identifies match, deletes it | `list_tasks` + `delete_task` |
| "change task 1 to 'call mom tonight'" | Updates task 1 title | `update_task` (task_id=1) |
| "I need to remember to pay bills" | Creates task "pay bills" | `add_task` |
| "what have I completed?" | Lists completed tasks | `list_tasks` (status="completed") |

**UI Feedback Requirements:**
- Show loading indicator (spinner/skeleton) while agent processes
- Display agent's conversational response (not raw JSON)
- Show which tools were executed via badges (optional but recommended)
- Confirm successful actions with positive visual feedback
- Show error messages conversationally (not technical errors)

**Response Expectations:**
- Agent responses should be friendly and conversational
- Avoid technical jargon or JSON output
- Provide helpful suggestions if intent unclear
- Confirm actions before destructive operations (delete)

## Relevant Skills

### building-nextjs-apps
- **Purpose**: Build Next.js 16 applications with correct patterns and distinctive design
- **When to use**: Creating pages, layouts, dynamic routes, upgrading from Next.js 15, or implementing proxy.ts
- **Why it's relevant**: This skill covers Next.js 16 breaking changes (async params/searchParams), proper App Router patterns, and addresses common mistakes developers make when transitioning to Next.js 16
- **NEW for Phase 3**: Implementing ChatKit as Client Component with proper Next.js patterns

### frontend-design
- **Purpose**: Create distinctive, production-grade frontend interfaces with high design quality
- **When to use**: Building web components, pages, artifacts, posters, or applications (websites, landing pages, dashboards, React components, HTML/CSS layouts)
- **Why it's relevant**: Helps create visually appealing and user-friendly interfaces for the Todo application with distinctive design aesthetics
- **NEW for Phase 3**: Design conversational chat interface with clear visual hierarchy between user/assistant messages

### nextjs-devtools
- **Purpose**: Next.js development tooling via MCP. Inspect routes, components, build info, and debug Next.js apps
- **When to use**: Working on Next.js applications, debugging routing, or inspecting app structure
- **Why it's relevant**: Provides development tools to inspect and debug the Next.js application during development
- **NEW for Phase 3**: Debug ChatKit integration and chat route configuration

### building-chat-interfaces
- **Purpose**: Build AI chat interfaces with custom backends, authentication, and context injection
- **When to use**: Integrating chat UI with AI agents, adding auth to chat, injecting user/page context, or implementing httpOnly cookie proxies. Covers ChatKitServer, useChatKit, and MCP auth patterns.
- **Why it's relevant**: Essential for Phase 3 implementation of OpenAI ChatKit with proper authentication and backend integration
- **NEW for Phase 3**: Specifically designed for implementing secure, authenticated chat interfaces with proper context management

### building-chat-widgets
- **Purpose**: Build interactive AI chat widgets with buttons, forms, and bidirectional actions
- **When to use**: Creating agentic UIs with clickable widgets, entity tagging (@mentions), composer tools, or server-handled widget actions. Covers full widget lifecycle.
- **Why it's relevant**: Useful for enhancing the chat interface with interactive elements and rich UI components beyond basic text input
- **NEW for Phase 3**: Enhance ChatKit with interactive elements like tool execution indicators, message actions, or rich input components

### browsing-with-playwright
- **Purpose**: Browser automation using Playwright MCP. Navigate websites, fill forms, click elements, take screenshots, and extract data
- **When to use**: Web browsing, form submission, web scraping, UI testing, or any browser interaction
- **Why it's relevant**: Critical for end-to-end testing of the frontend application, especially for Phase 3 chat interface functionality
- **NEW for Phase 3**: Test natural language interactions, verify conversation persistence, and validate chat UI behavior across different scenarios

## Reference Documentation

**Core Technologies (Phase 2):**
- Next.js App Router: https://nextjs.org/docs/app
- React Hook Form: https://react-hook-form.com/
- Zod Validation: https://zod.dev/
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs/
- Lucide React Icons: https://lucide.dev/
- JWT Implementation: https://jwt.io/introduction

**NEW for Phase 3:**
- OpenAI ChatKit: https://platform.openai.com/docs/guides/chatkit
- OpenAI Domain Allowlist: https://platform.openai.com/settings/organization/security/domain-allowlist
- React Client Components: https://react.dev/reference/rsc/use-client
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

## **Migration Checklist (Phase 2 → Phase 3)**

### What to Keep (Don't Change)
✅ All existing authentication flows (login, register, JWT handling)
✅ Task API client functions in `lib/api.ts`
✅ Task components (TaskForm, TaskItem, TaskList) - keep for reference
✅ Protected route patterns (middleware, authentication checks)
✅ Tailwind styling approach
✅ TypeScript configurations

### What to Add (New for Phase 3)
➕ OpenAI ChatKit package to dependencies
➕ Chat page at `app/chat/page.tsx`
➕ Chat components in `components/chat/`
➕ Chat API client in `lib/chat-api.ts`
➕ Chat types in `lib/types.ts`
➕ NEXT_PUBLIC_OPENAI_DOMAIN_KEY environment variable
➕ Chat route protection in middleware
➕ E2E tests for chat functionality

### What to Update (Modify Existing)
🔄 Header component - add link to chat page
🔄 Navigation - include chat in menu
🔄 Environment variables - add domain key
🔄 README - document chat feature
🔄 Package.json - add ChatKit dependency

### What NOT to Change (Keep As-Is)
❌ Authentication logic (JWT handling)
❌ API client structure (same pattern for chat API)
❌ TypeScript strict mode configuration
❌ Tailwind configuration
❌ Next.js configuration (unless ChatKit requires specific settings)

---

**Current Phase:** 3 - AI Chatbot  
**Frontend Version:** 2.0.0  
**Last Updated:** 2026-02-06

This frontend implements AI-powered conversational task management using OpenAI ChatKit while maintaining secure authentication, type safety, and Next.js 16+ App Router best practices.