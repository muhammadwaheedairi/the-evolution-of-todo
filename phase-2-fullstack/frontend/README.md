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

The frontend of the Todo Full-Stack Web Application is built with Next.js 16 using the App Router. It provides a modern, responsive, and intuitive user interface for task management with secure authentication and seamless user experience.

### ✨ Key Features
- **🔐 Secure Authentication**: JWT-based authentication with localStorage
- **📱 Responsive Design**: Works flawlessly on mobile, tablet, and desktop
- **⚡ Real-time Interactions**: Instant task updates and management
- **🎨 Beautiful UI**: Modern design with Tailwind CSS and animations
- **🛡️ Form Validation**: Zod schema validation with React Hook Form
- **🌐 API Integration**: Seamless communication with FastAPI backend

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **[Next.js](https://nextjs.org/)** | React Framework | 16.1.6 |
| **[React](https://reactjs.org/)** | UI Library | 19.2.3 |
| **[TypeScript](https://www.typescriptlang.org/)** | Type Safety | 5+ |
| **[Tailwind CSS](https://tailwindcss.com/)** | Styling | Latest |
| **[Lucide React](https://lucide.dev/)** | Icons | Latest |
| **[React Hook Form](https://react-hook-form.com/)** | Form Management | Latest |
| **[Zod](https://zod.dev/)** | Schema Validation | Latest |
| **[Custom JWT Implementation](https://jwt.io/)** | Authentication | localStorage + cookies |

---

## 📁 Project Structure

```
frontend/
├── app/                        # Next.js 16+ App Router
│   ├── api/                    # API routes
│   ├── login/page.tsx          # Login page
│   ├── register/page.tsx       # Registration page
│   ├── tasks/page.tsx          # Task management dashboard
│   ├── favicon.ico
│   ├── globals.css             # Global styles with Tailwind
│   ├── layout.tsx              # Root layout component
│   ├── page.tsx                # Landing page (marketing)
│   └── error.tsx
├── components/                 # Reusable UI components
│   ├── Header.tsx              # Navigation header
│   ├── EmptyState.tsx
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── TaskForm.tsx            # Form for creating/editing tasks
│   ├── TaskItem.tsx            # Individual task display component
│   └── TaskList.tsx            # Task list container component
├── lib/                        # Utility functions and types
│   ├── api.ts                  # API client and authentication functions
│   └── types.ts                # TypeScript type definitions
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── next.config.ts              # Next.js configuration
├── proxy.ts                    # Route protection middleware
├── tailwind.config.js          # Tailwind CSS configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── .gitignore
├── CLAUDE.md                   # Frontend-specific instructions
└── README.md                   # Project documentation
```

---

## 🎨 UI/UX Highlights

### Landing Page Features
- **Animated Hero Section**: Dynamic gradient background with blob animations
- **Interactive Task Preview**: Visual demonstration of task management interface
- **Feature Cards**: Beautifully designed feature highlights with hover effects
- **Responsive Design**: Optimized for all screen sizes

### Task Management Interface
- **Real-time Task List**: Instant updates with loading states
- **Skeleton Loaders**: Smooth loading experience
- **Task Cards**: Interactive cards with completion toggles
- **Form Validation**: Client-side validation with clear error messages
- **Empty States**: Helpful messaging when no tasks exist

---

## 🔐 Authentication Flow

### JWT-Based Security
1. **Login/Register**: User credentials sent to backend API
2. **Token Generation**: Backend returns JWT token and user data
3. **Storage**: Token securely stored in both localStorage and cookies
4. **API Authorization**: Token included in Authorization header
5. **Session Management**: Automatic logout on token expiration
6. **Cross-tab Sync**: Authentication state synchronized across browser tabs

### Security Measures
- **Token Validation**: Automatic 401 handling and redirection
- **User Isolation**: Ensures users only see their own data
- **Protected Routes**: Client-side authentication checks via middleware
- **Secure Storage**: JWT tokens stored safely in both localStorage and cookies
- **Tab Synchronization**: Authentication state synchronized across browser tabs using storage events

---

## 🌐 API Integration

### Backend Communication
All API calls are handled through the centralized `lib/api.ts` client:

```typescript
// Example task creation
const newTask = await createTask({
  title: "New task",
  description: "Task description"
});
```

### Available Operations
- **Authentication**: Register, login, logout, token management
- **Task Management**: List, create, get, update, delete, toggle completion
- **User Management**: Profile management and session handling
- **Token Management**: Store, retrieve, and clear authentication tokens in both localStorage and cookies

---

## 🏗️ Architecture

### Component Architecture
- **Server Components**: Data fetching and static content (default in App Router)
- **Client Components**: Interactive elements and state management
- **Reusable Components**: Modular, composable UI elements
- **Type Safety**: Full TypeScript support with Zod validation

### State Management
- **Local Component State**: useState for individual component state
- **Global Authentication**: localStorage and cookie-based session management with cross-tab synchronization
- **API Response Caching**: Smart data fetching and refresh strategies
- **Cross-tab Synchronization**: Authentication state synchronized across browser tabs using storage events

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn package manager
- Access to the backend API server

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000) to see the application

---

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint linter |

---

## 💡 Key Features

### Task Management
- **Create Tasks**: Add new tasks with titles and descriptions
- **Update Tasks**: Modify existing task details
- **Delete Tasks**: Remove unwanted tasks
- **Toggle Completion**: Mark tasks as completed/incomplete
- **Real-time Updates**: Instant UI updates after actions

### User Experience
- **Loading States**: Beautiful skeleton loaders and spinners
- **Error Handling**: Graceful error messages and recovery
- **Form Validation**: Client-side validation with helpful messages
- **Responsive Design**: Perfect on all devices and screen sizes
- **Accessibility**: Semantic HTML and keyboard navigation support

---

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Better Auth server URL (if using Better Auth) | `http://localhost:8000` |
| `NEXT_PUBLIC_BETTER_AUTH_COOKIE_PREFIX` | Cookie prefix for Better Auth (if using Better Auth) | `better-auth` |

⚠️ **Important**: Only use `NEXT_PUBLIC_` prefixed variables for client-side configuration. Never expose sensitive credentials in client-side code.

---

## 🧪 Testing Strategy

While not currently implemented, the application is structured to support:
- **Unit Tests**: Component testing with Jest
- **Integration Tests**: API integration testing
- **E2E Tests**: Full workflow testing with Playwright
- **Visual Regression**: UI consistency checking

---

## 🎯 Performance Optimization

- **Code Splitting**: Automatic splitting of code by Next.js
- **Image Optimization**: Built-in Next.js Image optimization
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Caching Strategies**: Smart HTTP caching and service worker potential
- **Lazy Loading**: Component lazy loading where appropriate

---

## 🔒 Security Considerations

- **XSS Prevention**: React's built-in XSS protection
- **Input Validation**: Client-side validation with Zod schemas
- **Authentication**: JWT-based secure authentication
- **Environment Security**: Safe handling of environment variables
- **HTTP Security**: Proper headers and CORS configuration

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript typing
4. Ensure all components follow the App Router patterns
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request with clear description

### Development Guidelines
- Use Server Components by default (no 'use client' unless needed)
- Add 'use client' directive only for interactive components
- Follow Tailwind CSS utility-first approach
- Maintain type safety with TypeScript interfaces
- Implement proper error boundaries
- Follow accessibility best practices

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 🆘 Support

For support or questions about the frontend implementation:
- Check the [issues](../../issues) section
- Review the [documentation](./CLAUDE.md)
- Contact the development team

---

<p align="center">
Made with ❤️ using Next.js 16, React 19 & Tailwind CSS
</p>