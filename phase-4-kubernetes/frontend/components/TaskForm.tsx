'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaskCreateSchema, TaskCreateRequest, Task } from '@/lib/types';
import { createTask } from '@/lib/api';
import { Plus, AlertCircle, Sparkles } from 'lucide-react';

interface TaskFormProps {
  onSuccess: (newTask: Task) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const onSubmit = async (data: TaskCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const newTask = await createTask(data);
      console.log('Task created successfully:', newTask);
      
      reset();
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
      {/* Header - Responsive */}
      <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
          Create New Task
        </h2>
      </div>

      {/* Error Alert - Responsive */}
      {error && (
        <div className="mb-4 sm:mb-6 rounded-lg sm:rounded-xl bg-red-50 p-3 sm:p-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-xs sm:text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4 lg:space-y-5">
        {/* Title Field - Responsive */}
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

        {/* Description Field - Responsive */}
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

        {/* Submit Button - Fully Responsive */}
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