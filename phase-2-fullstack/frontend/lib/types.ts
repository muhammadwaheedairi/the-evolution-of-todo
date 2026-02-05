// TypeScript interfaces for the Todo application
import { z } from 'zod';

export interface User {
  id: string; // UUID
  name: string; // ✅ ADDED
  email: string;
  created_at?: string; // ISO timestamp (optional in some responses)
  updated_at?: string; // ISO timestamp (optional in some responses)
}

export interface Task {
  id: number;
  user_id: string; // UUID
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// Authentication types
export interface RegisterRequest {
  name: string; // ✅ ADDED - First field
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  name: string; // ✅ ADDED
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
    name: string; // ✅ ADDED
    email: string;
  };
}

// Task CRUD types
export interface TaskCreateRequest {
  title: string;
  description?: string;
}

export interface TaskUpdateRequest {
  title: string;
  description?: string;
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
});

export const TaskUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
});

export const TaskToggleSchema = z.object({
  completed: z.boolean(),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),  // ✅ ADDED - First field
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
export type TaskToggleInput = z.infer<typeof TaskToggleSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;