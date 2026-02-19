# 🎨 TaskFlow AI - Frontend Documentation

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.19-38B2AC?style=flat-square&logo=tailwind-css)

**Modern Next.js 16 frontend with AI-powered chat interface**

</div>

---

## 📋 Overview

Modern, responsive web app built with Next.js 16 App Router featuring task management UI and AI-powered conversational interface via OpenAI ChatKit.

### Key Features
- ✅ **Next.js 16 App Router** - React Server Components architecture
- 🔐 **Custom JWT Auth** - localStorage + cookies
- 💬 **OpenAI ChatKit** - Conversational AI interface (Phase 3)
- 📱 **Fully Responsive** - Mobile-first design
- ⚡ **TypeScript Strict Mode** - Type-safe development
- 🎯 **React Hook Form + Zod** - Form validation

---

## 🏗️ Architecture

### Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js | 16.1.6 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.0+ |
| Styling | Tailwind CSS | 3.4.19 |
| Forms | React Hook Form | Latest |
| Validation | Zod | Latest |
| Chat UI | @openai/chatkit | 1.5.0 |
| Icons | Lucide React | Latest |

### Project Structure
```
frontend/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   ├── globals.css
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── tasks/page.tsx           # Task dashboard
│   └── chat/page.tsx            # AI Chat (Phase 3)
├── components/
│   ├── Header.tsx
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── TaskForm.tsx
│   ├── TaskItem.tsx
│   ├── TaskList.tsx
│   ├── EmptyState.tsx
│   └── chat/
│       ├── ChatInterface.tsx
│       ├── MessageList.tsx
│       ├── ChatInput.tsx
│       └── ToolCallIndicator.tsx
├── lib/
│   ├── api.ts
│   ├── chat-api.ts
│   └── types.ts
├── .env.local
├── next.config.ts
└── tailwind.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend API running

### Installation
```bash
cd frontend
npm install
```

### Environment Configuration

Create `.env.local`:
```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional (Phase 3 - production only)
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=dk-xxxxx
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Lint with ESLint |

---

## 📱 Pages & Routes

| Route | Auth Required | Description |
|-------|--------------|-------------|
| `/` | No | Landing/marketing page |
| `/login` | No | User login |
| `/register` | No | User registration |
| `/tasks` | Yes | Task management dashboard |
| `/chat` | Yes | AI chat interface (Phase 3) |

---

## 🔌 API Client

### `lib/api.ts` — Auth Functions

| Function | Purpose |
|----------|---------|
| `getToken()` | Retrieve JWT token |
| `setToken()` | Store auth tokens |
| `removeToken()` | Clear tokens |
| `isAuthenticated()` | Check auth status |

### `lib/api.ts` — Task Functions

| Function | Purpose |
|----------|---------|
| `register()` | Register new user |
| `login()` | Authenticate user |
| `getTasks()` | Fetch all tasks |
| `createTask()` | Create task |
| `updateTask()` | Update task |
| `toggleTaskComplete()` | Toggle completion |
| `deleteTask()` | Delete task |

### `lib/chat-api.ts` — Chat Functions (Phase 3)

| Function | Purpose |
|----------|---------|
| `sendChatMessage()` | Send message to AI |
| `getConversationHistory()` | Fetch history |
| `clearConversationHistory()` | Clear messages |

---

## 🔐 Authentication Flow

1. **Register** → credentials sent → account created → redirect to login
2. **Login** → credentials validated → JWT returned → stored in localStorage + cookies → redirect to `/tasks`
3. **Requests** → token in `Authorization: Bearer <token>` header
4. **Logout** → localStorage + cookies cleared → redirect to login
5. **Token**: 7-day expiry, auto-logout on 401, cross-tab sync via storage events

---

## 💬 Chat Interface (Phase 3)

### Natural Language Capabilities

| Input | Action |
|-------|--------|
| "add task buy groceries" | Creates task |
| "show me all tasks" | Lists tasks |
| "what's pending?" | Filters pending |
| "mark task 3 as done" | Completes task |
| "delete the meeting task" | Deletes task |

### Production Setup
1. Deploy frontend → add domain to OpenAI allowlist → get domain key
2. Set `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` → redeploy
> Localhost works without domain key.

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot connect to backend | Check `NEXT_PUBLIC_API_URL` and backend port |
| 401 Unauthorized | Clear localStorage, re-login |
| ChatKit CORS errors | Add domain to OpenAI allowlist, set domain key |
| Hydration errors | Add `'use client'` to components using hooks |

---

## 🔗 Related Documentation

- **[Root README](../README.md)** - Project overview
- **[Backend README](../backend/README.md)** - API documentation

---

<div align="center">

**Built with Next.js 16 and React 19**

</div>