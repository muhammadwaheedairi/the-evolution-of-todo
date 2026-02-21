'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Task } from '@/lib/types';
import { getTask, updateTask, deleteTask, toggleTaskCompletion, isAuthenticated } from '@/lib/api';
import {
  ArrowLeft, Save, Trash2, CheckCircle2, Circle,
  AlertCircle, Loader2, Calendar, Repeat, Tag, X,
  Clock, Edit3, CheckSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';

const PRIORITY_CONFIG = {
  high:   { label: 'High',   emoji: '🔴', active: 'bg-red-100 text-red-800 border-red-300',     dot: 'bg-red-500'    },
  medium: { label: 'Medium', emoji: '🟡', active: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-400'  },
  low:    { label: 'Low',    emoji: '🟢', active: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
};

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = Number(params.id);

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Edit fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'monthly' | ''>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Load task
  const loadTask = useCallback(async () => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    try {
      setLoading(true);
      setError(null);
      const data = await getTask(taskId);
      setTask(data);
      // Populate edit fields
      setTitle(data.title);
      setDescription(data.description || '');
      setPriority(data.priority);
      setDueDate(data.due_date ? data.due_date.split('T')[0] : '');
      setRecurrence(data.recurrence_pattern || '');
      setTags(data.tags ? (() => { try { return JSON.parse(data.tags!); } catch { return []; } })() : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  }, [taskId, router]);

  useEffect(() => { loadTask(); }, [loadTask]);

  const handleSave = async () => {
    if (!title.trim()) { setSaveError('Title is required'); return; }
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateTask(taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        recurrence_pattern: (recurrence as 'daily' | 'weekly' | 'monthly') || undefined,
        tags: tags.length > 0 ? JSON.stringify(tags) : undefined,
      });
      setTask(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!task) return;
    setSaving(true);
    try {
      const updated = await toggleTaskCompletion(task.id, !task.completed);
      setTask(updated);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    setSaving(true);
    try {
      await deleteTask(taskId);
      router.push('/tasks');
    } catch (err: any) {
      setSaveError(err.message || 'Failed to delete');
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const isOverdue = task?.due_date && new Date(task.due_date) < new Date() && !task.completed;

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading task...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-4">{error || 'Task not found'}</p>
          <button onClick={() => router.push('/tasks')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  const pCfg = PRIORITY_CONFIG[priority];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* ── TOP BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => router.push('/tasks')}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tasks
          </button>

          <div className="flex items-center gap-2">
            {/* Toggle complete */}
            <motion.button
              onClick={handleToggleComplete}
              disabled={saving}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                task.completed
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              {task.completed
                ? <><Circle className="w-4 h-4" /> Mark Pending</>
                : <><CheckCircle2 className="w-4 h-4" /> Mark Done</>
              }
            </motion.button>

            {/* Delete */}
            <motion.button
              onClick={handleDelete}
              disabled={saving}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </motion.button>
          </div>
        </motion.div>

        {/* ── MAIN CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Card top strip — priority color */}
          <div className={`h-1.5 w-full ${pCfg.dot}`} />

          <div className="p-6 sm:p-8 space-y-6">

            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              {task.completed && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                  <CheckSquare className="w-3.5 h-3.5" /> Completed
                </span>
              )}
              {isOverdue && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                  <AlertCircle className="w-3.5 h-3.5" /> Overdue
                </span>
              )}
              <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                <Edit3 className="w-3 h-3" /> Task #{task.id}
              </span>
            </div>

            {/* Save error */}
            {saveError && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {saveError}
              </div>
            )}

            {/* Saved success */}
            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium"
              >
                <CheckCircle2 className="w-4 h-4" /> Task saved successfully!
              </motion.div>
            )}

            {/* ── TITLE ── */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving}
                placeholder="Task title"
                className="block w-full px-4 py-3 text-gray-900 font-semibold text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* ── DESCRIPTION ── */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
                rows={4}
                placeholder="Add a description..."
                className="block w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
              />
            </div>

            {/* ── PRIORITY ── */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Priority</label>
              <div className="flex gap-3">
                {(['high', 'medium', 'low'] as const).map((p) => (
                  <motion.button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    disabled={saving}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all ${
                      priority === p
                        ? PRIORITY_CONFIG[p].active
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {PRIORITY_CONFIG[p].emoji} {PRIORITY_CONFIG[p].label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── DUE DATE + RECURRENCE ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Due Date</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={saving}
                  className="block w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-1.5"><Repeat className="w-3 h-3" /> Recurrence</span>
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as any)}
                  disabled={saving}
                  className="block w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            {/* ── TAGS ── */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5"><Tag className="w-3 h-3" /> Tags</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  placeholder="Type tag and press Enter"
                  disabled={saving || tags.length >= 10}
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={saving || !tagInput.trim() || tags.length >= 10}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-200">
                      <Tag className="w-3 h-3" /> {tag}
                      <button onClick={() => setTags(tags.filter(t => t !== tag))} disabled={saving} className="hover:text-indigo-900 ml-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── TASK META INFO ── */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Task Info</p>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Created: {formatDate(task.created_at)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Updated: {formatDate(task.updated_at)}
                </div>
              </div>
            </div>

            {/* ── SAVE BUTTON ── */}
            <motion.button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-5 h-5" /> Save Changes</>
              )}
            </motion.button>

          </div>
        </motion.div>
      </div>
    </div>
  );
}