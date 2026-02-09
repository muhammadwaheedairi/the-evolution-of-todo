'use client'

import { useEffect, useRef } from 'react'
import type { MessageListProps } from '@/lib/types'
import { ToolCallIndicator } from './ToolCallIndicator'

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Empty state
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-4xl">💬</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Start chatting with AI
          </h3>
          <p className="text-gray-600 mb-8">
            Manage tasks naturally. Try these examples:
          </p>
          <div className="space-y-3 text-sm text-left">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100 hover:border-indigo-300 transition-colors">
              <span className="font-medium text-indigo-600">💬</span>{' '}
              <span className="text-gray-700">"add task buy groceries"</span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100 hover:border-indigo-300 transition-colors">
              <span className="font-medium text-indigo-600">💬</span>{' '}
              <span className="text-gray-700">"show me all pending tasks"</span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100 hover:border-indigo-300 transition-colors">
              <span className="font-medium text-indigo-600">💬</span>{' '}
              <span className="text-gray-700">"mark task 3 as done"</span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100 hover:border-indigo-300 transition-colors">
              <span className="font-medium text-indigo-600">💬</span>{' '}
              <span className="text-gray-700">"delete the meeting task"</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                : 'bg-white text-gray-900 rounded-tl-sm shadow-md border border-gray-100'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </p>

            {/* Tool execution badges for assistant messages */}
            {message.role === 'assistant' && message.toolCalls && (
              <ToolCallIndicator toolCalls={message.toolCalls} />
            )}

            {/* Timestamp */}
            <p
              className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'
              }`}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-xs rounded-2xl rounded-tl-sm px-4 py-3 bg-white shadow-md border border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  )
}