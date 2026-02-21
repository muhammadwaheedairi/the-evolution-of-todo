'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { LoginSchema, LoginRequest } from '@/lib/types';
import { login } from '@/lib/api';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      await login(data);
      router.push('/tasks');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {/* Error Alert - Responsive */}
      {error && (
        <div className="rounded-lg sm:rounded-xl bg-red-50 p-3 sm:p-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Email Field - Responsive */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={`appearance-none block w-full pl-10 pr-3 py-2.5 sm:py-3 border ${
              errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none text-sm sm:text-base transition-colors`}
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 text-xs sm:text-sm text-red-600 animate-in slide-in-from-top duration-200">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field - Responsive */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className={`appearance-none block w-full pl-10 pr-3 py-2.5 sm:py-3 border ${
              errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none text-sm sm:text-base transition-colors`}
            placeholder="••••••••"
            disabled={loading}
          />
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs sm:text-sm text-red-600 animate-in slide-in-from-top duration-200">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit Button - Fully Responsive */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing In...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>

      {/* Sign Up Link - Responsive */}
      <div className="text-center pt-2">
        <p className="text-xs sm:text-sm text-gray-600">
          Don't have an account?{' '}
          <a 
            href="/register" 
            className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign up
          </a>
        </p>
      </div>
    </form>
  );
};