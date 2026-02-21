'use client';

import React from 'react';
import { Repeat, Calendar } from 'lucide-react';

interface RecurrenceSelectorProps {
  value: 'daily' | 'weekly' | 'monthly' | null;
  onChange: (pattern: 'daily' | 'weekly' | 'monthly' | null) => void;
  label?: string;
}

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  value,
  onChange,
  label = 'Recurrence',
}) => {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
        <div className="flex items-center space-x-1.5">
          <Repeat className="h-3.5 w-3.5" />
          <span>{label}</span>
        </div>
      </label>
      <select
        value={value || ''}
        onChange={(e) =>
          onChange(e.target.value ? (e.target.value as 'daily' | 'weekly' | 'monthly') : null)
        }
        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
      >
        <option value="">No Recurrence</option>
        <option value="daily">🔄 Daily - Repeats every day</option>
        <option value="weekly">📅 Weekly - Repeats every week</option>
        <option value="monthly">📆 Monthly - Repeats every month</option>
      </select>
      {value && (
        <p className="mt-1.5 text-xs text-indigo-600 flex items-center space-x-1">
          <Repeat className="h-3 w-3" />
          <span>
            Task will auto-create next occurrence when completed
          </span>
        </p>
      )}
    </div>
  );
};