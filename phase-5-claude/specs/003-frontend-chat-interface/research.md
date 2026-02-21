# Research: Frontend Conversational Interface

**Feature**: 002-frontend-chat-interface
**Date**: 2026-02-08
**Purpose**: Technical research to resolve implementation unknowns and establish best practices

## 1. OpenAI ChatKit Integration Patterns

### Decision: Use OpenAI ChatKit as Client Component with Custom Backend Integration

**Research Findings**:
- ChatKit is designed for conversational interfaces with custom backends
- Requires 'use client' directive in Next.js due to interactivity requirements
- Domain allowlist configuration is mandatory for production deployments
- Localhost development works without domain key

**Integration Pattern**:
```typescript
'use client'
import { ChatKit } from '@openai/chatkit'

export function ChatInterface() {
  const handleMessage = async (message: string) => {
    // Call custom backend endpoint
    const response = await sendChatMessage(userId, { message })
    return response
  }

  return (
    <ChatKit
      endpoint={handleMessage}
      domainKey={process.env.NEXT_PUBLIC_OPENAI_DOMAIN_KEY}
      placeholder="Try: add task buy groceries"
    />
  )
}
```

**Domain Allowlist Configuration**:
1. Deploy frontend to production URL
2. Navigate to: https://platform.openai.com/settings/organization/security/domain-allowlist
3. Add production domain (e.g., https://your-app.vercel.app)
4. Obtain domain key (format: dk-xxxxx)
5. Add to environment: NEXT_PUBLIC_OPENAI_DOMAIN_KEY=dk-xxxxx
6. Redeploy with new environment variable

**Rationale**: ChatKit provides pre-built conversational UI components that handle message display, input, and styling. Using it reduces development time and ensures consistent chat UX patterns.

**Alternatives Considered**:
- Build custom chat UI from scratch: Rejected due to increased development time and need to reinvent common patterns
- Use other chat libraries (react-chat-elements, stream-chat-react): Rejected because ChatKit is specifically designed for AI agent interactions and integrates well with OpenAI ecosystem

**References**:
- OpenAI ChatKit Documentation: https://platform.openai.com/docs/guides/chatkit
- Domain Allowlist Guide: https://platform.openai.com/settings/organization/security/domain-allowlist

---

## 2. Next.js 16 Client Component Best Practices

### Decision: Use Server Components by Default, Client Components Only for Interactivity

**Research Findings**:
- Next.js 16 App Router defaults to Server Components
- Client Components require explicit 'use client' directive at top of file
- Server Components cannot use hooks (useState, useEffect, etc.)
- Client Components can import and use Server Components as children
- Authentication checks can be done in Server Components before rendering

**When to Use Client Components**:
- Interactive elements (onClick, onChange handlers)
- React hooks (useState, useEffect, useContext)
- Browser-only APIs (localStorage, window)
- Third-party libraries requiring client-side rendering (ChatKit)

**Pattern for Chat Page**:
```typescript
// app/chat/page.tsx (Server Component - default)
import { redirect } from 'next/navigation'
import { ChatInterface } from '@/components/chat/ChatInterface'

export default async function ChatPage() {
  // Server-side authentication check
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect('/login')
  }

  return (
    <div className="container">
      <ChatInterface /> {/* Client Component */}
    </div>
  )
}
```

```typescript
// components/chat/ChatInterface.tsx (Client Component)
'use client'
import { useState, useEffect } from 'react'

export function ChatInterface() {
  const [messages, setMessages] = useState([])
  // ... interactive logic
}
```

**Rationale**: Server Components improve performance by reducing JavaScript bundle size. Only components requiring interactivity should be Client Components.

**Alternatives Considered**:
- Make entire page a Client Component: Rejected due to larger bundle size and loss of server-side rendering benefits
- Use Pages Router instead of App Router: Rejected because constitution mandates App Router

**References**:
- Next.js 16 App Router: https://nextjs.org/docs/app
- React Server Components: https://react.dev/reference/rsc/server-components

---

## 3. Chat UI/UX Patterns

### Decision: Implement Standard Chat Interface with Visual Distinction and Auto-Scroll

**Research Findings**:
- User messages should be right-aligned with distinct color (blue)
- Assistant messages should be left-aligned with distinct color (gray)
- Timestamps should be displayed for all messages (small, muted text)
- Loading indicators should show during async operations
- Auto-scroll to latest message on new message arrival
- Empty state should provide example commands

**Message Display Pattern**:
```typescript
// User message styling
<div className="flex justify-end mb-4">
  <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-[80%]">
    <p>{message.content}</p>
    <span className="text-xs text-blue-100">{timestamp}</span>
  </div>
</div>

// Assistant message styling
<div className="flex justify-start mb-4">
  <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2 max-w-[80%]">
    <p>{message.content}</p>
    <span className="text-xs text-gray-500">{timestamp}</span>
    {toolCalls && <ToolCallIndicator tools={toolCalls} />}
  </div>
</div>
```

**Auto-Scroll Implementation**:
```typescript
const messagesEndRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [messages])
```

**Mobile Responsiveness**:
- Use flexbox for layout
- Max width 80% for messages (prevents full-width bubbles)
- Touch-friendly tap targets (min 44px height)
- Fixed input at bottom with proper keyboard handling

**Rationale**: These patterns are industry-standard for chat interfaces and provide clear visual hierarchy between user and assistant messages.

**Alternatives Considered**:
- Single-column layout without alignment distinction: Rejected due to poor visual clarity
- Avatars for user/assistant: Rejected as unnecessary for this use case
- Inline timestamps: Rejected in favor of below-message placement for cleaner look

**References**:
- Chat UI Best Practices: Industry standard patterns from WhatsApp, Slack, iMessage
- Mobile Touch Targets: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_WCAG/Pointer_gestures

---

## 4. JWT Authentication in Chat Context

### Decision: Reuse Existing JWT Authentication Pattern with 401 Error Handling

**Research Findings**:
- JWT tokens stored in localStorage (existing Phase 2 pattern)
- All API requests include Authorization: Bearer <token> header
- 401 responses should clear tokens and redirect to login
- Token expiration during chat session requires graceful handling
- No token refresh mechanism needed (user re-authenticates on expiration)

**Authentication Pattern for Chat API**:
```typescript
// lib/chat-api.ts
export async function sendChatMessage(
  userId: string,
  request: ChatRequest
): Promise<ChatResponse> {
  const token = getToken() // From existing lib/api.ts

  if (!token) {
    clearAuthTokens()
    window.location.href = '/login'
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${API_URL}/api/${userId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(request)
  })

  if (response.status === 401) {
    clearAuthTokens()
    window.location.href = '/login'
    throw new Error('Authentication expired')
  }

  if (!response.ok) {
    throw new Error('Failed to send message')
  }

  return response.json()
}
```

**Token Expiration Handling**:
- Display user-friendly error message before redirect
- Clear all auth tokens from localStorage
- Redirect to login page with return URL
- User re-authenticates and returns to chat

**Rationale**: Reusing existing authentication pattern maintains consistency and avoids introducing new authentication mechanisms.

**Alternatives Considered**:
- Implement token refresh: Rejected as not required by constitution and adds complexity
- Use httpOnly cookies: Rejected because existing system uses localStorage
- Silent token refresh: Rejected due to added complexity and security considerations

**References**:
- JWT Best Practices: https://jwt.io/introduction
- Existing implementation: frontend/lib/api.ts

---

## 5. Testing Strategies for Chat Interfaces

### Decision: Multi-Layer Testing with Component Tests, Integration Tests, and E2E Tests

**Research Findings**:
- Component tests should mock ChatKit and API calls
- Integration tests should verify API client behavior
- E2E tests should test complete user workflows
- Natural language scenarios should be tested end-to-end

**Component Testing Pattern** (Jest + React Testing Library):
```typescript
// __tests__/components/chat/ChatInterface.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChatInterface } from '@/components/chat/ChatInterface'

// Mock ChatKit
jest.mock('@openai/chatkit', () => ({
  ChatKit: ({ endpoint, placeholder }: any) => (
    <div data-testid="chatkit-mock">
      <input placeholder={placeholder} />
      <button onClick={() => endpoint('test message')}>Send</button>
    </div>
  )
}))

// Mock API client
jest.mock('@/lib/chat-api', () => ({
  sendChatMessage: jest.fn().mockResolvedValue({
    conversationId: 1,
    response: 'Task added successfully',
    toolCalls: ['add_task']
  })
}))

test('sends message and displays response', async () => {
  render(<ChatInterface />)

  const input = screen.getByPlaceholderText(/add task/i)
  const sendButton = screen.getByText('Send')

  fireEvent.change(input, { target: { value: 'add task buy milk' } })
  fireEvent.click(sendButton)

  await waitFor(() => {
    expect(screen.getByText('Task added successfully')).toBeInTheDocument()
  })
})
```

**E2E Testing Pattern** (Playwright):
```typescript
// __tests__/e2e/chat.spec.ts
import { test, expect } from '@playwright/test'

test('complete chat workflow', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  // Navigate to chat
  await page.goto('/chat')

  // Send message
  await page.fill('[placeholder*="add task"]', 'add task buy groceries')
  await page.press('[placeholder*="add task"]', 'Enter')

  // Verify response
  await expect(page.locator('text=added')).toBeVisible()

  // Verify task created
  await page.goto('/tasks')
  await expect(page.locator('text=buy groceries')).toBeVisible()
})
```

**Test Coverage Requirements**:
- Component tests: All 4 chat components (ChatInterface, MessageList, ChatInput, ToolCallIndicator)
- Integration tests: Chat API client functions
- E2E tests: All 5 natural language operations (add, list, complete, delete, update)
- Edge case tests: Empty messages, network errors, authentication failures

**Rationale**: Multi-layer testing ensures both unit-level correctness and end-to-end functionality.

**Alternatives Considered**:
- Only E2E tests: Rejected due to slow execution and difficulty debugging failures
- Only component tests: Rejected because they don't verify real API integration
- Manual testing only: Rejected due to lack of regression protection

**References**:
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro
- Playwright: https://playwright.dev/

---

## Summary of Technical Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Chat UI Library | OpenAI ChatKit | Pre-built conversational UI, AI-focused design |
| Component Type | Client Component for ChatKit | Requires interactivity and React hooks |
| Message Layout | Right-aligned (user), Left-aligned (assistant) | Industry standard, clear visual distinction |
| Authentication | Reuse existing JWT pattern | Consistency with Phase 2, no new mechanisms |
| Token Expiration | Clear tokens and redirect to login | Simple, secure, no refresh complexity |
| Testing Strategy | Multi-layer (component + integration + E2E) | Comprehensive coverage, fast feedback |
| Auto-scroll | useRef + scrollIntoView on message change | Standard React pattern, smooth UX |
| Domain Key | Environment variable (optional for localhost) | Secure, configurable per environment |

## Open Questions Resolved

All technical unknowns from the plan have been resolved:
- ✅ ChatKit integration pattern defined
- ✅ Client Component usage clarified
- ✅ Chat UI/UX patterns established
- ✅ Authentication approach confirmed
- ✅ Testing strategy defined

## Next Steps

Proceed to Phase 1: Design & Contracts
- Create data-model.md with TypeScript interfaces
- Create contracts/chat-api.yaml with OpenAPI spec
- Create quickstart.md with setup instructions
- Update agent context with new technologies
