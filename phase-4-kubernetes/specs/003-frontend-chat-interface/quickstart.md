# Quickstart Guide: Frontend Conversational Interface

**Feature**: 002-frontend-chat-interface
**Date**: 2026-02-08
**Purpose**: Developer setup and testing instructions

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ Backend chat endpoint running at `http://localhost:8000`
- ✅ Valid user account (email/password) for testing
- ✅ JWT authentication working from Phase 2

## Installation

### 1. Install Dependencies

Navigate to the frontend directory and install the new ChatKit package:

```bash
cd frontend
npm install @openai/chatkit
```

**Expected output**:
```
added 1 package, and audited X packages in Ys
```

### 2. Configure Environment Variables

Create or update `.env.local` file in the frontend directory:

```bash
# Backend API URL (existing from Phase 2)
NEXT_PUBLIC_API_URL=http://localhost:8000

# OpenAI ChatKit Domain Key (optional for localhost)
# NEXT_PUBLIC_OPENAI_DOMAIN_KEY=dk-your-domain-key-here
```

**Note**: The domain key is **NOT required** for localhost development. Only add it when deploying to production.

### 3. Verify Backend is Running

Check that the backend chat endpoint is accessible:

```bash
curl -X POST http://localhost:8000/api/health
```

**Expected output**: `{"status": "ok"}`

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

**Expected output**:
```
▲ Next.js 16.1.6
- Local:        http://localhost:3000
- Ready in 2.3s
```

### 2. Login to Application

1. Navigate to: http://localhost:3000/login
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Login"
4. Verify redirect to dashboard or tasks page

### 3. Access Chat Interface

1. Navigate to: http://localhost:3000/chat
2. Verify chat interface loads
3. Verify conversation history displays (if any)
4. Verify input field is ready

## Testing Natural Language Commands

### Test 1: Add Task

**Input**: `add task buy groceries`

**Expected Result**:
- User message appears on right side (blue background)
- Assistant response appears on left side (gray background)
- Response text: "I've added 'Buy groceries' to your tasks."
- Tool badge shows: 🛠️ add_task
- Timestamp displayed below message

**Verification**:
```bash
# Navigate to tasks page
http://localhost:3000/tasks

# Verify "Buy groceries" appears in task list
```

### Test 2: List Tasks

**Input**: `show me all tasks`

**Expected Result**:
- Assistant lists all tasks in conversational format
- Tool badge shows: 🛠️ list_tasks
- Tasks displayed with status (pending/completed)

### Test 3: Complete Task

**Input**: `mark task 1 as done`

**Expected Result**:
- Assistant confirms task completion
- Tool badge shows: 🛠️ complete_task
- Task marked as completed in task list

### Test 4: Delete Task

**Input**: `delete task 2`

**Expected Result**:
- Assistant confirms task deletion
- Tool badge shows: 🛠️ delete_task
- Task removed from task list

### Test 5: Update Task

**Input**: `change task 1 to 'call mom tonight'`

**Expected Result**:
- Assistant confirms task update
- Tool badge shows: 🛠️ update_task
- Task title updated in task list

## Testing Edge Cases

### Test: Empty Message

**Action**: Try to send empty message

**Expected Result**:
- Send button disabled
- No API request made
- Input validation prevents submission

### Test: Very Long Message

**Action**: Type message > 1000 characters

**Expected Result**:
- Character count warning appears at 900 characters
- Input limited to 1000 characters
- User cannot type beyond limit

### Test: Network Error

**Action**: Stop backend server, send message

**Expected Result**:
- Loading indicator appears
- After timeout, error message displays
- Error message: "Failed to send message. Please try again."
- User can retry by sending another message

### Test: Authentication Expiration

**Action**: Clear localStorage, try to send message

**Expected Result**:
- 401 error detected
- Tokens cleared from localStorage
- Redirect to /login page
- User must re-authenticate

### Test: Conversation History Persistence

**Action**: Send 3 messages, refresh page

**Expected Result**:
- All 3 messages still visible after refresh
- Conversation history loaded from backend
- Messages in correct chronological order
- Timestamps preserved

## Mobile Testing

### Test on Mobile Device

1. Open browser dev tools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device (iPhone 12, Pixel 5, etc.)
4. Navigate to http://localhost:3000/chat
5. Verify:
   - Chat interface fits screen width
   - No horizontal scrolling
   - Input field accessible at bottom
   - Send button easily tappable (min 44px)
   - Messages readable on small screen
   - Smooth scrolling through history

## Component Testing

### Run Component Tests

```bash
npm run test
```

**Expected output**:
```
PASS  __tests__/components/chat/ChatInterface.test.tsx
PASS  __tests__/components/chat/MessageList.test.tsx
PASS  __tests__/components/chat/ChatInput.test.tsx
PASS  __tests__/components/chat/ToolCallIndicator.test.tsx

Test Suites: 4 passed, 4 total
Tests:       16 passed, 16 total
```

### Run E2E Tests

```bash
npm run test:e2e
```

