'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/lib/types';
import { TaskItem } from './TaskItem';
import { listTasks } from '@/lib/api';
import { Loader2, AlertCircle, ListTodo, RefreshCw } from 'lucide-react';
import { TaskFilterState } from './tasks/TaskFilters';

interface TaskListProps {
  filters: TaskFilterState;
}

export const TaskList: React.FC<TaskListProps> = ({ filters }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params from filters
      const params: Record<string, string> = {};
      
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      
      if (filters.priority) {
        params.priority = filters.priority;
      }
      
      if (filters.sortBy) {
        params.sort_by = filters.sortBy;
      }
      
      if (filters.sortOrder) {
        params.sort_order = filters.sortOrder;
      }

      // 🆕 Send search to backend
      if (filters.search && filters.search.trim() !== '') {
        params.search = filters.search.trim();
      }

      const response = await listTasks(params);
      
      // Apply client-side filtering for tags
      let filteredTasks = response.tasks;
      
      if (filters.tags && filters.tags.length > 0) {
        filteredTasks = filteredTasks.filter(task => {
          if (!task.tags) return false;
          try {
            const taskTags = JSON.parse(task.tags);
            return filters.tags.some(filterTag => taskTags.includes(filterTag));
          } catch {
            return false;
          }
        });
      }
      
      setTasks(filteredTasks);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleUpdate = (updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleDelete = (taskId: number) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  // Loading State
  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="text-center py-8 sm:py-12">
          <Loader2 className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-indigo-600 animate-spin" />
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 font-medium">
            Loading your tasks...
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2 sm:space-y-3">
                  <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="rounded-lg sm:rounded-xl bg-red-50 p-4 sm:p-6 shadow-sm">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 flex-shrink-0" />
          <div className="ml-3 sm:ml-4 flex-1">
            <h3 className="text-sm sm:text-base font-semibold text-red-800">
              Error loading tasks
            </h3>
            <div className="mt-2 text-xs sm:text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchTasks}
                className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors touch-manipulation"
              >
                <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 lg:py-20 bg-white rounded-lg sm:rounded-xl shadow-sm border-2 border-dashed border-gray-200">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
          <ListTodo className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600" />
        </div>
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2">
          No tasks found
        </h3>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600 max-w-sm mx-auto px-4">
          {filters.status !== 'all' || filters.priority || filters.tags.length > 0 || filters.search
            ? 'No tasks match your filters. Try adjusting your search criteria.'
            : 'Get started by creating your first task above. Stay organized and productive!'}
        </p>
      </div>
    );
  }

  // Task List
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Stats Header */}
      <div className="flex items-center justify-between px-1 sm:px-2">
        <div className="flex items-center space-x-2">
          <ListTodo className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <p className="text-xs sm:text-sm font-medium text-gray-600">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-500">
          <span>{tasks.filter(t => t.completed).length} completed</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{tasks.filter(t => !t.completed).length} pending</span>
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Bottom Info */}
      <div className="text-center pt-4 sm:pt-6">
        <p className="text-xs text-gray-500">
          Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} • Last updated just now
        </p>
      </div>
    </div>
  );
};