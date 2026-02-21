# Frontend - Next.js 16 AI-Powered Todo Application

Modern, responsive Next.js 16 frontend with AI chat interface and advanced task management.

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19.2.3
- **Styling**: Tailwind CSS 3.4.19
- **Animations**: Framer Motion 12.34.1
- **Forms**: React Hook Form 7.71.1 + Zod 4.3.6
- **AI Chat**: OpenAI ChatKit 1.5.0
- **Real-time**: Socket.IO Client 4.8.3
- **Icons**: Lucide React 0.563.0

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   ├── login/page.tsx           # Login
│   ├── register/page.tsx        # Registration
│   ├── chat/page.tsx            # AI chat interface
│   └── tasks/page.tsx           # Task dashboard
├── components/
│   ├── Header.tsx               # Navigation
│   ├── Footer.tsx               # Footer
│   ├── LoginForm.tsx            # Login form
│   ├── RegisterForm.tsx         # Registration form
│   ├── chat/
│   │   ├── ChatInterface.tsx   # Main chat component
│   │   ├── MessageList.tsx     # Message history
│   │   └── ChatInput.tsx       # Input field
│   └── tasks/
│       ├── TaskFilters.tsx     # Filter/search/sort
│       ├── TaskList.tsx        # Task list
│       ├── TaskItem.tsx        # Task card
│       ├── TaskForm.tsx        # Create/edit form
│       └── KanbanBoard.tsx     # Kanban view
├── lib/
│   ├── api.ts                   # REST API client
│   ├── chat-api.ts              # Chat API client
│   ├── types.ts                 # TypeScript types
│   └── useNotifications.ts      # WebSocket hook
└── Dockerfile                    # Multi-stage build
```

## Key Features

### AI Chat Interface
- Natural language task management
- Conversational UI with user/assistant messages
- Tool execution indicators
- Persistent conversation history
- Real-time responses with loading states

### Advanced Task Management
- **Priority Levels**: High (🔴), Medium (🟡), Low (🟢)
- **Tags**: Multi-tag support with JSON storage
- **Due Dates**: Calendar picker with natural language
- **Recurring Tasks**: Daily, weekly, monthly patterns
- **Search**: Full-text search in titles/descriptions
- **Filters**: Status, priority, tags, due date range
- **Sorting**: Created date, due date, priority, title (asc/desc)

### Real-time Notifications
- WebSocket integration via Socket.IO
- Browser notifications for task updates
- Audio alerts on events
- Toast notifications with icons

## API Integration

### Authentication (lib/api.ts)
```typescript
// JWT stored in localStorage + cookies
setToken(token: string)
getToken(): string | null
removeToken()
isAuthenticated(): boolean

// Endpoints
register(data: RegisterRequest)   // POST /api/auth/register
login(data: LoginRequest)         // POST /api/auth/login
logout()                          // Clear tokens + redirect
```

### Task Management (lib/api.ts)
```typescript
listTasks(params?: {
  status?: 'all' | 'pending' | 'completed',
  priority?: 'high' | 'medium' | 'low',
  search?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
})

createTask(data: TaskCreateRequest)
getTask(taskId: number)
updateTask(taskId, data)
toggleTaskCompletion(taskId, bool)
deleteTask(taskId)
```

### Chat Interface (lib/chat-api.ts)
```typescript
sendChatMessage(userId, request: {
  message: string
}): Promise<{
  conversation_id: string,
  response: string,
  tool_calls: string[]
}>

getConversationHistory(userId): Promise<Message[]>
```

## Component Architecture

### ChatInterface (Client Component)
**State**:
- `conversationId`: Current conversation ID
- `messages`: User/assistant message array
- `isLoading`: API call in progress
- `error`: Error message

**Flow**:
1. Mount → Load history from backend
2. User sends message → Add to array
3. Call backend with JWT auth
4. Receive AI response → Add to array
5. Display tool execution badges

### TaskFilters (Client Component)
**Filter State**:
```typescript
{
  status: 'all' | 'pending' | 'completed',
  priority?: 'high' | 'medium' | 'low',
  tags: string[],
  due_date_start: string | null,
  due_date_end: string | null,
  sortBy: 'created_at' | 'due_date' | 'priority' | 'title',
  sortOrder: 'asc' | 'desc',
  search?: string
}
```

**Features**:
- Real-time filtering (no submit button)
- Active filter count badge
- Reset all filters
- Mobile-responsive (collapsible)

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://taskflow.local
NEXT_PUBLIC_WS_URL=http://taskflow.local
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=dk-...  # Production only
```

## Authentication Flow

1. **Register/Login** → Backend returns JWT
2. **Store Token** → localStorage + httpOnly cookie
3. **API Requests** → `Authorization: Bearer <token>`
4. **Token Validation** → Backend verifies JWT
5. **User Isolation** → Backend filters by user_id
6. **Token Expiry** → 401 → Clear tokens → Redirect

## Natural Language Examples

| User Input | AI Action | Tool |
|------------|-----------|------|
| "add task buy groceries" | Creates task | `add_task` |
| "show me all tasks" | Lists tasks | `list_tasks` |
| "mark task 3 as done" | Completes task | `complete_task` |
| "add high priority task buy milk due tomorrow" | Creates with priority + due date | `add_task` |
| "show me high priority tasks" | Filters by priority | `list_tasks` |
| "create recurring standup every weekday" | Creates recurring task | `add_task` |

## Docker Deployment

### Multi-Stage Build
```dockerfile
# Stage 1: Builder (node:20-alpine)
- Install dependencies (npm ci)
- Build Next.js (npm run build)
- Generate standalone output

# Stage 2: Runner (node:20-alpine)
- Copy standalone build
- Non-root user (nextjs:1001)
- Expose port 3000
- Health check on /
- Start: node server.js
```

### Build & Run
```bash
# Build
docker build -t taskflow-frontend:latest .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://taskflow.local \
  taskflow-frontend:latest
```

## Development

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
```

## Styling

**Tailwind Classes**:
- Primary: `indigo-600`, `purple-600`
- Success: `green-500`, `emerald-600`
- Warning: `yellow-500`, `amber-600`
- Error: `red-500`, `rose-600`
- Priority High: `bg-red-100 text-red-700`
- Priority Medium: `bg-yellow-100 text-yellow-700`
- Priority Low: `bg-green-100 text-green-700`

**Animations**: Framer Motion for transitions, hover effects, loading spinners

## Performance

1. **Server Components**: Default for static content
2. **Client Components**: Only for interactivity
3. **Code Splitting**: Automatic route-based
4. **Lazy Loading**: Dynamic imports
5. **Caching**: API responses cached

## Security

1. **JWT Authentication**: All API calls require token
2. **CSRF Protection**: SameSite cookies
3. **XSS Prevention**: React auto-escapes
4. **Input Validation**: Zod schemas
5. **User Isolation**: Backend enforces filtering

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Screen reader friendly

---

**Version**: 3.0.0
**Last Updated**: 2026-02-21