**Expected output**:
```
Running 5 tests using 1 worker

✓ chat.spec.ts:5:1 › complete chat workflow (5s)
✓ chat.spec.ts:20:1 › add task via chat (3s)
✓ chat.spec.ts:30:1 › list tasks via chat (2s)
✓ chat.spec.ts:40:1 › complete task via chat (3s)
✓ chat.spec.ts:50:1 › delete task via chat (3s)

5 passed (16s)
```

## Troubleshooting

### Issue: ChatKit not rendering

**Symptoms**: Blank screen or error in console

**Solutions**:
1. Verify @openai/chatkit installed: `npm list @openai/chatkit`
2. Check 'use client' directive at top of ChatInterface.tsx
3. Verify no SSR errors in Next.js console
4. Clear .next cache: `rm -rf .next && npm run dev`

### Issue: 401 Unauthorized errors

**Symptoms**: All chat requests fail with 401

**Solutions**:
1. Verify JWT token in localStorage: Open dev tools → Application → Local Storage
2. Check token expiration: Decode JWT at jwt.io
3. Re-login to get fresh token
4. Verify backend JWT secret matches frontend

### Issue: Messages not persisting

**Symptoms**: Conversation history lost on refresh

**Solutions**:
1. Verify backend database connection
2. Check backend logs for errors
3. Verify conversation_id returned in response
4. Check browser console for API errors

### Issue: Tool badges not showing

**Symptoms**: No tool execution indicators

**Solutions**:
1. Verify backend returns toolCalls array in response
2. Check ToolCallIndicator component rendering logic
3. Verify toolCalls not empty array
4. Check Tailwind CSS classes applied correctly

### Issue: Mobile layout broken

**Symptoms**: Horizontal scrolling or layout issues on mobile

**Solutions**:
1. Verify Tailwind responsive classes used
2. Check max-width constraints on messages
3. Test with actual mobile device (not just emulator)
4. Verify viewport meta tag in layout.tsx

## Production Deployment

### 1. Obtain OpenAI Domain Key

**Required for production only**

1. Deploy frontend to production URL (e.g., Vercel)
2. Navigate to: https://platform.openai.com/settings/organization/security/domain-allowlist
3. Click "Add domain"
4. Enter production URL: `https://your-app.vercel.app`
5. Save and wait for approval (usually instant)
6. Copy domain key (format: `dk-xxxxxxxxxxxxx`)

### 2. Configure Production Environment

Add domain key to production environment variables:

**Vercel**:
```bash
vercel env add NEXT_PUBLIC_OPENAI_DOMAIN_KEY
# Paste domain key when prompted
```

**Other platforms**:
Add to environment variables in platform dashboard:
```
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=dk-your-actual-key
```

### 3. Deploy and Verify

1. Deploy frontend with new environment variable
2. Navigate to production chat page
3. Send test message
4. Verify no CORS errors
5. Verify ChatKit renders correctly
6. Verify all functionality works

## Performance Benchmarks

Expected performance metrics:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Chat page load | < 2 seconds | Lighthouse Performance |
| Message send/receive | < 5 seconds | Network tab timing |
| Conversation history load | < 2 seconds | Network tab timing |
| Smooth scrolling | 60 fps | Chrome DevTools Performance |
| Mobile responsiveness | 100% | Lighthouse Mobile score |

## Next Steps

After completing quickstart:

1. ✅ Verify all natural language examples work
2. ✅ Run all component tests
3. ✅ Run all E2E tests
4. ✅ Test on mobile devices
5. ✅ Review code for constitution compliance
6. ✅ Deploy to staging environment
7. ✅ Configure domain allowlist for production
8. ✅ Deploy to production

## Support

If you encounter issues not covered in troubleshooting:

1. Check backend logs for errors
2. Check browser console for frontend errors
3. Verify all prerequisites met
4. Review constitution.md for requirements
5. Consult frontend/CLAUDE.md for detailed instructions

## Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run component tests
npm run test

# Run E2E tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | Yes | - | Backend API base URL |
| NEXT_PUBLIC_OPENAI_DOMAIN_KEY | Production only | - | ChatKit domain key |

## File Checklist

Verify these files exist after implementation:

- [ ] `frontend/app/chat/page.tsx`
- [ ] `frontend/components/chat/ChatInterface.tsx`
- [ ] `frontend/components/chat/MessageList.tsx`
- [ ] `frontend/components/chat/ChatInput.tsx`
- [ ] `frontend/components/chat/ToolCallIndicator.tsx`
- [ ] `frontend/lib/chat-api.ts`
- [ ] `frontend/lib/types.ts` (updated)
- [ ] `frontend/components/Header.tsx` (updated)
- [ ] `frontend/.env.local` (updated)
- [ ] `frontend/__tests__/components/chat/ChatInterface.test.tsx`
- [ ] `frontend/__tests__/components/chat/MessageList.test.tsx`
- [ ] `frontend/__tests__/components/chat/ChatInput.test.tsx`
- [ ] `frontend/__tests__/components/chat/ToolCallIndicator.test.tsx`
- [ ] `frontend/__tests__/e2e/chat.spec.ts`
