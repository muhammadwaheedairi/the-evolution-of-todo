# Data Model: Frontend Conversational Interface

**Feature**: 002-frontend-chat-interface
**Date**: 2026-02-08
**Purpose**: Define frontend data structures and component architecture

## TypeScript Interfaces

### Core Data Types

#### Message Interface
```typescript
export interface Message {
  id: string;                    // Unique message identifier
  role: 'user' | 'assistant';    // Message sender type
  content: string;               // Message text content
  timestamp: Date;               // When message was created
  toolCalls?: string[];          // Optional: Tools executed by assistant
}
```

**Usage**: Represents a single message in the conversation history. Used by MessageList component to render individual messages.

**Validation Rules**:
- `id`: Must be unique within conversation
- `role`: Must be either 'user' or 'assistant'
- `content`: Cannot be empty string
- `timestamp`: Must be valid Date object
- `toolCalls`: Optional array, only present for assistant messages

---

#### Conversation Interface
```typescript
export interface Conversation {
  id: number;                    // Backend-assigned conversation ID
  userId: string;                // User who owns this conversation
  messages: Message[];           // Array of messages in chronological order
  createdAt: Date;               // When conversation was created
  updatedAt: Date;               // Last message timestamp
}
```

**Usage**: Represents a complete conversation session. Used for loading conversation history from backend.

**Validation Rules**:
- `id`: Positive integer assigned by backend
- `userId`: Must match authenticated user's ID
- `messages`: Array ordered by timestamp (oldest first)
- `createdAt`: Must be valid Date object
- `updatedAt`: Must be >= createdAt

---

#### ChatRequest Interface
```typescript
export interface ChatRequest {
  conversationId?: number;       // Optional: Existing conversation ID
  message: string;               // User's message text
}
```

**Usage**: Request payload sent to backend chat endpoint. Used by chat API client.

**Validation Rules**:
- `conversationId`: Optional, omit for new conversations
- `message`: Required, must be non-empty after trimming
- `message`: Maximum length 1000 characters

---

#### ChatResponse Interface
```typescript
export interface ChatResponse {
  conversationId: number;        // Conversation ID (new or existing)
  response: string;              // Assistant's response text
  toolCalls: string[];           // Array of tool names executed
}
```

**Usage**: Response payload from backend chat endpoint. Used by chat API client.

**Validation Rules**:
- `conversationId`: Positive integer
- `response`: Non-empty string
- `toolCalls`: Array of tool names (can be empty)

---

### Component State Types

#### ChatState Interface
```typescript
export interface ChatState {
  conversationId: number | null; // Current conversation ID (null for new)
  messages: Message[];           // Current conversation messages
  isLoading: boolean;            // True while waiting for response
  error: string | null;          // Error message if request failed
}
```

**Usage**: Internal state for ChatInterface component. Manages conversation state and UI feedback.

**State Transitions**:
- Initial: `{ conversationId: null, messages: [], isLoading: false, error: null }`
- Sending: `{ ..., isLoading: true, error: null }`
- Success: `{ conversationId: X, messages: [...], isLoading: false, error: null }`
- Error: `{ ..., isLoading: false, error: "Error message" }`

---

#### MessageListProps Interface
```typescript
export interface MessageListProps {
  messages: Message[];           // Messages to display
  isLoading: boolean;            // Show loading indicator
}
```

**Usage**: Props for MessageList component.

---

#### ChatInputProps Interface
```typescript
export interface ChatInputProps {
  onSendMessage: (message: string) => void;  // Callback when message sent
  disabled: boolean;                          // Disable input during loading
  placeholder?: string;                       // Input placeholder text
}
```

**Usage**: Props for ChatInput component.

---

#### ToolCallIndicatorProps Interface
```typescript
export interface ToolCallIndicatorProps {
  toolCalls: string[];           // Array of tool names to display
}
```

**Usage**: Props for ToolCallIndicator component.

---

## Component Architecture

### Component Hierarchy

```
ChatPage (Server Component)
└── ChatInterface (Client Component)
    ├── MessageList
    │   ├── Message (user)
    │   │   └── timestamp
    │   └── Message (assistant)
    │       ├── timestamp
    │       └── ToolCallIndicator
    └── ChatInput
        ├── textarea
        └── send button
```

### Component Responsibilities

#### ChatInterface Component
**Type**: Client Component (`'use client'`)
**File**: `components/chat/ChatInterface.tsx`

**Responsibilities**:
- Manage conversation state (conversationId, messages, loading, error)
- Fetch conversation history on mount
- Handle message sending via chat API
- Integrate OpenAI ChatKit
- Handle authentication errors (401 redirect)
- Provide loading and error feedback

**State Management**:
```typescript
const [conversationId, setConversationId] = useState<number | null>(null)
const [messages, setMessages] = useState<Message[]>([])
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
```

**Key Methods**:
- `loadConversationHistory()`: Fetch history from backend on mount
- `handleSendMessage(message: string)`: Send message to backend, update state
- `handleError(error: Error)`: Display user-friendly error message

---

#### MessageList Component
**Type**: Client Component (uses useRef for auto-scroll)
**File**: `components/chat/MessageList.tsx`

**Responsibilities**:
- Display array of messages in chronological order
- Distinguish user vs assistant messages visually
- Show timestamps for all messages
- Render tool call indicators for assistant messages
- Auto-scroll to latest message
- Show empty state when no messages
- Show loading indicator when waiting for response

