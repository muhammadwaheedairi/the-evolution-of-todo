# Frontend Workspace Instructions - Next.js 16+ App Router

This workspace contains the Next.js 16+ frontend for the Todo Full-Stack Web Application.

## Technology Stack

- **Framework**: Next.js 16+ (App Router - NOT Pages Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Framework**: Next.js 16.1.6 (App Router - NOT Pages Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v3.4.19
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Custom JWT implementation (localStorage + cookies)
- **State Management**: React Server Components + Client Components
- **HTTP Client**: Native fetch API
- **Testing**: Jest (components), Playwright (E2E)

## Critical Requirements

### Next.js App Router Rules

1. **Default to Server Components**: All components are Server Components unless they need interactivity
2. **Client Components Only When Needed**: Use `'use client'` directive for:
   - Forms with `onSubmit`, `onClick`, event handlers
   - Components using React hooks (`useState`, `useEffect`, `useContext`)
   - Interactive elements (buttons with onClick, input fields)
3. **Server Components for**:
   - Data fetching (async components)
   - Static content
   - Layout components
   - Pages without interactivity

### Component Structure

The frontend follows Next.js 16+ App Router conventions:
- Server Components are the default (no directive needed)
- Client Components require the 'use client' directive and are used only for interactive elements
- Components are organized in the components/ directory for reusability

## Project Structure

```
frontend/
├── app/                        # Next.js 16+ App Router
│   ├── api/                    # API routes
│   ├── favicon.ico
│   ├── globals.css             # Global styles with Tailwind
│   ├── layout.tsx              # Root layout component
│   ├── page.tsx                # Landing page (marketing)
│   ├── login/page.tsx          # Login page
│   ├── register/page.tsx       # Registration page
│   ├── tasks/page.tsx          # Task management dashboard
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

## API Client Pattern

**Location**: `lib/api.ts`

The frontend implements a custom JWT authentication system using both localStorage and cookies with the following components:

- **API_URL**: Base URL for backend API calls
- **getToken**: Retrieves JWT token from both localStorage and cookies
- **getUserId**: Retrieves user ID from localStorage
- **setAuthTokens**: Stores JWT tokens in both localStorage and cookies
- **clearAuthTokens**: Removes JWT tokens from both localStorage and cookies
- **authenticatedFetch**: Makes authenticated API requests with proper error handling for 401 responses
- **API functions**: Implement all necessary CRUD operations for user authentication (register, login, logout) and tasks (list, create, get, update, delete, toggle completion)

All API calls include the JWT token in the Authorization header and verify user authentication before making requests. The authentication state is synchronized across tabs using storage events.


## Component Guidelines

### Forms (Always Client Components)

Forms in the application are always Client Components since they require interactivity. They utilize React state hooks and form handling libraries like React Hook Form with Zod validation.

### Tailwind CSS Styling

**Always use Tailwind classes, never inline styles or CSS modules**

The application uses Tailwind CSS for styling with a utility-first approach. Components are styled using predefined Tailwind classes for consistency and maintainability.

## Environment Variables

The application uses environment variables for configuration. The following variables are used:

- `NEXT_PUBLIC_API_URL`: The backend API base URL (required)
- `NEXT_PUBLIC_BETTER_AUTH_URL`: Better Auth server URL (if using Better Auth)
- `NEXT_PUBLIC_BETTER_AUTH_COOKIE_PREFIX`: Cookie prefix for Better Auth (if using Better Auth)

## Testing

The application includes testing capabilities:

### Component Tests (Jest)
Component testing using Jest and React Testing Library to test individual UI components.

### E2E Tests (Playwright)
End-to-end testing using Playwright to test complete user workflows.

## Development Commands

The application provides several npm scripts for development:

- `npm run dev`: Start development server with hot reload
- `npm run build`: Create production build
- `npm run start`: Start production server
- `npm run lint`: Lint code

## Critical Security Rules

1. **Never expose secrets in client-side code**
2. **Use NEXT_PUBLIC_ prefix only for safe env vars**
3. **Validate all user input (client and server)**
4. **Sanitize output to prevent XSS**
5. **Send JWT token in httpOnly cookie (handled by Better Auth)**
6. **All API requests must include JWT token in Authorization header**


## Common Patterns

### Protected Route Pattern

The application implements protected routes that require authentication before allowing access to user-specific content like task management.

### Error Handling

The application includes proper error boundaries and error handling patterns to gracefully handle runtime errors.

## Relevant Skills

### building-nextjs-apps
- **Purpose**: Build Next.js 16 applications with correct patterns and distinctive design
- **When to use**: Creating pages, layouts, dynamic routes, upgrading from Next.js 15, or implementing proxy.ts
- **Why it's relevant**: This skill covers Next.js 16 breaking changes (async params/searchParams), proper App Router patterns, and addresses common mistakes developers make when transitioning to Next.js 16

### frontend-design
- **Purpose**: Create distinctive, production-grade frontend interfaces with high design quality
- **When to use**: Building web components, pages, artifacts, posters, or applications (websites, landing pages, dashboards, React components, HTML/CSS layouts)
- **Why it's relevant**: Helps create visually appealing and user-friendly interfaces for the Todo application with distinctive design aesthetics

### nextjs-devtools
- **Purpose**: Next.js development tooling via MCP. Inspect routes, components, build info, and debug Next.js apps
- **When to use**: Working on Next.js applications, debugging routing, or inspecting app structure
- **Why it's relevant**: Provides development tools to inspect and debug the Next.js application during development


## Reference Documentation

- Next.js App Router: https://nextjs.org/docs/app
- React Hook Form: https://react-hook-form.com/
- Zod Validation: https://zod.dev/
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs/
- Lucide React Icons: https://lucide.dev/
- JWT Implementation: https://jwt.io/introduction