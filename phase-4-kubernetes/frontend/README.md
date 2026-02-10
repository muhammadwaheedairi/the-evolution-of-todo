# 🎨 TaskFlow AI - Frontend Documentation

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.19-38B2AC?style=flat-square&logo=tailwind-css)

**Modern Next.js 16 frontend with AI-powered chat interface**

[Overview](#-overview) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Components](#-components) • [API Client](#-api-client)

</div>

---

## 📋 Overview

The frontend is a modern, responsive web application built with Next.js 16 App Router, featuring both traditional task management UI and an AI-powered conversational interface using OpenAI ChatKit. It demonstrates best practices for React Server Components, client-side state management, and secure authentication.

### Key Features

- ✅ **Next.js 16 App Router** - Latest React Server Components architecture
- 🎨 **Tailwind CSS** - Utility-first styling with custom design system
- 🔐 **Custom JWT Auth** - Secure authentication with localStorage + cookies
- 💬 **OpenAI ChatKit** - Conversational AI interface (Phase 3)
- 📱 **Fully Responsive** - Mobile-first design approach
- ⚡ **TypeScript Strict Mode** - Type-safe development
- 🎯 **React Hook Form + Zod** - Robust form validation
- 🔄 **Real-time Updates** - Optimistic UI updates

---

## 🏗️ Architecture

### Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 16.1.6 | React framework with App Router |
| **UI Library** | React | 19.2.3 | Component-based UI |
| **Language** | TypeScript | 5.0+ | Type-safe JavaScript |
| **Styling** | Tailwind CSS | 3.4.19 | Utility-first CSS |
| **Forms** | React Hook Form | Latest | Form state management |
| **Validation** | Zod | Latest | Schema validation |
| **Chat UI** | @openai/chatkit | 1.5.0 | AI chat interface |
| **Icons** | Lucide React | Latest | Icon library |
| **HTTP Client** | Fetch API | Native | API communication |

### Project Structure

```
frontend/
├── app/                          # Next.js 16 App Router
│   ├── page.tsx                 # Landing page (marketing)
│   ├── layout.tsx               # Root layout with Header
│   ├── globals.css              # Global Tailwind styles
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── register/
│   │   └── page.tsx            # Registration page
│   ├── tasks/
│   │   └── page.tsx            # Task management dashboard
│   └── chat/                    # AI Chat Interface (Phase 3)
│       └── page.tsx            # Conversational task management
│
├── components/                   # Reusable React components
│   ├── Header.tsx               # Navigation header
│   ├── LoginForm.tsx            # Login form with validation
│   ├── RegisterForm.tsx         # Registration form
│   ├── TaskForm.tsx             # Task CRUD form
│   ├── TaskItem.tsx             # Individual task display
│   ├── TaskList.tsx             # Task list container
│   ├── EmptyState.tsx           # Empty state UI
│   └── chat/                    # Chat Components (Phase 3)
│       ├── ChatInterface.tsx    # Main ChatKit wrapper
│       ├── MessageList.tsx      # Conversation history
│       ├── ChatInput.tsx        # Message input field
│       └── ToolCallIndicator.tsx # Tool execution badges
│
├── lib/                         # Utilities and API clients
│   ├── api.ts                  # Task API client + auth helpers
│   ├── chat-api.ts             # Chat endpoint client (Phase 3)
│   └── types.ts                # TypeScript type definitions
│
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── next.config.ts               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
├── package.json                 # Dependencies
└── README.md                    # This file
```

### Component Architecture

The application follows Next.js 16 App Router conventions:

- **Server Components** (default) - Used for static content, layouts, and data fetching
- **Client Components** (`'use client'`) - Used for interactivity, forms, and state management
- **Shared Components** - Reusable UI components in `/components` directory
- **Route-based Pages** - File-system routing in `/app` directory

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm**, **yarn**, **pnpm**, or **bun**
- Backend API running (see [backend README](../backend/README.md))

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env.local` file in the frontend directory with the following variables:

**Required Variables:**
- `NEXT_PUBLIC_API_URL` - Backend API base URL
  - Development: `http://localhost:8000`
  - Production: Your deployed backend URL

**Optional Variables (Phase 3):**
- `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` - OpenAI ChatKit domain key
  - Required for production ChatKit deployment
  - Not needed for localhost development
  - Format: `dk-` followed by alphanumeric string

### Development Server

```bash
# Start development server
npm run dev

# Server will start at http://localhost:3000
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm run start
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Lint code with ESLint |
| `npm test` | Run component tests (when implemented) |
| `npm run test:e2e` | Run E2E tests (when implemented) |

---

## 🐳 Docker & Kubernetes Deployment (Phase 4)

### Docker Containerization

The frontend is containerized using a multi-stage Docker build for optimal image size and security.

#### Dockerfile Structure

**Location:** `frontend/Dockerfile`

```dockerfile
# Build stage - Install dependencies and build Next.js app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage - Minimal production image
FROM node:20-alpine
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
```

**Key Features:**
- **Multi-stage build**: Separates build and runtime stages to minimize final image size
- **Non-root user**: Runs as `nextjs` user (UID 1001) for security
- **Alpine base**: Uses lightweight Alpine Linux for smaller images
- **Layer caching**: Optimized layer order for faster rebuilds
- **Production mode**: Sets NODE_ENV=production for optimized runtime

#### Building Docker Image

```bash
# Navigate to frontend directory
cd frontend

# Build image locally
docker build -t todo-frontend:latest .

# Build for Minikube (use Minikube's Docker daemon)
eval $(minikube docker-env)
docker build -t todo-frontend:latest .

# Verify image
docker images | grep todo-frontend
```

#### Running Container Locally

```bash
# Run container with environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
  -e NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key \
  todo-frontend:latest

# Access application
open http://localhost:3000
```

### Kubernetes Deployment

The frontend is deployed to Kubernetes using Helm charts for declarative infrastructure management.

#### Helm Chart Structure

**Location:** `helm/templates/frontend-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
  namespace: {{ .Values.namespace }}
spec:
  replicas: {{ .Values.frontend.replicas }}
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: {{ .Values.frontend.image }}:{{ .Values.frontend.tag }}
        imagePullPolicy: {{ .Values.frontend.imagePullPolicy }}
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://backend-service:8000"
        - name: NEXT_PUBLIC_OPENAI_DOMAIN_KEY
          valueFrom:
            secretKeyRef:
              name: todo-app-secrets
              key: OPENAI_DOMAIN_KEY
              optional: true
        resources:
          requests:
            memory: {{ .Values.frontend.resources.requests.memory }}
            cpu: {{ .Values.frontend.resources.requests.cpu }}
          limits:
            memory: {{ .Values.frontend.resources.limits.memory }}
            cpu: {{ .Values.frontend.resources.limits.cpu }}
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
```

#### Kubernetes Service

**Location:** `helm/templates/frontend-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: {{ .Values.namespace }}
spec:
  type: {{ .Values.frontend.service.type }}
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: 3000
    targetPort: 3000
    nodePort: {{ .Values.frontend.service.nodePort }}
```

#### Deployment Steps

**Prerequisites:**
- Minikube running with sufficient resources (4 CPU, 8GB RAM)
- Docker images built and available in Minikube's Docker daemon
- Kubernetes secrets created with required credentials

**Deploy to Minikube:**

```bash
# 1. Start Minikube
minikube start --cpus=4 --memory=8192 --driver=docker

# 2. Use Minikube's Docker daemon
eval $(minikube docker-env)

# 3. Build frontend image
cd frontend
docker build -t todo-frontend:latest .

# 4. Create namespace
kubectl create namespace todo-app

# 5. Create secrets (if not already created)
kubectl create secret generic todo-app-secrets \
  --from-literal=OPENAI_DOMAIN_KEY='your-domain-key' \
  --namespace=todo-app

# 6. Deploy with Helm
cd ..
helm install todo-app ./helm \
  --namespace todo-app \
  --values ./helm/values-dev.yaml

# 7. Verify deployment
kubectl get pods -n todo-app
kubectl get services -n todo-app

# 8. Access application
minikube service frontend-service -n todo-app
```

#### Environment Variables in Kubernetes

Environment variables are configured in the Helm chart and injected at runtime:

**ConfigMap Variables (Non-sensitive):**
- `NEXT_PUBLIC_API_URL`: Backend service URL (uses Kubernetes DNS)
  - Value: `http://backend-service:8000`
  - Automatically resolves to backend service within cluster

**Secret Variables (Sensitive):**
- `NEXT_PUBLIC_OPENAI_DOMAIN_KEY`: OpenAI ChatKit domain key
  - Stored in Kubernetes Secret: `todo-app-secrets`
  - Injected via `secretKeyRef` in deployment
  - Optional: Application works without it for localhost

**Helm Values Configuration:**

```yaml
# helm/values-dev.yaml
frontend:
  image: todo-frontend
  tag: latest
  imagePullPolicy: Never  # Use local images in Minikube
  replicas: 1
  service:
    type: NodePort
    nodePort: 30000
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "250m"
```

#### Health Checks

The frontend deployment includes liveness and readiness probes:

**Liveness Probe:**
- Endpoint: `GET /`
- Purpose: Verify the Next.js process is running
- Failure action: Restart pod
- Configuration: 30s initial delay, 10s interval

**Readiness Probe:**
- Endpoint: `GET /`
- Purpose: Verify the application is ready to serve traffic
- Failure action: Remove pod from service endpoints
- Configuration: 10s initial delay, 5s interval

**Note:** Next.js doesn't have dedicated health endpoints, so we use the root path. For production, consider adding dedicated `/health` and `/ready` endpoints.

#### Accessing the Application

**Via Minikube Service:**
```bash
# Open in browser automatically
minikube service frontend-service -n todo-app

# Get service URL
minikube service frontend-service -n todo-app --url
```

**Via Port Forwarding:**
```bash
# Forward local port 3000 to frontend service
kubectl port-forward service/frontend-service 3000:3000 -n todo-app

# Access at http://localhost:3000
```

**Via NodePort:**
```bash
# Get Minikube IP
minikube ip

# Get NodePort
kubectl get service frontend-service -n todo-app

# Access at http://<minikube-ip>:30000
```

### Kubernetes Troubleshooting

#### Pod Not Starting

**Symptoms:** Pod stuck in `Pending`, `CrashLoopBackOff`, or `ImagePullBackOff`

**Solutions:**

1. **Check pod status:**
   ```bash
   kubectl get pods -n todo-app
   kubectl describe pod <frontend-pod-name> -n todo-app
   ```

2. **Check pod logs:**
   ```bash
   kubectl logs <frontend-pod-name> -n todo-app
   kubectl logs <frontend-pod-name> -n todo-app --previous
   ```

3. **Common issues:**
   - **ImagePullBackOff**: Image not found in Minikube's Docker daemon
     - Solution: Rebuild image with `eval $(minikube docker-env)` first
     - Set `imagePullPolicy: Never` in Helm values

   - **CrashLoopBackOff**: Application crashing on startup
     - Check logs for errors
     - Verify environment variables are set correctly
     - Ensure backend service is accessible

   - **Insufficient CPU/Memory**: Resource limits too low
     - Increase resource limits in Helm values
     - Check Minikube has sufficient resources

#### Cannot Access Application

**Symptoms:** Service exists but application not accessible in browser

**Solutions:**

1. **Verify service endpoints:**
   ```bash
   kubectl get endpoints frontend-service -n todo-app
   ```

2. **Check service configuration:**
   ```bash
   kubectl describe service frontend-service -n todo-app
   ```

3. **Test connectivity from within cluster:**
   ```bash
   kubectl run -it --rm debug --image=alpine --restart=Never -n todo-app -- sh
   # Inside pod:
   wget -O- http://frontend-service:3000
   ```

4. **Common issues:**
   - **NodePort conflict**: Port 30000 already in use
     - Solution: Change `nodePort` in Helm values or delete conflicting service

   - **Service selector mismatch**: Labels don't match deployment
     - Solution: Verify `app: frontend` label matches in deployment and service

   - **Firewall blocking**: Local firewall blocking Minikube IP
     - Solution: Check firewall rules, use port-forward instead

#### Backend API Not Reachable

**Symptoms:** Frontend loads but API calls fail with network errors

**Solutions:**

1. **Verify backend service exists:**
   ```bash
   kubectl get service backend-service -n todo-app
   ```

2. **Check NEXT_PUBLIC_API_URL:**
   ```bash
   kubectl describe pod <frontend-pod-name> -n todo-app | grep NEXT_PUBLIC_API_URL
   ```

3. **Test backend connectivity:**
   ```bash
   kubectl exec -it <frontend-pod-name> -n todo-app -- sh
   # Inside pod:
   wget -O- http://backend-service:8000/health
   ```

4. **Common issues:**
   - **Wrong API URL**: Using localhost instead of service DNS
     - Solution: Set `NEXT_PUBLIC_API_URL=http://backend-service:8000`

   - **Backend not ready**: Backend pod not in Ready state
     - Solution: Check backend pod status and logs

   - **Network policy blocking**: Network policies preventing communication
     - Solution: Review network policies or disable for local development

#### Build Failures

**Symptoms:** Docker build fails or Helm install fails

**Solutions:**

1. **Docker build failures:**
   ```bash
   # Check Docker daemon
   docker info

   # Clean build cache
   docker builder prune

   # Build with verbose output
   docker build --progress=plain -t todo-frontend:latest .
   ```

2. **Helm install failures:**
   ```bash
   # Lint chart
   helm lint ./helm

   # Dry-run to validate
   helm install todo-app ./helm \
     --namespace todo-app \
     --values ./helm/values-dev.yaml \
     --dry-run --debug

   # Check for existing release
   helm list -n todo-app

   # Uninstall if needed
   helm uninstall todo-app -n todo-app
   ```

### Resource Management

**Development (Minikube):**
- CPU Request: 100m (0.1 CPU cores)
- CPU Limit: 250m (0.25 CPU cores)
- Memory Request: 128Mi
- Memory Limit: 256Mi
- Replicas: 1

**Production (Recommended):**
- CPU Request: 250m (0.25 CPU cores)
- CPU Limit: 500m (0.5 CPU cores)
- Memory Request: 256Mi
- Memory Limit: 512Mi
- Replicas: 2+ (for high availability)

**Scaling:**
```bash
# Scale frontend deployment
kubectl scale deployment frontend-deployment --replicas=2 -n todo-app

# Verify scaling
kubectl get pods -n todo-app -l app=frontend
```

### Security Best Practices

1. **Non-root User**: Container runs as `nextjs` user (UID 1001)
2. **Read-only Root Filesystem**: Consider adding `readOnlyRootFilesystem: true`
3. **No Privileged Mode**: Never run containers in privileged mode
4. **Secret Management**: Sensitive data stored in Kubernetes Secrets
5. **Image Scanning**: Scan images for vulnerabilities before deployment
6. **Resource Limits**: Always set CPU and memory limits to prevent resource exhaustion

---

## 📱 Pages & Routes

### Public Routes (No Authentication Required)

#### `/` - Landing Page
- Marketing page with application overview
- Feature highlights and benefits
- Call-to-action buttons for login and registration
- Responsive hero section

#### `/login` - Login Page
- Email and password authentication form
- Form validation with error messages
- Automatic redirect to `/tasks` on successful login
- Link to registration page for new users

#### `/register` - Registration Page
- User registration form (name, email, password)
- Email format validation
- Password strength requirements
- Automatic redirect to `/login` on successful registration

### Protected Routes (Authentication Required)

#### `/tasks` - Task Management Dashboard
- Traditional CRUD interface for task management
- Create new tasks with title and description
- View all tasks in organized list
- Update existing task details
- Toggle task completion status
- Delete tasks permanently
- Filter tasks by status (all/pending/completed)
- Empty state display when no tasks exist

#### `/chat` - AI Chat Interface (Phase 3)
- Conversational task management interface
- Natural language input for task operations
- AI agent responses with context awareness
- Tool execution indicators showing which operations were performed
- Conversation history display
- Real-time message updates
- Persistent conversation across page refreshes

---

## 🧩 Components

### Authentication Components

#### LoginForm.tsx
**Type:** Client Component (`'use client'`)

**Purpose:** User authentication form

**Features:**
- Email and password input fields
- Form validation using React Hook Form + Zod
- Error message display for validation failures
- Loading state during authentication
- Automatic redirect on successful login
- Integration with JWT authentication system

#### RegisterForm.tsx
**Type:** Client Component (`'use client'`)

**Purpose:** New user registration form

**Features:**
- Name, email, and password input fields
- Password confirmation validation
- Email format validation
- Password strength requirements (minimum 8 characters)
- Success and error message handling
- Form submission with loading state

### Task Management Components

#### TaskList.tsx
**Type:** Client Component

**Purpose:** Container for displaying multiple tasks

**Features:**
- Renders array of task items
- Empty state when no tasks exist
- Passes action handlers to child components
- Responsive grid layout
- Loading state during data fetch

#### TaskItem.tsx
**Type:** Client Component

**Purpose:** Individual task display and interaction

**Features:**
- Task title and description display
- Checkbox for completion toggle
- Edit and delete action buttons
- Inline editing mode
- Completed task styling (strikethrough)
- Timestamp display
- Responsive card layout

#### TaskForm.tsx
**Type:** Client Component

**Purpose:** Task creation and editing form

**Features:**
- Title input field (required)
- Description textarea (optional)
- Form validation with Zod schema
- Create or edit mode support
- Cancel button to close form
- Loading state during submission
- Error handling and display

#### EmptyState.tsx
**Type:** Server Component

**Purpose:** Display when no tasks exist

**Features:**
- Friendly empty state message
- Call-to-action to create first task
- Icon illustration
- Centered layout

### Chat Components (Phase 3)

#### ChatInterface.tsx
**Type:** Client Component (`'use client'`)

**Purpose:** Main wrapper for AI chat functionality

**Features:**
- OpenAI ChatKit integration
- Message sending and receiving
- Conversation state management
- Loading indicators during AI processing
- Error handling and display
- Authentication integration with JWT
- Conversation ID tracking

#### MessageList.tsx
**Type:** Client Component

**Purpose:** Display conversation history

**Features:**
- Chronological message display
- User vs assistant message styling
- Timestamps for all messages
- Tool execution badges
- Auto-scroll to latest message
- Empty state for new conversations
- Message grouping by sender

#### ChatInput.tsx
**Type:** Client Component

**Purpose:** Message input interface

**Features:**
- Text input with placeholder
- Send button (disabled during loading)
- Enter key to send message
- Shift+Enter for new line
- Character limit indicator
- Input validation (no empty messages)
- Auto-focus on mount

#### ToolCallIndicator.tsx
**Type:** Client Component

**Purpose:** Display executed MCP tools

**Features:**
- Badge display for each tool executed
- Tool name and icon
- Color-coded by tool type
- Tooltip with tool details (optional)
- Only shown when tools were executed

### Layout Components

#### Header.tsx
**Type:** Mixed (Server + Client Components)

**Purpose:** Application navigation header

**Features:**
- Navigation links (Home, Tasks, Chat)
- User profile display (name from JWT)
- Logout button
- Responsive mobile menu
- Authentication state handling
- Active route highlighting

---

## 🔌 API Client

### Location: `lib/api.ts`

The API client provides centralized functions for all backend interactions with built-in authentication and error handling.

### Authentication Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `getToken()` | Retrieve JWT token from storage | string or null |
| `getUserId()` | Get authenticated user ID | string or null |
| `getUserName()` | Get authenticated user name | string or null |
| `setToken()` | Store authentication tokens | void |
| `removeToken()` | Clear authentication tokens | void |
| `isAuthenticated()` | Check authentication status | boolean |

### Task API Functions

| Function | Purpose | Parameters | Returns |
|----------|---------|------------|---------|
| `register()` | Register new user | RegisterRequest | RegisterResponse |
| `login()` | Authenticate user | LoginRequest | LoginResponse |
| `getTasks()` | Fetch all user tasks | userId | Task[] |
| `createTask()` | Create new task | userId, TaskCreate | Task |
| `getTask()` | Fetch single task | userId, taskId | Task |
| `updateTask()` | Update task details | userId, taskId, TaskUpdate | Task |
| `toggleTaskComplete()` | Toggle completion | userId, taskId | Task |
| `deleteTask()` | Delete task | userId, taskId | void |

### Chat API Functions (Phase 3)

**Location:** `lib/chat-api.ts`

| Function | Purpose | Parameters | Returns |
|----------|---------|------------|---------|
| `sendChatMessage()` | Send message to AI | userId, ChatRequest | ChatResponse |
| `getConversationHistory()` | Fetch message history | userId, conversationId | Message[] |
| `clearConversationHistory()` | Clear all messages | userId | void |

### Error Handling

All API functions include automatic error handling:

- **401 Unauthorized** - Clears tokens and redirects to `/login`
- **404 Not Found** - Returns appropriate error message
- **500 Server Error** - Returns generic error message
- **Network Error** - Returns connection error message
- **Validation Error** - Returns field-specific error messages

---

## 🎨 Styling Guide

### Tailwind CSS Conventions

The application uses Tailwind CSS exclusively for all styling. Inline styles and CSS modules are not used.

### Design System

#### Color Palette

**Primary Colors:**
- `bg-blue-600` - Primary buttons, user messages
- `bg-blue-100` - Tool badges, highlights
- `text-blue-700` - Tool badge text

**Neutral Colors:**
- `bg-gray-100` - Assistant messages, cards
- `bg-gray-50` - Page backgrounds
- `text-gray-900` - Primary text
- `text-gray-500` - Secondary text, timestamps

**Status Colors:**
- `bg-green-600` - Success states, complete buttons
- `bg-red-600` - Error states, delete buttons
- `bg-yellow-100` - Warning states

#### Typography

- **Headings** - `text-2xl font-bold` to `text-4xl font-bold`
- **Body Text** - `text-base` (16px)
- **Small Text** - `text-sm` (14px)
- **Tiny Text** - `text-xs` (12px)

#### Spacing

- **Padding** - `p-4` (16px), `p-6` (24px), `p-8` (32px)
- **Margin** - `m-4` (16px), `m-6` (24px), `m-8` (32px)
- **Gap** - `gap-4` (16px), `gap-6` (24px)

#### Borders & Shadows

- **Border Radius** - `rounded-lg` (8px), `rounded-xl` (12px)
- **Shadows** - `shadow-md`, `shadow-lg`
- **Borders** - `border border-gray-300`

### Component Styling Patterns

#### Buttons
- Primary: `bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700`
- Secondary: `bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300`
- Danger: `bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700`

#### Cards
- Standard: `bg-white rounded-lg shadow-md p-6`
- Hover: `bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow`

#### Input Fields
- Default: `w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500`
- Error: `w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500`

#### Chat Messages
- User: `bg-blue-600 text-white rounded-lg px-4 py-2 max-w-md ml-auto`
- Assistant: `bg-gray-100 text-gray-900 rounded-lg px-4 py-2 max-w-md mr-auto`

---

## 🔐 Authentication Flow

### Registration Process

1. User fills out registration form with name, email, and password
2. Frontend validates input using Zod schema
3. Frontend sends POST request to `/api/auth/register`
4. Backend creates user account with Argon2 hashed password
5. User redirected to login page with success message

### Login Process

1. User enters email and password
2. Frontend validates credentials format
3. Frontend sends POST request to `/api/auth/login`
4. Backend validates credentials and generates JWT token
5. Frontend stores token in localStorage and cookies
6. User redirected to `/tasks` dashboard

### Authenticated Requests

1. Frontend retrieves token from storage
2. Token included in Authorization header: `Bearer <token>`
3. Backend validates token on every request
4. Backend extracts user_id from token payload
5. Backend filters all data by authenticated user_id

### Logout Process

1. User clicks logout button in header
2. Frontend clears localStorage and cookies
3. User redirected to login page
4. All protected routes become inaccessible

### Token Management

- **Storage**: Dual storage in localStorage and cookies
- **Expiration**: 7 days from issuance
- **Refresh**: Automatic logout on 401 responses
- **Sync**: Storage events sync auth state across tabs

---

## 💬 Chat Interface (Phase 3)

### OpenAI ChatKit Integration

#### Domain Allowlist Setup

For production deployment, the frontend domain must be added to OpenAI's domain allowlist:

1. Deploy frontend to production hosting
2. Visit OpenAI Platform security settings
3. Add production domain to allowlist
4. Obtain domain key from OpenAI
5. Set `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` environment variable
6. Redeploy application with new configuration

**Note:** Localhost development works without domain key configuration.

### Natural Language Capabilities

The chat interface understands various natural language patterns:

| User Input | Expected Behavior |
|------------|-------------------|
| "add task buy groceries" | Creates new task |
| "show me all tasks" | Lists all tasks |
| "what's pending?" | Lists pending tasks only |
| "mark task 3 as done" | Completes task 3 |
| "delete the meeting task" | Finds and deletes task |
| "change task 1 to 'call mom'" | Updates task 1 title |

### Chat UI Design

**User Messages:**
- Right-aligned layout
- Blue background color
- White text
- Rounded corners
- Maximum width constraint

**Assistant Messages:**
- Left-aligned layout
- Gray background color
- Dark text
- Rounded corners
- Maximum width constraint

**Tool Execution Badges:**
- Small pill-shaped badges
- Light blue background
- Displayed below assistant messages
- Show tool names with icons
- Only visible when tools were executed

**Timestamps:**
- Small text size
- Muted gray color
- Displayed below each message
- Relative time format (e.g., "2 minutes ago")

---

## 🧪 Testing

### Testing Strategy

The application follows a comprehensive testing approach:

- **Unit Tests** - Individual component testing
- **Integration Tests** - Component interaction testing
- **E2E Tests** - Full user flow testing

### Component Testing (Planned)

Test coverage for all major components:

- Authentication forms (validation, submission)
- Task CRUD operations
- Chat interface (message sending, history)
- Error handling scenarios
- Loading states

### E2E Testing (Planned)

End-to-end scenarios:

- Complete registration and login flow
- Create, update, complete, and delete tasks
- Chat with AI agent to manage tasks
- Conversation persistence across refreshes
- Authentication redirects

---

## 🐛 Troubleshooting

### Common Issues

#### Cannot connect to backend
**Symptoms:** API calls fail with network errors

**Solutions:**
- Verify backend is running on correct port
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is configured on backend
- Verify no firewall blocking requests

#### 401 Unauthorized errors
**Symptoms:** Automatic logout, "Unauthorized" messages

**Solutions:**
- Token may have expired (7-day limit)
- Clear localStorage and re-login
- Verify token is being sent in headers
- Check backend JWT validation

#### ChatKit CORS errors
**Symptoms:** Chat interface fails to load

**Solutions:**
- Add production domain to OpenAI allowlist
- Set `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` variable
- Verify domain key is correct format
- Check browser console for specific errors

#### Page not found after build
**Symptoms:** 404 errors on deployed application

**Solutions:**
- Verify all pages have proper file structure
- Check `next.config.ts` configuration
- Ensure dynamic routes are configured
- Review build output for errors

#### Hydration errors
**Symptoms:** Console warnings about hydration mismatch

**Solutions:**
- Ensure no browser-only APIs in Server Components
- Use `'use client'` for components with hooks
- Check for mismatched HTML structure
- Verify no random values in initial render

---

## 📦 Dependencies

### Core Dependencies

- **next** (16.1.6) - React framework
- **react** (19.2.3) - UI library
- **react-dom** (19.2.3) - React DOM renderer
- **typescript** (^5.0.0) - Type system
- **tailwindcss** (3.4.19) - CSS framework
- **@openai/chatkit** (1.5.0) - Chat UI component
- **react-hook-form** (^7.0.0) - Form management
- **zod** (^3.0.0) - Schema validation
- **lucide-react** (latest) - Icon library

### Development Dependencies

- **@types/node** (^20.0.0) - Node.js types
- **@types/react** (^19.0.0) - React types
- **@types/react-dom** (^19.0.0) - React DOM types
- **eslint** (^8.0.0) - Code linting
- **eslint-config-next** (16.1.6) - Next.js ESLint config
- **postcss** (^8.0.0) - CSS processing
- **autoprefixer** (^10.0.0) - CSS vendor prefixes

---

## 🔗 Related Documentation

- **[Root README](../README.md)** - Project overview and architecture
- **[Backend README](../backend/README.md)** - API documentation and backend details
- **[Specifications](../specs/)** - Feature specifications for all phases
- **[ADRs](../history/adr/)** - Architecture decision records

---

<div align="center">

**Built with Next.js 16 and React 19**

[⬆ Back to Top](#-taskflow-ai---frontend-documentation)

</div>
