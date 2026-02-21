'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import TaskFilters, { TaskFilterState } from '@/components/tasks/TaskFilters';
import { isAuthenticated, getUserName } from '@/lib/api';
import { Task } from '@/lib/types';
import { Plus, Bell, BellOff, X, LayoutList, Columns3 } from 'lucide-react';
import { useNotifications } from '@/lib/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import KanbanBoard from '@/components/KanbanBoard';
import confetti from 'canvas-confetti';

type ViewMode = 'list' | 'kanban';

const TasksPage = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskListKey, setTaskListKey] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<TaskFilterState>({
    status: 'all',
    priority: undefined,
    tags: [],
    due_date_start: null,
    due_date_end: null,
    sortBy: 'created_at',
    sortOrder: 'desc',
    search: '',
  });

  const {
    notifications,
    isConnected,
    permissionGranted,
    requestPermission,
    clearNotifications,
  } = useNotifications();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    const name = getUserName();
    setUserName(name);
  }, [router]);

  // 🎉 Confetti — called when any task is marked complete
  const fireConfetti = useCallback(() => {
    const count = 180;
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
    };

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#6366f1', '#8b5cf6'] });
    fire(0.20, { spread: 60, colors: ['#a855f7', '#ec4899'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#fbbf24', '#f97316'] });
    fire(0.10, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#10b981', '#06b6d4'] });
    fire(0.10, { spread: 120, startVelocity: 45, colors: ['#6366f1', '#a855f7'] });
  }, []);

  const handleTaskCreated = (newTask: Task) => {
    setTaskListKey((prev) => prev + 1);
    setShowTaskForm(false);
  };

  const handleFiltersChange = (newFilters: TaskFilterState) => {
    setFilters(newFilters);
    setTaskListKey((prev) => prev + 1);
  };

  if (!userName) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-4 sm:space-y-6">

          {/* ── PAGE HERO BAR ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4"
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task List</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Create, filter, and manage your tasks
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">

              {/* Live Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                <span className="text-xs font-medium text-gray-600">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>

              {/* Enable Notifications */}
              {!permissionGranted && (
                <motion.button
                  onClick={requestPermission}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 hover:bg-indigo-100 transition-colors"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <BellOff className="h-3 w-3" />
                  Enable notifications
                </motion.button>
              )}

              {/* ── VIEW TOGGLE ── */}
              <div className="flex items-center p-1 bg-gray-100 rounded-xl gap-0.5">
                {([
                  { mode: 'list' as ViewMode, Icon: LayoutList, label: 'List' },
                  { mode: 'kanban' as ViewMode, Icon: Columns3, label: 'Board' },
                ]).map(({ mode, Icon, label }) => (
                  <motion.button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      viewMode === mode ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {viewMode === mode && (
                      <motion.div
                        layoutId="viewTogglePill"
                        className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">{label}</span>
                  </motion.button>
                ))}
              </div>

              {/* New Task Button */}
              {!showTaskForm && (
                <motion.button
                  onClick={() => setShowTaskForm(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md shadow-indigo-500/25"
                  whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(99,102,241,0.35)' }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Task
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* ── NOTIFICATION BANNER ── */}
          <AnimatePresence>
            {notifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-4 rounded-xl shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Bell className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-indigo-900">
                        {notifications[0].message}
                      </p>
                      {notifications.length > 1 && (
                        <p className="text-xs text-indigo-600 mt-1">
                          +{notifications.length - 1} more notifications
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={clearNotifications}
                    className="text-indigo-400 hover:text-indigo-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── CREATE TASK FORM ── */}
          <AnimatePresence>
            {showTaskForm && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <TaskForm onSuccess={handleTaskCreated} />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setShowTaskForm(false)}
                    className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── LIST VIEW: show filters + TaskList ── */}
          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4 sm:space-y-6"
              >
                <TaskFilters filters={filters} onFiltersChange={handleFiltersChange} />
                <TaskList key={taskListKey} filters={filters} />
              </motion.div>
            ) : (
              <motion.div
                key="kanban-view"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <KanbanBoard key={taskListKey} onTaskComplete={fireConfetti} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
};

export default TasksPage;