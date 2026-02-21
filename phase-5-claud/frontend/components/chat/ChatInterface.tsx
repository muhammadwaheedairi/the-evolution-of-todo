'use client'

import { useState, useEffect } from 'react'
import { getUserId } from '@/lib/api'
import { sendChatMessage, getConversationHistory } from '@/lib/chat-api'
import type { Message, ChatState } from '@/lib/types'
import { ChatInput } from './ChatInput'
import { MessageList } from './MessageList'
import { Bot } from 'lucide-react'

export function ChatInterface() {
  const [state, setState] = useState<ChatState>({
    conversationId: null,
    messages: [],
    isLoading: false,
    error: null,
  })
  const [isInitializing, setIsInitializing] = useState(true)

  // Load conversation history on mount
  useEffect(() => {
    const loadHistory = async () => {
      const userId = getUserId()
      if (!userId) {
        setIsInitializing(false)
        return
      }

      try {
        const history = await getConversationHistory(userId)
        if (history.length > 0) {
          setState(prev => ({
            ...prev,
            messages: history,
            conversationId: prev.conversationId || null,
          }))
        }
      } catch (error) {
        console.error('Failed to load conversation history:', error)
        if (error instanceof Error && !error.message.includes('404')) {
          setState(prev => ({
            ...prev,
            error: 'Failed to load conversation history',
          }))
        }
      } finally {
        setIsInitializing(false)
      }
    }

    loadHistory()
  }, [])

  const handleSendMessage = async (messageText: string) => {
    const userId = getUserId()
    if (!userId) {
      setState(prev => ({ ...prev, error: 'Not authenticated' }))
      return
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }))

    try {
      const response = await sendChatMessage(userId, {
        message: messageText,
      })

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        toolCalls: response.tool_calls.length > 0 ? response.tool_calls : undefined,
      }

      setState(prev => ({
        ...prev,
        conversationId: response.conversation_id,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }))
    } catch (error) {
      console.error('Failed to send message:', error)

      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to send message. Please try again.'

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
    }
  }

  // Show consistent interface from the start - no flickering!
  return (
    <div className="h-full flex flex-col">
      {/* Chat Header - Always visible */}
      <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 border-b border-indigo-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-bold text-white">AI Assistant</h3>
              <p className="text-xs text-indigo-200">Always ready to help</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-white font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {state.error && (
        <div className="flex-shrink-0 bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-800">{state.error}</p>
            <button
              onClick={() => setState(prev => ({ ...prev, error: null }))}
              className="text-red-600 hover:text-red-800 text-xl leading-none font-bold"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        {isInitializing ? (
          // Show loading state while initializing
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading conversation...</p>
            </div>
          </div>
        ) : (
          <MessageList messages={state.messages} isLoading={state.isLoading} />
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={state.isLoading || isInitializing}
          placeholder="Type: 'add task buy groceries'..."
        />
      </div>
    </div>
  )
}