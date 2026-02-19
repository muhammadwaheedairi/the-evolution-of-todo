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
| Chat UI | @openai/chatkit | 1.5.0 |
| Forms | React Hook Form | Latest |
| Validation | Zod | Latest |

### Project Structure
```
frontend/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx
│   ├── globals.css
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── tasks/page.tsx
│   └── chat/page.tsx            # Phase 3
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
└── .env.local
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend API running

### Installation & Setup
```bash
cd frontend
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=dk-xxxxx  # Optional, Phase 3 production only
```
```bash
npm run dev  # http://localhost:3000
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

| Route | Auth | Description |
|-------|------|-------------|
| `/` | No | Landing page |
| `/login` | No | User login |
| `/register` | No | Registration |
| `/tasks` | Yes | Task dashboard (CRUD + filters) |
| `/chat` | Yes | AI chat interface (Phase 3) |

---

## 🔌 API Client

### `lib/api.ts` — Auth

| Function | Purpose |
|----------|---------|
| `getToken()` | Retrieve JWT token |
| `setToken()` | Store tokens |
| `removeToken()` | Clear tokens |
| `isAuthenticated()` | Check auth status |

### `lib/api.ts` — Tasks

| Function | Purpose |
|----------|---------|
| `register()` / `login()` | Auth endpoints |
| `getTasks()` | Fetch all tasks |
| `createTask()` | Create task |
| `updateTask()` | Update task |
| `toggleTaskComplete()` | Toggle completion |
| `deleteTask()` | Delete task |

### `lib/chat-api.ts` — Chat (Phase 3)

| Function | Purpose |
|----------|---------|
| `sendChatMessage()` | Send message to AI |
| `getConversationHistory()` | Fetch history |
| `clearConversationHistory()` | Clear messages |

---

## 🔐 Authentication Flow

1. **Register** → credentials validated → account created → redirect to login
2. **Login** → JWT returned → stored in localStorage + cookies → redirect to `/tasks`
3. **Requests** → `Authorization: Bearer <token>` header on all API calls
4. **Logout** → storage cleared → redirect to login
5. Token expires in 7 days; auto-logout on 401; cross-tab sync via storage events

---

## 🐳 Docker & Kubernetes (Phase 4)

### Docker
```bash
eval $(minikube docker-env)
docker build -t todo-frontend:latest .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8000 todo-frontend:latest
```

### Kubernetes Deployment
```bash
minikube start --cpus=4 --memory=8192
kubectl create namespace todo-app
helm install todo-app ./helm --namespace todo-app --values ./helm/values-dev.yaml
minikube service frontend-service -n todo-app
```

**Helm values (dev):**
```yaml
frontend:
  image: todo-frontend
  tag: latest
  imagePullPolicy: Never
  replicas: 1
  service:
    type: NodePort
    nodePort: 30000
  resources:
    requests: { memory: "128Mi", cpu: "100m" }
    limits: { memory: "256Mi", cpu: "250m" }
```

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

**Production setup:** Add domain to OpenAI allowlist → set `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` → redeploy. Localhost works without a key.

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot connect to backend | Check `NEXT_PUBLIC_API_URL`, verify backend port |
| 401 Unauthorized | Clear localStorage, re-login |
| ChatKit CORS errors | Add domain to OpenAI allowlist, set domain key |
| Pod `ImagePullBackOff` | Rebuild with `eval $(minikube docker-env)`, set `imagePullPolicy: Never` |
| Hydration errors | Add `'use client'` to components using hooks |

---

## 🔗 Related Documentation

- **[Root README](../README.md)** - Project overview
- **[Backend README](../backend/README.md)** - API documentation

---

<div align="center">

**Built with Next.js 16 and React 19**

</div>