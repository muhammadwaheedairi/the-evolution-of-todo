# Data Model: Backend AI Infrastructure

## Entity: Conversation

### Fields
- **id**: integer (primary key, auto-increment)
- **user_id**: UUID (foreign key to users.id, indexed)
- **created_at**: datetime (timestamp, default: now)
- **updated_at**: datetime (timestamp, default: now, updates on change)

### Relationships
- **Owner**: Many-to-One relationship with User model
- **Messages**: One-to-Many relationship with Message model (conversation.messages)

### Constraints
- user_id must reference a valid user
- All queries must filter by user_id for data isolation
- Created and updated timestamps automatically managed

## Entity: Message

### Fields
- **id**: integer (primary key, auto-increment)
- **user_id**: UUID (foreign key to users.id, indexed)
- **conversation_id**: integer (foreign key to conversations.id, indexed)
- **role**: string (enum: "user" | "assistant")
- **content**: text (message content, max 10000 characters)
- **created_at**: datetime (timestamp, default: now)

### Relationships
- **Conversation**: Many-to-One relationship with Conversation model
- **User**: Many-to-One relationship with User model

### Constraints
- user_id must reference a valid user
- conversation_id must reference a valid conversation
- role must be either "user" or "assistant"
- All queries must filter by user_id for data isolation
- Created timestamp automatically managed

## Validation Rules

### Conversation Validation
- user_id is required and must be a valid UUID
- Both created_at and updated_at are automatically managed by the system
- All operations must verify user_id matches authenticated user

### Message Validation
- user_id is required and must be a valid UUID
- conversation_id is required and must reference existing conversation
- role is required and must be one of "user" or "assistant"
- content is required and must be between 1 and 10000 characters
- created_at is automatically managed by the system

## State Transitions

### Conversation States
- New conversation created when user initiates chat without conversation_id
- Conversation remains active as long as user continues chatting
- Conversation implicitly archived after period of inactivity (handled by cleanup job)

### Message States
- Messages are immutable once created
- Each message has a fixed role ("user" or "assistant") that cannot be changed
- Messages are ordered by created_at timestamp for chronological display

## Indexes

### Required Indexes
- conversations.user_id: For efficient user-based queries and isolation
- messages.conversation_id: For efficient conversation history retrieval
- messages.user_id: For user-based queries and isolation
- messages.created_at: For chronological ordering of messages

## Sample SQL

```sql
-- Create conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```