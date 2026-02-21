// TypeScript interfaces for the Todo application
import { z } from 'zod';

export interface User {
  id: string; // UUID
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: number;
  user_id: string; // UUID
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp

  // Phase 5: Advanced & Intermediate fields
  due_date: string | null; // ISO timestamp
  recurrence_pattern: 'daily' | 'weekly' | 'monthly' | null;
  next_occurrence_date: string | null; // ISO timestamp
  priority: 'high' | 'medium' | 'low'; // NEW
  tags: string | null; // JSON string: '["work", "urgent"]' // NEW
}

// Authentication types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Task CRUD types
export interface TaskCreateRequest {
  title: string;
  description?: string;
  due_date?: string; // ISO8601 string
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly';
  priority?: 'high' | 'medium' | 'low'; // NEW
  tags?: string; // JSON string // NEW
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  due_date?: string; // NEW
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly'; // NEW
  priority?: 'high' | 'medium' | 'low'; // NEW
  tags?: string; // NEW
}

export interface TaskToggleRequest {
  completed: boolean;
}

export interface TaskResponse {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  recurrence_pattern: 'daily' | 'weekly' | 'monthly' | null;
  next_occurrence_date: string | null;
  priority: 'high' | 'medium' | 'low'; // NEW
  tags: string | null; // NEW
}

export interface TaskListResponse {
  tasks: Task[];
}

// Error types
export interface APIError {
  detail: string | { loc: string[]; msg: string; type: string }[];
  status?: number;
}

// Zod validation schemas
export const TaskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(), // NEW
  tags: z.string().optional(), // NEW - JSON string
});

export const TaskUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters').optional(),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(), // NEW
  tags: z.string().optional(), // NEW
});

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Type inference for form inputs
export type TaskCreateInput = z.infer<typeof TaskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof TaskUpdateSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

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
  message: string;
}

export interface ChatResponse {
  conversation_id: string;
  response: string;
  tool_calls: string[];
}

export interface ChatState {
  conversationId: string | null;
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
// Phase 5: Filter & Search Types
// ============================================

export interface TaskFilters {
  priority?: 'all' | 'high' | 'medium' | 'low';
  tags?: string[]; // Array of tag names
  search?: string; // Search query
  status?: 'all' | 'pending' | 'completed';
}

export interface TaskFilterProps {
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
  availableTags: string[]; // All unique tags from user's tasks
}