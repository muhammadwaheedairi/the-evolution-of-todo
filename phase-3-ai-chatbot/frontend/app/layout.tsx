import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaskFlow - Smart Task Management',
  description: 'Organize your life smarter with our beautiful, intuitive task management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Header />

          {/* Main Content */}
          <main>
            {children}
          </main>

          <footer className="relative mt-auto bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
            {/* Decorative blur blobs */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-pink-300 rounded-full blur-3xl opacity-30" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-300 rounded-full blur-3xl opacity-30" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 py-14">
              <div className="grid gap-10 md:grid-cols-3 items-center text-center md:text-left">

                {/* Brand */}
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    TaskFlow
                  </h3>
                  <p className="mt-3 text-sm text-indigo-100 max-w-sm">
                    AI-powered task management with a reliable manual fallback.
                    Built for speed, clarity, and control.
                  </p>
                </div>

                {/* Links */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                  <a href="/login" className="text-sm text-white/90 hover:text-white transition">
                    Sign In
                  </a>
                  <a href="/register" className="text-sm text-white/90 hover:text-white transition">
                    Get Started
                  </a>
                  <a href="/tasks" className="text-sm text-white/90 hover:text-white transition">
                    Tasks
                  </a>
                  <a href="/chat" className="text-sm text-white/90 hover:text-white transition">
                    AI Chat
                  </a>
                </div>

                {/* Trust / Badge */}
                <div className="flex flex-col items-center md:items-end gap-3">
                  <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs text-white border border-white/20">
                    ⚡ Fast · 🔒 Secure · 🤖 AI-Ready
                  </div>
                  <p className="text-xs text-indigo-100">
                    © {new Date().getFullYear()} TaskFlow. All rights reserved.
                  </p>
                </div>

              </div>
            </div>
          </footer>

        </div>
      </body>
    </html>
  );
}