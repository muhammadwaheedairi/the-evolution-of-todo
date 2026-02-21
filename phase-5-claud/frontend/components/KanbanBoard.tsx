'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/lib/types';
import { listTasks } from '@/lib/api';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Tag,
  Loader2,
  LayoutGrid,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
  Flame,
} from 'lucide-react';

// ── PRIORITY CONFIG ───────────────────────────────────────────────────────────
const PRIORITY_STYLES: Record<Task['priority'], { badge: string; bar: string; label: string }> = {
  high:   { badge: 'bg-red-100 text-red-700 border border-red-200',     bar: 'bg-red-500',    label: 'High'   },
  medium: { badge: 'bg-amber-100 text-amber-700 border border-amber-200', bar: 'bg-amber-400',  label: 'Medium' },
  low:    { badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', bar: 'bg-emerald-500', label: 'Low' },
};

// ── DUE DATE HELPER ───────────────────────────────────────────────────────────
function getDueDateStatus(due_date: string | null): { label: string; cls: string } | null {
  if (!due_date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(due_date);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0)  return { label: 'Overdue!',   cls: 'bg-red-500 text-white' };
  if (diff === 0) return { label: 'Due Today!', cls: 'bg-orange-500 text-white' };
  if (diff === 1) return { label: 'Due Tomorrow', cls: 'bg-amber-400 text-white' };
  return null;
}

// ── TASK CARD ─────────────────────────────────────────────────────────────────
function TaskCard({ task }: { task: Task }) {
  const p = PRIORITY_STYLES[task.priority];
  const dueBadge = getDueDateStatus(task.due_date);

  let parsedTags: string[] = [];
  if (task.tags) {
    try { parsedTags = JSON.parse(task.tags); } catch { parsedTags = []; }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
      className={`relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden
        ${task.completed ? 'opacity-60' : ''}`}
    >
      {/* Priority color bar on left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${p.bar} rounded-l-xl`} />

      <div className="pl-4 pr-4 pt-3 pb-3">
        {/* Top row */}
        <div className="flex items-start gap-2 mb-1.5">
          <p className={`flex-1 text-sm font-semibold text-gray-800 leading-snug
            ${task.completed ? 'line-through text-gray-400' : ''}`}>
            {task.title}
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${p.badge}`}>
            {p.label}
          </span>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {/* Due date warning badge */}
          {dueBadge && (
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${dueBadge.cls}`}>
              <AlertTriangle className="w-2.5 h-2.5" />
              {dueBadge.label}
            </span>
          )}

          {/* Normal due date */}
          {task.due_date && !dueBadge && (
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.due_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}

          {/* Tags */}
          {parsedTags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />{tag}
            </span>
          ))}
          {parsedTags.length > 2 && (
            <span className="text-[10px] text-gray-400">+{parsedTags.length - 2}</span>
          )}

          {/* Recurring */}
          {task.recurrence_pattern && (
            <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded-full">
              🔄 {task.recurrence_pattern}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── PROGRESS RING ─────────────────────────────────────────────────────────────
function ProgressRing({ percent }: { percent: number }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width="36" height="36" className="-rotate-90">
      <circle cx="18" cy="18" r={r} fill="none" stroke="#d1fae5" strokeWidth="3" />
      <motion.circle
        cx="18" cy="18" r={r}
        fill="none"
        stroke="#10b981"
        strokeWidth="3"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── STATS BAR ─────────────────────────────────────────────────────────────────
function StatsBar({ pending, completed }: { pending: Task[]; completed: Task[] }) {
  const total = pending.length + completed.length;
  const percent = total === 0 ? 0 : Math.round((completed.length / total) * 100);
  const overdue = pending.filter(t => getDueDateStatus(t.due_date)?.label === 'Overdue!').length;
  const highPriority = pending.filter(t => t.priority === 'high').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 mb-5"
    >
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
        <span className="text-sm font-bold text-emerald-600">{percent}%</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: LayoutGrid,   label: 'Total',       value: total,             color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { icon: Clock,        label: 'Pending',      value: pending.length,    color: 'text-amber-600',  bg: 'bg-amber-50'  },
          { icon: CheckCircle2, label: 'Completed',    value: completed.length,  color: 'text-emerald-600',bg: 'bg-emerald-50'},
          { icon: Flame,        label: 'High Priority',value: highPriority,      color: 'text-red-600',    bg: 'bg-red-50'   },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`flex items-center gap-3 px-3 py-2.5 ${bg} rounded-xl`}>
            <div className={`w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className={`text-lg font-black ${color} leading-none`}>{value}</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Overdue warning */}
      {overdue > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl"
        >
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-red-700">
            {overdue} task{overdue > 1 ? 's are' : ' is'} overdue — take action!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── COLUMN ────────────────────────────────────────────────────────────────────
const COLUMN_CONFIG = {
  pending: {
    label: 'To Do',
    icon: Clock,
    gradient: 'from-slate-500 to-gray-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    headerBg: 'bg-slate-100',
    badge: 'bg-slate-200 text-slate-700',
    emptyText: 'No pending tasks',
  },
  completed: {
    label: 'Done',
    icon: CheckCircle2,
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    headerBg: 'bg-emerald-50',
    badge: 'bg-emerald-200 text-emerald-800',
    emptyText: 'No completed tasks yet',
  },
} as const;

type ColumnId = keyof typeof COLUMN_CONFIG;

function KanbanColumn({
  colId,
  tasks,
  percent,
}: {
  colId: ColumnId;
  tasks: Task[];
  percent?: number;
}) {
  const col = COLUMN_CONFIG[colId];
  const Icon = col.icon;

  return (
    <div className={`flex flex-col rounded-2xl border ${col.border} ${col.bg} min-h-[480px]`}>
      {/* Header */}
      <div className={`px-4 py-3 ${col.headerBg} border-b ${col.border} rounded-t-2xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 bg-gradient-to-br ${col.gradient} rounded-lg flex items-center justify-center shadow-sm`}>
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-gray-800">{col.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Progress ring — only on completed column */}
            {colId === 'completed' && percent !== undefined && (
              <div className="relative flex items-center justify-center">
                <ProgressRing percent={percent} />
                <span className="absolute text-[9px] font-black text-emerald-700">{percent}%</span>
              </div>
            )}
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${col.badge}`}>
              {tasks.length}
            </span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-40 text-center"
            >
              <div className="w-12 h-12 bg-white rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center mb-3">
                <LayoutGrid className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-xs text-gray-400 font-medium">{col.emptyText}</p>
            </motion.div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── MAIN BOARD ────────────────────────────────────────────────────────────────
interface KanbanBoardProps {
  onTaskComplete?: () => void;
}

export default function KanbanBoard({ onTaskComplete }: KanbanBoardProps) {
  const [pending, setPending] = useState<Task[]>([]);
  const [completed, setCompleted] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listTasks();
      const p: Task[] = [];
      const c: Task[] = [];
      response.tasks.forEach((task: Task) => {
        task.completed ? c.push(task) : p.push(task);
      });
      setPending(p);
      setCompleted(c);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const total = pending.length + completed.length;
  const percent = total === 0 ? 0 : Math.round((completed.length / total) * 100);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-red-600 font-medium">{error}</p>
        <button
          onClick={loadTasks}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Bar */}
      <StatsBar pending={pending} completed={completed} />

      {/* 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KanbanColumn colId="pending" tasks={pending} />
        <KanbanColumn colId="completed" tasks={completed} percent={percent} />
      </div>
    </div>
  );
}