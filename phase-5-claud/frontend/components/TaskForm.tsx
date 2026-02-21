'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaskCreateSchema, TaskCreateRequest, Task } from '@/lib/types';
import { createTask } from '@/lib/api';
import { Plus, AlertCircle, Sparkles, Tag, X } from 'lucide-react';
import { PriorityBadge } from './tasks/PriorityBadge';
import { DueDatePicker } from './tasks/DueDatePicker';
import { RecurrenceSelector } from './tasks/RecurrenceSelector';

interface TaskFormProps {
  onSuccess: (newTask: Task) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Phase 5: Additional state for new fields
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'monthly' | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskCreateRequest>({
    resolver: zodResolver(TaskCreateSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onSubmit = async (data: TaskCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      // Prepare task data with Phase 5 fields
      const taskData: TaskCreateRequest = {
        title: data.title,
        description: data.description,
        priority,
        tags: tags.length > 0 ? JSON.stringify(tags) : undefined,
        due_date: dueDate || undefined,
        recurrence_pattern: recurrence || undefined,
      };

      const newTask = await createTask(taskData);
      console.log('Task created successfully:', newTask);
      
      // Reset form
      reset();
      setPriority('medium');
      setDueDate(null);
      setRecurrence(null);
      setTags([]);
      setTagInput('');
      
      onSuccess(newTask);
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="bg-white shadow-sm sm:shadow-md rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300"
    >
      {/* Header */}
      <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
          Create New Task
        </h2>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 sm:mb-6 rounded-lg sm:rounded-xl bg-red-50 p-3 sm:p-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <h3 className="text-xs sm:text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4 lg:space-y-5">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className={`block w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border ${
              errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none text-sm sm:text-base transition-all duration-200`}
            placeholder="What needs to be done?"
            disabled={loading}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs sm:text-sm text-red-600 animate-in slide-in-from-top duration-200">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
            Description
            <span className="ml-1 text-xs text-gray-500">(optional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className={`shadow-sm block w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border ${
              errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            } rounded-lg focus:outline-none text-sm sm:text-base placeholder-gray-400 resize-none transition-all duration-200`}
            placeholder="Add more details about your task..."
            disabled={loading}
          />
          {errors.description && (
            <p className="mt-1.5 text-xs sm:text-sm text-red-600 animate-in slide-in-from-top duration-200">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Phase 5 Fields Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Priority Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  disabled={loading}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all touch-manipulation ${
                    priority === p
                      ? p === 'high' ? 'bg-red-100 text-red-800 border-2 border-red-300'
                        : p === 'medium' ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                        : 'bg-green-100 text-green-800 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {p === 'high' ? '🔴' : p === 'medium' ? '🟡' : '🟢'} {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
              Tags <span className="text-xs text-gray-500">(max 10)</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tag..."
                disabled={loading || tags.length >= 10}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={loading || !tagInput.trim() || tags.length >= 10}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Tag className="h-4 w-4" />
              </button>
            </div>
            {/* Tag List */}
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200"
                  >
                    <Tag className="h-3 w-3" />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={loading}
                      className="hover:text-indigo-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Due Date & Recurrence - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <DueDatePicker value={dueDate} onChange={setDueDate} showTime={true} />
          <RecurrenceSelector value={recurrence} onChange={setRecurrence} />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="group inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-semibold rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg active:scale-[0.98] touch-manipulation"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-90 transition-transform duration-300" />
                Create Task
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};