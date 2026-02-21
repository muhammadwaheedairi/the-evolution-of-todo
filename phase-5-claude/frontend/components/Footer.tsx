'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Shield, Bot, Github, Linkedin, ArrowUpRight, CheckSquare } from 'lucide-react';

// Meta Threads SVG icon (official logo)
const ThreadsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" fill="currentColor" className="w-4 h-4">
    <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.232c8.25.054 14.476 2.452 18.502 7.13 2.932 3.405 4.893 8.11 5.864 14.05-7.314-1.244-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.627 32.788 28.026 19.882 44.485 13.224 67.315 13.001 96v.027c.224 28.685 6.882 51.515 19.788 67.974C47.292 182.373 68.882 191.805 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553Zm-43.096 40.519c-10.44.588-21.286-4.098-21.82-14.135-.396-7.442 5.296-15.746 22.461-16.735 1.966-.113 3.895-.169 5.79-.169 6.235 0 12.068.606 17.37 1.765-1.978 24.702-13.026 28.713-23.801 29.274Z"/>
  </svg>
);

const links = [
  { href: '/login', label: 'Sign In' },
  { href: '/register', label: 'Get Started' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/chat', label: 'AI Chat' },
];

const socials = [
  { icon: Github, href: 'https://github.com/muhammadwaheedairi', label: 'GitHub' },
  { icon: ThreadsIcon, href: 'https://www.threads.com/@muhammadwaheedairi', label: 'Threads' },
  { icon: Linkedin, href: 'https://linkedin.com/in/muhammadwaheedairi/', label: 'LinkedIn' },
];

const badges = [
  { icon: Zap, label: 'Lightning Fast' },
  { icon: Shield, label: 'Secure' },
  { icon: Bot, label: 'AI-Powered' },
];

export default function Footer() {
  return (
    <footer className="relative mt-auto bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 overflow-hidden">
      {/* Animated background blobs */}
      <motion.div
        className="absolute -top-24 -right-24 w-96 h-96 bg-pink-400 rounded-full blur-3xl opacity-20"
        animate={{ x: [0, 20, -10, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-400 rounded-full blur-3xl opacity-20"
        animate={{ x: [0, -20, 10, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-400 rounded-full blur-3xl opacity-10"
        animate={{ scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Top divider wave */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none">
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 40L60 34C120 28 240 16 360 12C480 8 600 12 720 16C840 20 960 24 1080 22C1200 20 1320 12 1380 8L1440 4V0H0V40Z" fill="white" fillOpacity="0.06" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Main grid */}
        <motion.div
          className="grid gap-12 md:grid-cols-3 lg:grid-cols-4 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div className="flex items-center gap-3 mb-4" whileHover={{ x: 3 }}>
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">TaskFlow</span>
            </motion.div>
            <p className="text-sm text-indigo-100 max-w-sm leading-relaxed mb-6">
              AI-powered task management with a reliable manual fallback.
              Built for speed, clarity, and control — powered by enterprise-grade Kafka, Kubernetes, and Claude AI.
            </p>
            <div className="flex flex-wrap gap-2">
              {badges.map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs text-white"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)', scale: 1.05 }}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-indigo-200 uppercase tracking-widest mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              {links.map(({ href, label }, i) => (
                <motion.li
                  key={href}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link href={href}>
                    <motion.span
                      className="group inline-flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors cursor-pointer"
                      whileHover={{ x: 4 }}
                    >
                      {label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Social + CTA */}
          <div>
            <h4 className="text-xs font-semibold text-indigo-200 uppercase tracking-widest mb-4">Connect</h4>
            <div className="flex gap-3 mb-6">
              {socials.map(({ icon: Icon, href, label }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center border border-white/20 text-white transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.12, rotate: 5 }}
                  whileTap={{ scale: 0.93 }}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
            <Link href="/register">
              <motion.span
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-600 text-sm font-semibold rounded-xl shadow-lg cursor-pointer"
                whileHover={{ scale: 1.05, boxShadow: '0 15px 30px rgba(0,0,0,0.25)' }}
                whileTap={{ scale: 0.97 }}
              >
                Get Started Free
                <ArrowUpRight className="w-4 h-4" />
              </motion.span>
            </Link>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-xs text-indigo-200">
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-indigo-200">
            <motion.div
              className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            All systems operational
          </div>
          <p className="text-xs text-indigo-200">
            Powered by <span className="text-white font-medium">Claude AI</span> · <span className="text-white font-medium">Kafka</span> · <span className="text-white font-medium">K8s</span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}