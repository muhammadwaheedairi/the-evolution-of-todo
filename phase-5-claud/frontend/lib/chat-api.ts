import type { ChatRequest, ChatResponse, Message } from './types';
import { getToken, getUserId, removeToken } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://taskflow.local';

// ============================================================================
// CHAT API CLIENT
// ============================================================================

/**
 * Send a chat message to the backend and receive AI response
 * @param userId - Authenticated user's ID
 * @param request - Chat request with message only
 * @returns Chat response with conversation_id (string), response text, and tool_calls
 */
export async function sendChatMessage(
  userId: string,
  request: ChatRequest
): Promise<ChatResponse> {
  const token = getToken();

  if (!token) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/${userId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message: request.message }),
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Authentication expired. Please login again.');
  }

  // Handle other errors
  if (!response.ok) {
    let errorMessage = `Failed to send message: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string'
          ? errorData.detail
          : 'Failed to send message';
      }
    } catch {
      // If JSON parsing fails, use default message
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get conversation history for the authenticated user
 * @param userId - Authenticated user's ID
 * @returns Array of messages in chronological order
 */
export async function getConversationHistory(
  userId: string
): Promise<Message[]> {
  const token = getToken();

  if (!token) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/${userId}/conversations/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Authentication expired. Please login again.');
  }

  // Handle 404 - no conversation found (return empty array)
  if (response.status === 404) {
    return [];
  }

  // Handle other errors
  if (!response.ok) {
    let errorMessage = `Failed to load conversation history: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string'
          ? errorData.detail
          : 'Failed to load conversation history';
      }
    } catch {
      // If JSON parsing fails, use default message
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();

  // Backend returns: {conversation_id: string, messages: [{role, content}]}
  // Convert to frontend Message format
  if (Array.isArray(data.messages)) {
    return data.messages.map((msg: any, index: number) => ({
      id: `msg-${index}-${Date.now()}`,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(), // Backend doesn't return timestamps in history
      toolCalls: undefined, // Backend doesn't return tool_calls in history
    }));
  }

  return [];
}

/**
 * Helper function to check if user is authenticated
 * Reuses the authentication check from api.ts
 */
export function isAuthenticatedForChat(): boolean {
  return !!getToken() && !!getUserId();
}
