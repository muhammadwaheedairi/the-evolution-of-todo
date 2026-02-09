import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title = "No tasks yet",
  message = "Get started by creating your first task.",
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-6 text-gray-400">
        {icon || (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}