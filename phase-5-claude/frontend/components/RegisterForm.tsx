'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { RegisterSchema, RegisterRequest } from '@/lib/types';
import { register as registerUser } from '@/lib/api';
import { User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await registerUser(data);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
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
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Success Alert - Responsive */}
      {success && (
        <div className="rounded-lg sm:rounded-xl bg-green-50 p-3 sm:p-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">
                Account created successfully! Redirecting to login...
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Name Field - FIRST FIELD - Responsive */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="name"
            type="text"
            autoComplete="name"
            {...register('name')}
            className={`appearance-none block w-full pl-10 pr-3 py-2.5 sm:py-3 border ${
              errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none text-sm sm:text-base transition-colors`}
            placeholder="Enter your full name"
            disabled={loading || success}
          />
        </div>
        {errors.name && (
          <p className="mt-1.5 text-xs sm:text-sm text-red-600 animate-in slide-in-from-top duration-200">
            {errors.name.message}
          </p>
        )}
      </div>

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
            disabled={loading || success}
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
            autoComplete="new-password"
            {...register('password')}
            className={`appearance-none block w-full pl-10 pr-3 py-2.5 sm:py-3 border ${
              errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none text-sm sm:text-base transition-colors`}
            placeholder="••••••••"
            disabled={loading || success}
          />
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs sm:text-sm text-red-600 animate-in slide-in-from-top duration-200">
            {errors.password.message}
          </p>
        )}
        {!errors.password && (
          <p className="mt-1.5 text-xs text-gray-500">
            Password must be at least 8 characters long
          </p>
        )}
      </div>

      {/* Submit Button - Fully Responsive */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || success}
          className="group relative w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </>
          ) : success ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Success!
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>

      {/* Sign In Link - Responsive */}
      <div className="text-center pt-2">
        <p className="text-xs sm:text-sm text-gray-600">
          Already have an account?{' '}
          <a 
            href="/login" 
            className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign in
          </a>
        </p>
      </div>
    </form>
  );
};