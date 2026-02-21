import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskToggleRequest,
  TaskResponse,
  TaskListResponse,
  APIError,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://taskflow.local';

// ============================================================================
// LOCAL STORAGE HELPERS
// ============================================================================

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', token);
  document.cookie = `access_token=${token}; path=/; max-age=604800; SameSite=Lax`;
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_name');
  localStorage.removeItem('user_email');
  
  document.cookie = 'access_token=; path=/; max-age=0';
  document.cookie = 'user_id=; path=/; max-age=0';
}

export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_id');
}

export function setUserId(userId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user_id', userId);
  document.cookie = `user_id=${userId}; path=/; max-age=604800; SameSite=Lax`;
}

export function getUserName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_name');
}

export function setUserName(name: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user_name', name);
}

export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_email');
}

export function setUserEmail(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user_email', email);
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getUserId();
}

// ============================================================================
// AUTHENTICATED FETCH HELPER
// ============================================================================

async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData: APIError = await response.json();
      if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail.map(err => err.msg).join(', ');
      }
    } catch {
      // If JSON parsing fails, use default message
    }
    throw new Error(errorMessage);
  }

  return response;
}

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData: APIError = await response.json();
    throw new Error(typeof errorData.detail === 'string' ? errorData.detail : 'Registration failed');
  }

  return response.json();
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData: APIError = await response.json();
    throw new Error(typeof errorData.detail === 'string' ? errorData.detail : 'Login failed');
  }

  const loginData: LoginResponse = await response.json();

  setToken(loginData.access_token);
  setUserId(loginData.user.id);
  setUserName(loginData.user.name);
  setUserEmail(loginData.user.email);

  return loginData;
}

export function logout(): void {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// ============================================================================
// TASKS API
// ============================================================================

export async function listTasks(params?: Record<string, string>): Promise<TaskListResponse> {
  const userId = getUserId();
  if (!userId) throw new Error('User not authenticated');

  // Build query string from params
  const queryParams = new URLSearchParams({ url_user_id: userId });
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      // Map 'status' to 'status_filter' for backend
      const paramKey = key === 'status' ? 'status_filter' : key;
      queryParams.append(paramKey, value);
    });
  }

  const response = await authenticatedFetch(
    `${API_URL}/api/${userId}/tasks?${queryParams.toString()}`
  );

  return response.json();
}

export async function getTask(taskId: number): Promise<TaskResponse> {
  const userId = getUserId();
  if (!userId) throw new Error('User not authenticated');

  const response = await authenticatedFetch(
    `${API_URL}/api/${userId}/tasks/${taskId}?url_user_id=${userId}`
  );

  return response.json();
}

export async function createTask(data: TaskCreateRequest): Promise<TaskResponse> {
  const userId = getUserId();
  if (!userId) throw new Error('User not authenticated');

  const response = await authenticatedFetch(
    `${API_URL}/api/${userId}/tasks?url_user_id=${userId}`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );

  return response.json();
}

export async function updateTask(taskId: number, data: TaskUpdateRequest): Promise<TaskResponse> {
  const userId = getUserId();
  if (!userId) throw new Error('User not authenticated');

  const response = await authenticatedFetch(
    `${API_URL}/api/${userId}/tasks/${taskId}?url_user_id=${userId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );

  return response.json();
}

export async function toggleTaskCompletion(taskId: number, completed: boolean): Promise<TaskResponse> {
  const userId = getUserId();
  if (!userId) throw new Error('User not authenticated');

  const response = await authenticatedFetch(
    `${API_URL}/api/${userId}/tasks/${taskId}/complete?url_user_id=${userId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    }
  );

  return response.json();
}

export async function deleteTask(taskId: number): Promise<void> {
  const userId = getUserId();
  if (!userId) throw new Error('User not authenticated');

  await authenticatedFetch(
    `${API_URL}/api/${userId}/tasks/${taskId}?url_user_id=${userId}`,
    {
      method: 'DELETE',
    }
  );
}