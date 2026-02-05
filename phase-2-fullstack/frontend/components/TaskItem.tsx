'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/types';
import { toggleTaskCompletion, updateTask, deleteTask } from '@/lib/api';
import { CheckCircle2, Circle, Edit2, Trash2, Save, X, Calendar, AlertCircle } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (taskId: number) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [completed, setCompleted] = useState(task.completed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      const updatedTask = await toggleTaskCompletion(task.id, !completed);
      setCompleted(!completed);
      onUpdate(updatedTask);
    } catch (err: any) {
      setError('Failed to update task status');
      console.error('Error updating task status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedTask = await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });

      onUpdate(updatedTask);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      setLoading(true);
      setError(null);

      try {
        await deleteTask(task.id);
        onDelete(task.id);
      } catch (err: any) {
        setError(err.message || 'Failed to delete task');
        console.error('Error deleting task:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTitle(task.title);
    setDescription(task.description || '');
    setError(null);
  };

  return (
    <div className={`group relative bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 ${
      completed ? 'opacity-75' : ''
    } ${isEditing ? 'ring-2 ring-indigo-500' : ''}`}>
      {/* Error Banner - Responsive */}
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-50 border-b border-red-200 rounded-t-lg sm:rounded-t-xl px-3 py-2 animate-in slide-in-from-top duration-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className={`p-3 sm:p-4 lg:p-5 ${error ? 'mt-10 sm:mt-12' : ''}`}>
        <div className="flex items-start space-x-3">
          {/* Checkbox - Touch-optimized */}
          <button
            onClick={handleToggleComplete}
            disabled={loading || isEditing}
            className="flex-shrink-0 mt-0.5 sm:mt-1 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {completed ? (
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 hover:text-green-600 transition-colors" />
            ) : (
              <Circle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300 hover:text-indigo-500 transition-colors" />
            )}
          </button>

          {/* Task Content - Responsive */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              /* Edit Mode - Responsive */
              <div className="space-y-2 sm:space-y-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Task title"
                  disabled={loading}
                  autoFocus
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  rows={2}
                  placeholder="Task description (optional)"
                  disabled={loading}
                />
              </div>
            ) : (
              /* View Mode - Responsive */
              <div>
                <h3 className={`text-sm sm:text-base font-medium break-words ${
                  completed ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}>
                  {title}
                </h3>
                {description && (
                  <p className="mt-1 text-xs sm:text-sm text-gray-600 break-words line-clamp-2">
                    {description}
                  </p>
                )}
                {/* Timestamps - Responsive */}
                <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(task.created_at).toLocaleDateString()}</span>
                  </div>
                  {task.updated_at !== task.created_at && (
                    <span className="hidden sm:inline">• Updated {new Date(task.updated_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Responsive */}
          <div className="flex-shrink-0 flex items-center space-x-1 sm:space-x-2">
            {isEditing ? (
              /* Edit Mode Buttons */
              <>
                <button
                  onClick={handleSave}
                  disabled={loading || !title.trim()}
                  className="inline-flex items-center justify-center p-1.5 sm:p-2 text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                  title="Save changes"
                >
                  <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="inline-flex items-center justify-center p-1.5 sm:p-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                  title="Cancel"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </>
            ) : (
              /* View Mode Buttons */
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                  className="inline-flex items-center justify-center p-1.5 sm:p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg opacity-0 group-hover:opacity-100 sm:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
                  title="Edit task"
                >
                  <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="inline-flex items-center justify-center p-1.5 sm:p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 sm:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
                  title="Delete task"
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && !isEditing && (
          <div className="mt-2 flex items-center space-x-2 text-xs text-indigo-600">
            <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Updating...</span>
          </div>
        )}
      </div>

      {/* Completion Badge - Only on desktop */}
      {completed && (
        <div className="hidden sm:block absolute top-2 right-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        </div>
      )}
    </div>
  );
};