**Key Features**:
- Auto-scroll using `useRef` and `scrollIntoView`
- Conditional rendering based on message role
- Empty state with example commands
- Loading skeleton/spinner

---

#### ChatInput Component
**Type**: Client Component (uses useState for input value)
**File**: `components/chat/ChatInput.tsx`

**Responsibilities**:
- Provide textarea for message input
- Validate input (non-empty, max length)
- Handle Enter key to send (Shift+Enter for new line)
- Disable input during loading
- Show character count if approaching limit
- Clear input after successful send

**State Management**:
```typescript
const [inputValue, setInputValue] = useState('')
```

**Validation**:
- Prevent sending empty messages (after trim)
- Enforce maximum length (1000 characters)
- Show warning at 900 characters

---

#### ToolCallIndicator Component
**Type**: Client Component (simple presentational)
**File**: `components/chat/ToolCallIndicator.tsx`

**Responsibilities**:
- Display badges for executed tools
- Conditional rendering (only if toolCalls array not empty)
- Style with Tailwind CSS
- Show tool icon (🛠️) and tool name

**Rendering Logic**:
```typescript
if (!toolCalls || toolCalls.length === 0) return null

return (
  <div className="flex gap-2 mt-2">
    {toolCalls.map(tool => (
      <span key={tool} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
        🛠️ {tool}
      </span>
    ))}
  </div>
)
```

---

## Data Flow

### Message Sending Flow

1. User types message in ChatInput
2. User presses Enter or clicks Send button
3. ChatInput validates input and calls `onSendMessage(message)`
4. ChatInterface receives message, sets `isLoading = true`
5. ChatInterface calls `sendChatMessage(userId, { conversationId, message })`
6. API client sends POST request to backend with JWT token
7. Backend processes message, calls AI agent, executes tools
8. Backend returns `{ conversationId, response, toolCalls }`
9. ChatInterface updates state:
   - Add user message to messages array
   - Add assistant response to messages array
   - Update conversationId if new
   - Set `isLoading = false`
10. MessageList re-renders with new messages
11. Auto-scroll to latest message

### Error Handling Flow

1. API request fails (network error, 401, 500, etc.)
2. API client throws error
3. ChatInterface catches error in try-catch
4. If 401: Clear tokens, redirect to /login
5. If other error: Set `error` state with user-friendly message
6. Display error message in UI
7. User can retry by sending another message

### Conversation History Loading Flow

1. ChatPage (Server Component) checks authentication
2. If authenticated, renders ChatInterface
3. ChatInterface mounts, calls `useEffect` hook
4. Effect calls `getConversationHistory(userId)`
5. API client fetches conversation history from backend
6. Backend returns array of messages
7. ChatInterface sets `messages` state
8. MessageList renders conversation history
9. Auto-scroll to latest message

---

## Type Definitions File Structure

**File**: `frontend/lib/types.ts`

```typescript
// ============================================
// Chat Types (Phase 3)
// ============================================

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: string[];
}

export interface Conversation {
  id: number;
  userId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatRequest {
  conversationId?: number;
  message: string;
}

export interface ChatResponse {
  conversationId: number;
  response: string;
  toolCalls: string[];
}

export interface ChatState {
  conversationId: number | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

// Component Props Types
export interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export interface ToolCallIndicatorProps {
  toolCalls: string[];
}

// ============================================
// Existing Task Types (Phase 2) - Keep unchanged
// ============================================
// ... existing types ...
```

---

## Validation Rules Summary

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| Message.id | string | Yes | Unique within conversation |
| Message.role | 'user' \| 'assistant' | Yes | Enum value only |
| Message.content | string | Yes | Non-empty |
| Message.timestamp | Date | Yes | Valid date |
| Message.toolCalls | string[] | No | Only for assistant messages |
| ChatRequest.message | string | Yes | 1-1000 characters, trimmed |
| ChatRequest.conversationId | number | No | Positive integer if provided |
| ChatResponse.conversationId | number | Yes | Positive integer |
| ChatResponse.response | string | Yes | Non-empty |
| ChatResponse.toolCalls | string[] | Yes | Can be empty array |

---

## State Management Strategy

**Approach**: Local component state with useState hooks

**Rationale**:
- Chat state is isolated to chat page (no global state needed)
- Simple state management without external libraries
- Follows React best practices for component state
- No need for Redux/Zustand for this feature

**State Location**:
- ChatInterface: Conversation state (conversationId, messages, loading, error)
- ChatInput: Input value state
- MessageList: Scroll ref (not state)

**State Persistence**:
- No frontend persistence (conversation history in backend database)
- JWT token in localStorage (existing pattern)
- Conversation history fetched on page load

---

## Performance Considerations

**Message Rendering**:
- Use React key prop with message.id for efficient re-renders
- Avoid re-rendering entire list on new message (React optimization)

**Auto-Scroll**:
- Use `scrollIntoView({ behavior: 'smooth' })` for smooth UX
- Only trigger on new messages (useEffect dependency)

**Large Conversation History**:
- Initial implementation: Render all messages
- Future optimization: Virtual scrolling if needed (50+ messages)
- Backend pagination if conversation exceeds 100 messages

**API Calls**:
- Debounce not needed (user explicitly sends messages)
- No polling (stateless request/response)
- Error retry handled by user (send another message)

---

## Next Steps

1. Create API contracts (contracts/chat-api.yaml)
2. Create quickstart guide (quickstart.md)
3. Update agent context with new types and patterns
