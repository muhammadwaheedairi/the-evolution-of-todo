'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, Brain, Zap, Shield, ArrowRight, Sparkles, Bot, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-24 sm:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full text-white text-sm font-medium mb-6 border border-white/20">
                <Brain className="w-4 h-4 mr-2" />
                AI-Powered + Manual Control
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                Your Way,
                <span className="block bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                  Every Time
                </span>
              </h1>
              
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto lg:mx-0">
                Talk to AI or click buttons—your choice! Enjoy the flexibility of conversational task management with the reliability of traditional controls.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  Try AI Assistant Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
                >
                  Sign In
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-3xl font-bold text-white">AI</div>
                  <div className="text-indigo-200 text-sm">Powered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">Zero</div>
                  <div className="text-indigo-200 text-sm">Learning Curve</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">100%</div>
                  <div className="text-indigo-200 text-sm">Natural</div>
                </div>
              </div>
            </div>

            {/* Right Column - AI Chat Interface Demo */}
            <div className="relative lg:block hidden">
              <div className="relative">
                {/* Floating Chat Card */}
                <div className="bg-white rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-100 transform hover:scale-105 transition-transform duration-300 overflow-hidden">
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 border-b border-indigo-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                          <Bot className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-bold text-white">AI Assistant</h3>
                          <p className="text-xs text-indigo-200">Always ready to help</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-white">Online</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="p-6 space-y-4 h-96 overflow-y-auto bg-gray-50">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
                        <p className="text-sm">Add task: buy groceries</p>
                        <p className="text-xs text-indigo-200 mt-1">2 min ago</p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-900 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs shadow-md">
                        <p className="text-sm">✓ I've added 'Buy groceries' to your task list!</p>
                        <p className="text-xs text-gray-500 mt-2">Just now</p>
                      </div>
                    </div>

                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
                        <p className="text-sm">Show me all pending tasks</p>
                        <p className="text-xs text-indigo-200 mt-1">Just now</p>
                      </div>
                    </div>

                    {/* AI Response with Task List */}
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-900 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs shadow-md">
                        <p className="text-sm font-medium mb-2">Here are your pending tasks:</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded border-2 border-gray-400 mr-2"></div>
                            <span>Buy groceries</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded border-2 border-gray-400 mr-2"></div>
                            <span>Call dentist</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Just now</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="text" 
                        placeholder="Type: 'mark task 1 as done'..." 
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled
                      />
                      <button className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all">
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-300 rounded-full filter blur-2xl opacity-50"></div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-300 rounded-full filter blur-2xl opacity-50"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Dual Mode Section - NEW */}
      <div className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full text-indigo-600 text-sm font-semibold mb-4">
              🔄 Dual Mode Flexibility
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Style
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI or Manual
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Prefer chatting with AI? Great! Want traditional buttons and forms? We've got you covered. Switch anytime!
            </p>
          </div>

          {/* Comparison Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* AI Mode */}
            <div className="relative bg-white rounded-2xl p-8 shadow-xl border-2 border-indigo-200">
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                ✨ AI Mode
              </div>
              
              <div className="mt-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <Bot className="w-9 h-9 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Conversational AI</h3>
                <p className="text-gray-600 mb-6">
                  Just chat naturally with your AI assistant. No forms, no clicks—pure conversation.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Natural language commands</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Context-aware responses</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Conversation history saved</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Perfect for quick tasks</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-sm text-indigo-900 font-medium">Example:</p>
                  <p className="text-sm text-indigo-700 mt-1">"Add buy milk to my tasks"</p>
                </div>
              </div>
            </div>

            {/* Traditional Mode */}
            <div className="relative bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-200">
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                🎯 Manual Mode
              </div>
              
              <div className="mt-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle className="w-9 h-9 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Traditional Controls</h3>
                <p className="text-gray-600 mb-6">
                  Classic task management with buttons, forms, and direct control over every action.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Familiar interface</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Complete visual control</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Works without AI (always reliable)</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Perfect for detailed tasks</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-900 font-medium">Example:</p>
                  <p className="text-sm text-blue-700 mt-1">Click "Add Task" → Fill form → Save</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reliability Note */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-green-50 rounded-xl border border-green-200">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-900 font-medium">
                AI down? No problem! Manual mode always works—100% reliable fallback.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full text-indigo-600 text-sm font-semibold mb-4">
              🤖 AI Mode
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How AI Makes
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tasks Effortless
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              When you choose AI mode, managing tasks becomes as simple as having a conversation.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100 h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  1
                </div>
                <div className="mt-4">
                  <MessageSquare className="w-12 h-12 text-indigo-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Type Naturally</h3>
                  <p className="text-gray-600">
                    "Add task buy milk" or "Show me what's pending" - just talk like you normally would.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  2
                </div>
                <div className="mt-4">
                  <Brain className="w-12 h-12 text-purple-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">AI Understands</h3>
                  <p className="text-gray-600">
                    Your AI assistant instantly understands what you want and takes action on your behalf.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100 h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  3
                </div>
                <div className="mt-4">
                  <Zap className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Action</h3>
                  <p className="text-gray-600">
                    Task created, updated, or deleted immediately. Get friendly confirmation every time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full text-indigo-600 text-sm font-semibold mb-4">
              ✨ Powerful Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Stay Organized
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to help you manage tasks efficiently and boost your productivity.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-indigo-100">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-200 rounded-full filter blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered</h3>
                <p className="text-gray-600">
                  Smart assistant that understands natural language and helps you manage tasks effortlessly.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-blue-100">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full filter blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Conversational</h3>
                <p className="text-gray-600">
                  Chat naturally with your assistant. No complex commands or forms—just plain English.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-purple-100">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full filter blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
                <p className="text-gray-600">
                  Instant responses and real-time updates. Your tasks are managed at the speed of thought.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-green-100">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full filter blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Private</h3>
                <p className="text-gray-600">
                  Your data is protected with enterprise-grade security. Complete privacy guaranteed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Natural Language Examples Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full text-purple-600 text-sm font-semibold mb-4">
              💬 Natural Conversations
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Talk to Your Tasks
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Like a Human
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No need to learn commands. Just type what you want, and the AI handles the rest.
            </p>
          </div>

          {/* Examples Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Example 1 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
              <div className="flex items-start space-x-3 mb-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  You
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">"Add task buy groceries"</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 ml-11">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-600">✓ I've added 'Buy groceries' to your tasks.</p>
                </div>
              </div>
            </div>

            {/* Example 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-start space-x-3 mb-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  You
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">"Show me all pending tasks"</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 ml-11">
                <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-600">Here are your 3 pending tasks...</p>
                </div>
              </div>
            </div>

            {/* Example 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-start space-x-3 mb-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  You
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">"Mark task 3 as done"</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 ml-11">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-600">✓ Marked 'Review reports' as completed!</p>
                </div>
              </div>
            </div>

            {/* Example 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
              <div className="flex items-start space-x-3 mb-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  You
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">"Delete the meeting task"</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 ml-11">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-600">✓ Deleted 'Schedule meeting'</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 max-w-2xl mx-auto">
              The AI understands context and intent. You don't need to memorize commands or fill out forms—just chat naturally!
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Try AI mode for quick tasks or use traditional controls—both included free. Choose your style!
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-indigo-600 bg-white rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Start Free - Both Modes Included
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          
          {/* Feature Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full text-white text-sm border border-white/20">
              ✨ AI Assistant
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full text-white text-sm border border-white/20">
              🎯 Manual Controls
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full text-white text-sm border border-white/20">
              🔄 Switch Anytime
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}