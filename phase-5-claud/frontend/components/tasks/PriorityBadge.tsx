'use client';

import React from 'react';
import { AlertCircle, MinusCircle, CheckCircle } from 'lucide-react';

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showIcon = true,
}) => {
  const config = {
    high: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      icon: AlertCircle,
      label: 'High',
      emoji: '🔴',
    },
    medium: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      icon: MinusCircle,
      label: 'Medium',
      emoji: '🟡',
    },
    low: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      icon: CheckCircle,
      label: 'Low',
      emoji: '🟢',
    },
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  const { bg, text, border, icon: Icon, label, emoji } = config[priority];

  return (
    <span
      className={`inline-flex items-center space-x-1 ${sizeClasses[size]} ${bg} ${text} border ${border} rounded-full font-medium`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{label}</span>
    </span>
  );
};