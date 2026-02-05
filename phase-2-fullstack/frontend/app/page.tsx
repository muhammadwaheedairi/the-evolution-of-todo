'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, Zap, Shield, Smartphone, ArrowRight, Sparkles } from 'lucide-react';

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
                <Sparkles className="w-4 h-4 mr-2" />
                Welcome to the Future of Task Management
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                Organize Your
                <span className="block bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                  Life Smarter
                </span>
              </h1>
              
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto lg:mx-0">
                Transform chaos into clarity. Manage tasks, boost productivity, and achieve your goals with our beautiful, intuitive platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  Start Free Today
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
                  <div className="text-3xl font-bold text-white">10K+</div>
                  <div className="text-indigo-200 text-sm">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">50K+</div>
                  <div className="text-indigo-200 text-sm">Tasks Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">99.9%</div>
                  <div className="text-indigo-200 text-sm">Uptime</div>
                </div>
              </div>
            </div>

            {/* Right Column - Interactive Task Card */}
            <div className="relative lg:block hidden">
              <div className="relative">
                {/* Floating Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-lg border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Today's Tasks</h3>
                    <div className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-semibold">
                      3 tasks
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Task Item 1 */}
                    <div className="group flex items-start p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-gray-900 font-medium line-through">Complete project proposal</p>
                        <p className="text-sm text-gray-500 mt-1">Finished 2 hours ago</p>
                      </div>
                    </div>

                    {/* Task Item 2 */}
                    <div className="group flex items-start p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full border-2 border-blue-400"></div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-gray-900 font-medium">Schedule team meeting</p>
                        <p className="text-sm text-gray-500 mt-1">Due in 3 hours</p>
                      </div>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">High</span>
                    </div>

                    {/* Task Item 3 */}
                    <div className="group flex items-start p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full border-2 border-purple-400"></div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-gray-900 font-medium">Review quarterly reports</p>
                        <p className="text-sm text-gray-500 mt-1">Due tomorrow</p>
                      </div>
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Medium</span>
                    </div>
                  </div>

                  {/* Add Task Button */}
                  <button className="mt-6 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105">
                    + Add New Task
                  </button>
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

      {/* Features Section */}
      <div className="py-24 bg-white">
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
            <div className="group relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-indigo-100">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-200 rounded-full filter blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Task Management</h3>
                <p className="text-gray-600">
                  Create, organize, and prioritize tasks with our intuitive interface. Set deadlines and never miss important tasks.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-blue-100">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full filter blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Private</h3>
                <p className="text-gray-600">
                  Your data is protected with enterprise-grade security. We never share your information with anyone.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-purple-100">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full filter blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Works Everywhere</h3>
                <p className="text-gray-600">
                  Access your tasks from any device. Fully responsive design that works perfectly on mobile, tablet, and desktop.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-orange-100">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 rounded-full filter blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
                <p className="text-gray-600">
                  Experience instant updates and seamless performance. Built with modern technology for maximum speed.
                </p>
              </div>
            </div>
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
            Join thousands of users who are already managing their tasks smarter. Start your journey today!
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-indigo-600 bg-white rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Create Free Account
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
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