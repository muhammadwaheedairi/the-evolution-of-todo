'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DueDatePickerProps {
  value: string | null; // ISO timestamp
  onChange: (date: string | null) => void;
  label?: string;
  showTime?: boolean;
}

export const DueDatePicker: React.FC<DueDatePickerProps> = ({
  value,
  onChange,
  label = 'Due Date',
  showTime = true,
}) => {
  const formatDateForInput = (isoString: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    if (showTime) {
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    return `${year}-${month}-${day}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      onChange(null);
      return;
    }
    
    const date = new Date(e.target.value);
    onChange(date.toISOString());
  };

  const isOverdue = value && new Date(value) < new Date();

  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
        <div className="flex items-center space-x-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>{label}</span>
        </div>
      </label>
      <div className="relative">
        <input
          type={showTime ? 'datetime-local' : 'date'}
          value={formatDateForInput(value)}
          onChange={handleChange}
          className={`block w-full px-3 py-2 text-sm border ${
            isOverdue
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          } rounded-lg focus:outline-none transition-all`}
        />
        {isOverdue && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span className="inline-flex items-center text-xs font-medium text-red-600">
              <Clock className="h-3.5 w-3.5 mr-1" />
              Overdue
            </span>
          </div>
        )}
      </div>
      {isOverdue && (
        <p className="mt-1 text-xs text-red-600">This task is past its due date</p>
      )}
    </div>
  );
};