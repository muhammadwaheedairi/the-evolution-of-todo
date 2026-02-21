'use client'

import { useState, KeyboardEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import type { ChatInputProps } from '@/lib/types'

export function ChatInput({ onSendMessage, disabled, placeholder }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [charCount, setCharCount] = useState(0)
  const maxLength = 2000

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= maxLength) {
      setInputValue(value)
      setCharCount(value.length)
    }
  }

  const handleSend = () => {
    const trimmedMessage = inputValue.trim()
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage)
      setInputValue('')
      setCharCount(0)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isNearLimit = charCount >= 1800
  const isEmpty = inputValue.trim().length === 0

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Try: 'add high priority task X due tomorrow tagged work'"}
          disabled={disabled}
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
        />
        <button
          onClick={handleSend}
          disabled={disabled || isEmpty}
          className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-95"
          aria-label="Send message"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Character count warning */}
      {isNearLimit && (
        <div className="mt-2 text-right animate-in slide-in-from-bottom duration-200">
          <span className={`text-xs ${charCount >= maxLength ? 'text-red-600 font-medium' : 'text-yellow-600'}`}>
            {charCount}/{maxLength} characters
          </span>
        </div>
      )}
    </div>
  )
}