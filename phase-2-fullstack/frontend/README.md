# Todo Full-Stack Web Application - Frontend

<p align="center">
  <img src="https://img.shields.io/badge/next.js-16.1.6-black?logo=next.js" alt="Next.js 16.1.6" />
  <img src="https://img.shields.io/badge/react-19.2.3-61DAFB?logo=react" alt="React 19.2.3" />
  <img src="https://img.shields.io/badge/typescript-5+-3178C6?logo=typescript" alt="TypeScript 5+" />
  <img src="https://img.shields.io/badge/tailwind-css-06B6D4?logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/license-MIT-yellow" alt="License" />
</p>

<p align="center">
  🚀 Modern Task Management Platform • Built with Next.js 16 & React 19
</p>

---

## 🚀 Overview

Frontend built with Next.js 16 App Router — responsive, modern UI for task management with JWT authentication and FastAPI backend integration.

### ✨ Key Features
- **🔐 Authentication**: JWT-based with localStorage & cookie storage
- **📱 Responsive Design**: Mobile, tablet, and desktop ready
- **⚡ Real-time Interactions**: Instant task updates
- **🎨 Modern UI**: Tailwind CSS with animations
- **🛡️ Form Validation**: Zod + React Hook Form
- **🌐 API Integration**: FastAPI backend communication

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React Framework | 16.1.6 |
| **React** | UI Library | 19.2.3 |
| **TypeScript** | Type Safety | 5+ |
| **Tailwind CSS** | Styling | Latest |
| **Lucide React** | Icons | Latest |
| **React Hook Form** | Form Management | Latest |
| **Zod** | Schema Validation | Latest |

---

## 📁 Project Structure
```
frontend/
├── app/                        # Next.js App Router
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── tasks/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── TaskForm.tsx
│   ├── TaskItem.tsx
│   └── TaskList.tsx
├── lib/
│   ├── api.ts
│   └── types.ts
├── .env.local
├── next.config.ts
├── proxy.ts
└── tailwind.config.js
```

---

## 🔐 Authentication Flow

1. User credentials sent to backend → JWT token returned
2. Token stored in localStorage and cookies
3. Token included in all API request headers
4. Auto-logout on expiration, cross-tab sync via storage events

---

## 🌐 API Integration

All API calls handled through `lib/api.ts`:
```typescript
const newTask = await createTask({
  title: "New task",
  description: "Task description"
});
```

**Operations**: Auth (register, login, logout), Tasks (list, create, update, delete, toggle), User profile

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend API running

### Installation

1. **Clone & navigate**
```bash
   git clone <repository-url>
   cd frontend
```

2. **Install dependencies**
```bash
   npm install
```

3. **Configure environment**
```bash
   cp .env.local.example .env.local
```
```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. **Start dev server**
```bash
   npm run dev
```

5. Visit [http://localhost:3000](http://localhost:3000)

---

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

⚠️ Never expose sensitive credentials in client-side code.

---

## 🤝 Contributing

1. Fork → create feature branch → make changes → open PR
2. Use Server Components by default, add `'use client'` only when needed
3. Follow Tailwind utility-first approach and maintain TypeScript type safety

---

## 📄 License

MIT License — see [LICENSE](../LICENSE)

---

<p align="center">Made with ❤️ using Next.js 16, React 19 & Tailwind CSS</p>