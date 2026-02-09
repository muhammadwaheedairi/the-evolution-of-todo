'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { isAuthenticated, getUserEmail, logout } from '@/lib/api';
import { Task } from '@/lib/types';

const TasksPage = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskListKey, setTaskListKey] = useState(0); // For forcing TaskList refresh

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Get user email from localStorage
    const email = getUserEmail();
    setUserEmail(email);
  }, [router]);

  const handleTaskCreated = (newTask: Task) => {
    // Refresh the task list by changing its key
    setTaskListKey(prev => prev + 1);
    // Hide the form
    setShowTaskForm(false);
  };

  const handleLogout = () => {
    logout();
  };

  // Show loading state while checking authentication
  if (!userEmail) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{userEmail}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Toggle Create Task Form Button */}
          {!showTaskForm && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowTaskForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </button>
            </div>
          )}

          {/* Create Task Form */}
          {showTaskForm && (
            <div>
              <TaskForm onSuccess={handleTaskCreated} />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => setShowTaskForm(false)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Task List */}
          <TaskList key={taskListKey} />
        </div>
      </main>
    </div>
  );
};

export default TasksPage