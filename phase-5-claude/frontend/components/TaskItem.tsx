'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/lib/types';
import { toggleTaskCompletion, updateTask, deleteTask } from '@/lib/api';
import {
  CheckCircle2, Circle, Edit2, Trash2, Save, X,
  Calendar, AlertCircle, Clock, Repeat, Tag, ExternalLink,
} from 'lucide-react';
import { PriorityBadge } from './tasks/PriorityBadge';
import { TagCloud } from './tasks/TagCloud';

interface TaskItemProps {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (taskId: number) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit state — all fields
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(task.priority);
  const [dueDate, setDueDate] = useState<string>(
    task.due_date ? task.due_date.split('T')[0] : ''
  );
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'monthly' | ''>(
    task.recurrence_pattern || ''
  );
  const [tags, setTags] = useState<string[]>(
    task.tags ? (() => { try { return JSON.parse(task.tags!); } catch { return []; } })() : []
  );
  const [tagInput, setTagInput] = useState('');

  const parsedTags: string[] = task.tags
    ? (() => { try { return JSON.parse(task.tags); } catch { return []; } })()
    : [];

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleToggleComplete = async () => {
    setLoading(true);
    setError(null);
    try {
      const updated = await toggleTaskCompletion(task.id, !task.completed);
      onUpdate(updated);
    } catch (err: any) {
      setError('Failed to update task status');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError(null);
    try {
      const updated = await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        recurrence_pattern: (recurrence as 'daily' | 'weekly' | 'monthly') || undefined,
        tags: tags.length > 0 ? JSON.stringify(tags) : undefined,
      });
      onUpdate(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    setRecurrence(task.recurrence_pattern || '');
    setTags(parsedTags);
    setTagInput('');
    setError(null);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setLoading(true);
    setError(null);
    try {
      await deleteTask(task.id);
      onDelete(task.id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`group relative bg-white rounded-xl shadow-sm hover:shadow-md border transition-all duration-300
      ${task.completed ? 'opacity-75 border-gray-200' : isOverdue ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'}
      ${isEditing ? 'ring-2 ring-indigo-500' : ''}`}
    >
      {/* Error Banner */}
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-50 border-b border-red-200 rounded-t-xl px-3 py-2 z-10">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className={`p-4 sm:p-5 ${error ? 'mt-10' : ''}`}>
        <div className="flex items-start gap-3">

          {/* Checkbox */}
          <button
            onClick={handleToggleComplete}
            disabled={loading || isEditing}
            className="flex-shrink-0 mt-0.5 touch-manipulation disabled:opacity-50"
          >
            {task.completed
              ? <CheckCircle2 className="h-6 w-6 text-green-500 hover:text-green-600 transition-colors" />
              : <Circle className="h-6 w-6 text-gray-300 hover:text-indigo-500 transition-colors" />
            }
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              /* ── EDIT MODE ── */
              <div className="space-y-3">
                {/* Title */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                  disabled={loading}
                  autoFocus
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                {/* Description */}
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description (optional)"
                  disabled={loading}
                  rows={2}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Priority</label>
                  <div className="flex gap-2">
                    {(['high', 'medium', 'low'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        disabled={loading}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all ${
                          priority === p
                            ? p === 'high' ? 'bg-red-100 text-red-800 border-red-300'
                              : p === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {p === 'high' ? '🔴' : p === 'medium' ? '🟡' : '🟢'} {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={loading}
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Recurrence */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Recurrence</label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as any)}
                    disabled={loading}
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                      placeholder="Add tag, press Enter"
                      disabled={loading || tags.length >= 10}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={loading || !tagInput.trim() || tags.length >= 10}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      <Tag className="h-4 w-4" />
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200">
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                          <button type="button" onClick={() => handleRemoveTag(tag)} disabled={loading} className="hover:text-indigo-900 ml-0.5">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── VIEW MODE ── */
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-sm sm:text-base font-medium break-words flex-1
                    ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  <PriorityBadge priority={task.priority} size="sm" />
                </div>

                {task.description && (
                  <p className="text-xs sm:text-sm text-gray-600 break-words line-clamp-2">{task.description}</p>
                )}

                {parsedTags.length > 0 && <TagCloud tags={parsedTags} size="sm" />}

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500">
                  {task.due_date && (
                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                      <Clock className="h-3 w-3" />
                      <span>{isOverdue ? '⚠️ ' : ''}Due: {formatDate(task.due_date)}</span>
                    </div>
                  )}
                  {task.recurrence_pattern && (
                    <div className="flex items-center gap-1 text-indigo-600">
                      <Repeat className="h-3 w-3" />
                      <span>Repeats {task.recurrence_pattern}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created {formatDate(task.created_at)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading || !title.trim()}
                  className="p-1.5 sm:p-2 text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 transition-colors"
                  title="Save"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="p-1.5 sm:p-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 transition-colors"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                {/* Open individual task page */}
                <button
                  onClick={() => router.push(`/tasks/${task.id}`)}
                  disabled={loading}
                  className="p-1.5 sm:p-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg opacity-0 group-hover:opacity-100 sm:opacity-100 transition-all"
                  title="Open task"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                  className="p-1.5 sm:p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg opacity-0 group-hover:opacity-100 sm:opacity-100 transition-all"
                  title="Edit task"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="p-1.5 sm:p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 sm:opacity-100 transition-all"
                  title="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && !isEditing && (
          <div className="mt-2 flex items-center gap-2 text-xs text-indigo-600">
            <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Updating...</span>
          </div>
        )}
      </div>

      {/* Completed Badge */}
      {task.completed && !isEditing && (
        <div className="hidden sm:block absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>
        </div>
      )}

      {/* Overdue Badge */}
      {isOverdue && !isEditing && (
        <div className="hidden sm:block absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">⚠️ Overdue</span>
        </div>
      )}
    </div>
  );
};