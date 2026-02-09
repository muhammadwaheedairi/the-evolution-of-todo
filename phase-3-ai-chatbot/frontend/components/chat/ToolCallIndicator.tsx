'use client'

import type { ToolCallIndicatorProps } from '@/lib/types'

export function ToolCallIndicator({ toolCalls }: ToolCallIndicatorProps) {
  // Don't render if no tools were called
  if (!toolCalls || toolCalls.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {toolCalls.map((tool, index) => (
        <span
          key={`${tool}-${index}`}
          className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium"
        >
          <span className="text-sm" aria-label="Tool executed">🛠️</span>
          {tool}
        </span>
      ))}
    </div>
  )
}