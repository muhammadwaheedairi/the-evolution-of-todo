'use client';

import React, { useState } from 'react';
import { Filter, X, Search, ArrowUpDown } from 'lucide-react';

export interface TaskFilterState {
  status: 'all' | 'pending' | 'completed';
  priority?: 'high' | 'medium' | 'low';
  tags: string[];
  due_date_start: string | null;
  due_date_end: string | null;
  sortBy: 'created_at' | 'due_date' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
  search?: string;  // 🆕 Added search field
}

interface TaskFiltersProps {
  filters: TaskFilterState;
  onFiltersChange: (filters: TaskFilterState) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ filters, onFiltersChange }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleStatusChange = (status: 'all' | 'pending' | 'completed') => {
    onFiltersChange({ ...filters, status });
  };

  const handlePriorityChange = (priority: 'high' | 'medium' | 'low' | undefined) => {
    onFiltersChange({ ...filters, priority });
  };

  const handleSortChange = (sortBy: TaskFilterState['sortBy']) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const toggleSortOrder = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  // 🆕 Handle search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleReset = () => {
    onFiltersChange({
      status: 'all',
      priority: undefined,
      tags: [],
      due_date_start: null,
      due_date_end: null,
      sortBy: 'created_at',
      sortOrder: 'desc',
      search: '',
    });
    setShowFilters(false);
  };

  const activeFiltersCount = [
    filters.status !== 'all',
    filters.priority !== undefined,
    filters.tags.length > 0,
    filters.due_date_start !== null,
    filters.search && filters.search.trim() !== '',
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">
            Filters & Search
          </h3>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {/* Filters - Show always on desktop, toggle on mobile */}
      <div className={`${showFilters ? 'block' : 'hidden'} sm:block space-y-3 sm:space-y-4`}>
        
        {/* 🆕 Search Bar - Connected to filters state */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <div className="flex space-x-1">
              {(['all', 'pending', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-all touch-manipulation ${
                    filters.status === status
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Priority
            </label>
            <select
              value={filters.priority || ''}
              onChange={(e) =>
                handlePriorityChange(
                  e.target.value ? (e.target.value as 'high' | 'medium' | 'low') : undefined
                )
              }
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                handleSortChange(e.target.value as TaskFilterState['sortBy'])
              }
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="created_at">Created Date</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Order
            </label>
            <button
              onClick={toggleSortOrder}
              className="w-full inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
            >
              <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
              {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>

        {/* Reset Button */}
        {activeFiltersCount > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleReset}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors touch-manipulation"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskFilters;