'use client';

import React from 'react';
import { Tag, X } from 'lucide-react';

interface TagCloudProps {
  tags: string[]; // JSON parsed array
  onTagClick?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  editable?: boolean;
  size?: 'sm' | 'md';
}

export const TagCloud: React.FC<TagCloudProps> = ({
  tags,
  onTagClick,
  onTagRemove,
  editable = false,
  size = 'md',
}) => {
  if (!tags || tags.length === 0) return null;

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          onClick={() => onTagClick && onTagClick(tag)}
          className={`inline-flex items-center space-x-1 ${sizeClasses[size]} bg-indigo-100 text-indigo-800 rounded-full font-medium border border-indigo-200 ${
            onTagClick ? 'cursor-pointer hover:bg-indigo-200 transition-colors' : ''
          }`}
        >
          <Tag className="h-3 w-3" />
          <span>{tag}</span>
          {editable && onTagRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTagRemove(tag);
              }}
              className="ml-0.5 hover:text-indigo-900 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}
    </div>
  );
};