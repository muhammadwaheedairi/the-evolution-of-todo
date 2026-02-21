'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { MessageSquare, Brain, Zap, Shield, ArrowRight, Bot, CheckCircle, Bell, Repeat, Tag, Calendar, Search, Star, Users, TrendingUp, Clock, SlidersHorizontal, Database, Globe } from 'lucide-react';

// ── ANIMATION VARIANTS ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, delay },
  }),
};

const slideLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, delay },
  }),
};

const slideRight = {
  hidden: { opacity: 0, x: 60 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, delay },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

// ── ANIMATED SECTION WRAPPER ─────────────────────────────────────────────────
function AnimateSection({ children, className = '', variants = fadeUp, delay = 0 }: any) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── FLOATING BLOB ─────────────────────────────────────────────────────────────
function FloatingBlob({ className }: { className: string }) {
  return (
    <motion.div
      className={className}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -50, 20, 0],
        scale: [1, 1.1, 0.9, 1],
      }}
      transition={{ duration: 7, repeat: Infinity }}
    />
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0);
  const { scrollYProgress } = useScroll();
  const progressScaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const chatExamples = [
    {
      user: 'Add high priority task: Review Q4 report due tomorrow',
      bot: '✓ Created \'Review Q4 report\' with High priority, due Feb 18. Reminder scheduled!',
    },
    {
      user: 'Show me all pending high priority tasks',
      bot: 'Found 3 high priority tasks: Review Q4 report, Client meeting prep, Deploy hotfix.',
    },
    {
      user: 'Set daily standup as recurring every day at 9am',
      bot: '✓ \'Daily standup\' set as recurring daily. Next occurrence: Tomorrow 9:00 AM.',
    },
  ];

  const vipFeatures = [
    { icon: Brain, title: 'Claude AI Assistant', desc: "Powered by Anthropic's Claude — understands context, intent, and natural language for seamless task management.", badge: 'Claude Sonnet', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', border: 'border-violet-200' },
    { icon: Zap, title: 'Kafka Event Streaming', desc: 'Enterprise-grade Redpanda/Kafka event bus. Every action publishes real-time events consumed by microservices.', badge: 'Redpanda', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { icon: Bell, title: 'Live Notifications', desc: 'WebSocket + Socket.IO powered real-time browser notifications. Get alerted the moment anything changes.', badge: 'WebSocket', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { icon: Repeat, title: 'Smart Recurring Tasks', desc: 'Set daily, weekly, or monthly recurrence. Auto-creates next occurrence when completed — zero manual effort.', badge: 'Automation', color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { icon: Globe, title: 'Kubernetes + Dapr', desc: 'Production-ready deployment on Minikube with Dapr sidecars for service mesh, pub/sub, and state management.', badge: 'K8s + Dapr', color: 'from-pink-500 to-rose-600', bg: 'bg-pink-50', border: 'border-pink-200' },
    { icon: Database, title: 'Microservices Architecture', desc: 'Separate notification service, recurring task service, and API backend — fully decoupled and independently scalable.', badge: 'Microservices', color: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  ];

  const timeline = [
    { step: '01', title: 'Sign Up Free', desc: 'Create your account in seconds. No credit card required.', icon: Users },
    { step: '02', title: 'Create Tasks', desc: 'Use AI chat or manual forms — whatever feels natural to you.', icon: CheckCircle },
    { step: '03', title: 'Set Priorities', desc: 'Tag tasks as High/Medium/Low with due dates and recurrence.', icon: Tag },
    { step: '04', title: 'Get Notified', desc: 'Real-time browser notifications keep you on track always.', icon: Bell },
    { step: '05', title: 'Stay Organized', desc: 'Filter, search, sort — find any task in milliseconds.', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ── SCROLL PROGRESS BAR ── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 origin-left z-50"
        style={{ scaleX: progressScaleX }}
      />

      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingBlob className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70" />
          <FloatingBlob className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70" />
          <FloatingBlob className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-24 sm:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full text-white text-sm font-medium mb-6 border border-white/20"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI-Powered + Manual Control
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
              >
                Your Way,
                <motion.span
                  className="block bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  Every Time
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7 }}
                className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto lg:mx-0"
              >
                Talk to AI or click buttons — your choice! Enterprise-grade task management with Kafka, Kubernetes, Dapr, and real-time notifications.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link href="/register">
                  <motion.span
                    className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-xl shadow-xl cursor-pointer"
                    whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Try AI Assistant Free <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.span>
                </Link>
                <Link href="/login">
                  <motion.span
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 cursor-pointer"
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Sign In
                  </motion.span>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto lg:mx-0"
              >
                {[{ val: 'AI', label: 'Powered' }, { val: 'Zero', label: 'Learning Curve' }, { val: '100%', label: 'Natural' }].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                  >
                    <div className="text-3xl font-bold text-white">{s.val}</div>
                    <div className="text-indigo-200 text-sm">{s.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right — Chat Card */}
            <motion.div
              className="relative lg:block hidden"
              initial={{ opacity: 0, x: 80, rotate: 3 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <motion.div
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Bot className="w-6 h-6 text-indigo-600" />
                      </motion.div>
                      <div className="ml-3">
                        <h3 className="text-lg font-bold text-white">AI Assistant</h3>
                        <p className="text-xs text-indigo-200">Always ready to help</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <motion.div
                        className="w-2 h-2 bg-green-400 rounded-full"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="text-xs text-white">Online</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4 h-80 overflow-y-auto bg-gray-50">
                  {[
                    { type: 'user', msg: 'Add task: buy groceries', time: '2 min ago' },
                    { type: 'bot', msg: "✓ I've added 'Buy groceries' to your tasks.", time: 'Just now' },
                    { type: 'user', msg: 'Show me all pending tasks', time: 'Just now' },
                    { type: 'bot', msg: 'Here are your 2 pending tasks: Buy groceries, Call dentist', time: 'Just now' },
                  ].map((m, i) => (
                    <motion.div
                      key={i}
                      className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, x: m.type === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.2 }}
                    >
                      <div className={`rounded-2xl px-4 py-3 max-w-xs shadow-md ${m.type === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white text-gray-900 rounded-tl-sm'}`}>
                        <p className="text-sm">{m.msg}</p>
                        <p className={`text-xs mt-1 ${m.type === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>{m.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center space-x-2">
                    <input type="text" placeholder="Type: 'mark task 1 as done'..." className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none" disabled />
                    <motion.button
                      className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-300 rounded-full filter blur-2xl opacity-50 pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-300 rounded-full filter blur-2xl opacity-50 pointer-events-none" />
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* ── LIVE STATS ── */}
      <div className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              { label: 'Tasks Managed', value: 50000, suffix: '+', icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Happy Users', value: 12000, suffix: '+', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Uptime', raw: '99.9%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Avg Response', raw: '<100ms', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={cardVariant}
                className="text-center p-6 rounded-2xl border border-gray-100 cursor-default"
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
              >
                <motion.div
                  className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </motion.div>
                <div className={`text-3xl font-black ${stat.color} mb-1`}>
                  {stat.value ? <AnimatedCounter target={stat.value} suffix={stat.suffix} /> : stat.raw}
                </div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── DUAL MODE ── */}
      <div className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateSection className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full text-indigo-600 text-sm font-semibold mb-4">🔄 Dual Mode Flexibility</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Style
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI or Manual</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Prefer chatting with AI? Great! Want traditional buttons and forms? We've got you covered. Switch anytime!</p>
          </AnimateSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {[
              {
                badge: '✨ AI Mode', badgeCls: 'from-indigo-600 to-purple-600',
                iconCls: 'from-indigo-500 to-purple-600', borderCls: 'border-indigo-200',
                icon: Bot, title: 'Conversational AI',
                desc: 'Just chat naturally with your AI assistant. No forms, no clicks—pure conversation.',
                items: ['Natural language commands', 'Context-aware responses', 'Conversation history saved', 'Perfect for quick tasks'],
                exampleBg: 'bg-indigo-50 border-indigo-100', exampleText: 'text-indigo-700', exampleLabel: 'text-indigo-900',
                example: '"Add high priority task: buy milk due tomorrow"',
                variants: slideLeft,
              },
              {
                badge: '🎯 Manual Mode', badgeCls: 'from-blue-600 to-cyan-600',
                iconCls: 'from-blue-500 to-cyan-600', borderCls: 'border-blue-200',
                icon: CheckCircle, title: 'Traditional Controls',
                desc: 'Classic task management with buttons, forms, and direct control over every action.',
                items: ['Familiar interface', 'Complete visual control', 'Works without AI (always reliable)', 'Perfect for detailed tasks'],
                exampleBg: 'bg-blue-50 border-blue-100', exampleText: 'text-blue-700', exampleLabel: 'text-blue-900',
                example: 'Click "Add Task" → Fill form → Save',
                variants: slideRight,
              },
            ].map((card, i) => (
              <AnimateSection key={i} variants={card.variants} delay={i * 0.15}>
                <motion.div
                  className={`relative bg-white rounded-2xl p-8 shadow-xl border-2 ${card.borderCls} h-full`}
                  whileHover={{ y: -4, boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }}
                >
                  <div className={`absolute -top-4 -right-4 bg-gradient-to-br ${card.badgeCls} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>{card.badge}</div>
                  <div className="mt-4">
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-br ${card.iconCls} rounded-2xl flex items-center justify-center mb-6`}
                      whileHover={{ rotate: 8, scale: 1.1 }}
                    >
                      <card.icon className="w-9 h-9 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{card.title}</h3>
                    <p className="text-gray-600 mb-6">{card.desc}</p>
                    <div className="space-y-3">
                      {card.items.map((item, j) => (
                        <motion.div
                          key={j}
                          className="flex items-start"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: j * 0.1 }}
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className={`mt-6 p-4 ${card.exampleBg} rounded-xl border`}>
                      <p className={`text-sm ${card.exampleLabel} font-medium`}>Example:</p>
                      <p className={`text-sm ${card.exampleText} mt-1`}>{card.example}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimateSection>
            ))}
          </div>

          <AnimateSection className="mt-12 text-center" delay={0.3}>
            <motion.div
              className="inline-flex items-center px-6 py-3 bg-green-50 rounded-xl border border-green-200"
              whileHover={{ scale: 1.03 }}
            >
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-900 font-medium">AI down? No problem! Manual mode always works—100% reliable fallback.</span>
            </motion.div>
          </AnimateSection>
        </div>
      </div>

      {/* ── VIP TECH FEATURES ── */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateSection className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-indigo-700 text-sm font-semibold mb-4">⚡ Enterprise-Grade Technology</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Built with
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Production-Ready Stack</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Not just another todo app — a full enterprise architecture with microservices, event streaming, and cloud-native deployment.</p>
          </AnimateSection>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {vipFeatures.map((feature, i) => (
              <motion.div
                key={i}
                variants={cardVariant}
                className={`group relative ${feature.bg} rounded-2xl p-7 border ${feature.border} cursor-default`}
                whileHover={{ y: -6, boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}
                    whileHover={{ rotate: 8, scale: 1.1 }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <span className="text-xs font-bold px-3 py-1 bg-white rounded-full text-gray-600 border border-gray-200 shadow-sm">{feature.badge}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <AnimateSection className="mt-14 text-center" delay={0.2}>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-5">Powered By</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['FastAPI', 'Next.js 14', 'PostgreSQL', 'Kafka/Redpanda', 'Kubernetes', 'Dapr', 'Socket.IO', 'Claude AI', 'Docker', 'Neon DB'].map((tech, i) => (
                <motion.span
                  key={tech}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl cursor-default"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ borderColor: '#818cf8', backgroundColor: '#eef2ff', color: '#4f46e5', scale: 1.05 }}
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </AnimateSection>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateSection className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full text-indigo-600 text-sm font-semibold mb-4">🤖 AI Mode</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How AI Makes
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Tasks Effortless</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">When you choose AI mode, managing tasks becomes as simple as having a conversation.</p>
          </AnimateSection>

          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              { n: 1, gradient: 'from-indigo-50 to-purple-50 border-indigo-100', numGrad: 'from-indigo-600 to-purple-600', icon: MessageSquare, iconCls: 'text-indigo-600', title: 'Type Naturally', desc: '"Add task buy milk" or "Show me what\'s pending" - just talk like you normally would.' },
              { n: 2, gradient: 'from-purple-50 to-pink-50 border-purple-100', numGrad: 'from-purple-600 to-pink-600', icon: Brain, iconCls: 'text-purple-600', title: 'AI Understands', desc: 'Your AI assistant instantly understands what you want and takes action on your behalf.' },
              { n: 3, gradient: 'from-blue-50 to-cyan-50 border-blue-100', numGrad: 'from-blue-600 to-cyan-600', icon: Zap, iconCls: 'text-blue-600', title: 'Instant Action', desc: 'Task created, updated, or deleted immediately. Get friendly confirmation every time.' },
            ].map((step, i) => (
              <motion.div key={i} variants={cardVariant} className="relative">
                <motion.div
                  className={`bg-gradient-to-br ${step.gradient} rounded-2xl p-8 border h-full`}
                  whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                >
                  <motion.div
                    className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br ${step.numGrad} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                    whileHover={{ scale: 1.2, rotate: 15 }}
                  >
                    {step.n}
                  </motion.div>
                  <div className="mt-4">
                    <motion.div whileHover={{ rotate: -8, scale: 1.1 }} className="inline-block">
                      <step.icon className={`w-12 h-12 ${step.iconCls} mb-4`} />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── INTERACTIVE CHAT EXAMPLES ── */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateSection className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full text-purple-600 text-sm font-semibold mb-4">💬 Natural Conversations</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Talk to Your Tasks
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Like a Human</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">No need to learn commands. Just type what you want, and the AI handles the rest.</p>
          </AnimateSection>

          <AnimateSection className="max-w-3xl mx-auto mb-10">
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
              {['Create Task', 'List Tasks', 'Recurring'].map((tab, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors relative`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {activeTab === i && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${activeTab === i ? 'text-indigo-600' : 'text-gray-500'}`}>{tab}</span>
                </motion.button>
              ))}
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex justify-end">
                    <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-sm">
                      <p className="text-sm">"{chatExamples[activeTab].user}"</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3">
                      <motion.div
                        className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Bot className="w-5 h-5 text-white" />
                      </motion.div>
                      <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-3 max-w-sm shadow-md">
                        <p className="text-sm text-gray-800">{chatExamples[activeTab].bot}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </AnimateSection>

          <motion.div
            className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              { user: '"Add task buy groceries"', bot: "✓ I've added 'Buy groceries' to your tasks.", bgFrom: 'from-indigo-50', bgTo: 'to-purple-50', border: 'border-indigo-100', userBg: 'bg-indigo-600', botBg: 'bg-purple-600' },
              { user: '"Show me all pending tasks"', bot: 'Here are your 3 pending tasks...', bgFrom: 'from-blue-50', bgTo: 'to-cyan-50', border: 'border-blue-100', userBg: 'bg-blue-600', botBg: 'bg-cyan-600' },
              { user: '"Mark task 3 as done"', bot: "✓ Marked 'Review reports' as completed!", bgFrom: 'from-green-50', bgTo: 'to-emerald-50', border: 'border-green-100', userBg: 'bg-green-600', botBg: 'bg-emerald-600' },
              { user: '"Delete the meeting task"', bot: "✓ Deleted 'Schedule meeting'", bgFrom: 'from-orange-50', bgTo: 'to-yellow-50', border: 'border-orange-100', userBg: 'bg-orange-600', botBg: 'bg-yellow-600' },
            ].map((ex, i) => (
              <motion.div
                key={i}
                variants={cardVariant}
                className={`bg-gradient-to-br ${ex.bgFrom} ${ex.bgTo} rounded-2xl p-6 border ${ex.border}`}
                whileHover={{ scale: 1.02, y: -3 }}
              >
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`flex-shrink-0 w-8 h-8 ${ex.userBg} rounded-full flex items-center justify-center text-white text-xs font-bold`}>You</div>
                  <p className="text-gray-800 font-medium text-sm">{ex.user}</p>
                </div>
                <div className="flex items-start space-x-3 ml-11">
                  <div className={`flex-shrink-0 w-8 h-8 ${ex.botBg} rounded-full flex items-center justify-center`}><Bot className="w-5 h-5 text-white" /></div>
                  <p className="text-gray-600 text-sm">{ex.bot}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── TIMELINE ── */}
      <div className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateSection className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full text-indigo-600 text-sm font-semibold mb-4">🚀 Get Started</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Up & Running
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">in 60 Seconds</span>
            </h2>
          </AnimateSection>

          <div className="space-y-4">
            {timeline.map((item, i) => (
              <AnimateSection key={i} variants={slideLeft} delay={i * 0.1}>
                <motion.div
                  className="flex items-center gap-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-default"
                  whileHover={{ x: 6, boxShadow: '0 10px 30px rgba(99,102,241,0.15)', borderColor: '#a5b4fc' }}
                >
                  <motion.div
                    className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 6, scale: 1.1 }}
                  >
                    <span className="text-white font-black text-lg">{item.step}</span>
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                      <item.icon className="w-4 h-4 text-indigo-500" />
                    </div>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </motion.div>
              </AnimateSection>
            ))}
          </div>
        </div>
      </div>

      {/* ── 8-FEATURE GRID ── */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateSection className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full text-indigo-600 text-sm font-semibold mb-4">✨ Powerful Features</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Stay Organized</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Powerful features designed to help you manage tasks efficiently and boost your productivity.</p>
          </AnimateSection>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              { icon: Brain, title: 'AI-Powered', desc: 'Smart assistant that understands natural language and manages tasks effortlessly.', gradient: 'from-indigo-500 to-purple-600', border: 'border-indigo-100' },
              { icon: MessageSquare, title: 'Conversational', desc: 'Chat naturally with your assistant. No complex commands—just plain English.', gradient: 'from-blue-500 to-cyan-600', border: 'border-blue-100' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Instant responses and real-time updates. Tasks managed at the speed of thought.', gradient: 'from-purple-500 to-pink-600', border: 'border-purple-100' },
              { icon: Shield, title: 'Secure & Private', desc: 'Enterprise-grade JWT authentication. Your data is protected and private.', gradient: 'from-green-500 to-emerald-600', border: 'border-green-100' },
              { icon: SlidersHorizontal, title: 'Advanced Filters', desc: 'Filter by status, priority, tags. Sort any column ascending or descending.', gradient: 'from-orange-500 to-amber-600', border: 'border-orange-100' },
              { icon: Search, title: 'Smart Search', desc: 'Full-text search across titles and descriptions. Find any task instantly.', gradient: 'from-rose-500 to-pink-600', border: 'border-rose-100' },
              { icon: Calendar, title: 'Due Dates', desc: 'Set due dates with natural language parsing. Never miss a deadline again.', gradient: 'from-teal-500 to-cyan-600', border: 'border-teal-100' },
              { icon: Star, title: 'Priority Levels', desc: 'High, Medium, Low priorities with visual indicators on every task card.', gradient: 'from-yellow-500 to-orange-600', border: 'border-yellow-100' },
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={cardVariant}
                className={`group relative bg-white rounded-2xl p-8 border ${f.border} cursor-default overflow-hidden`}
                whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(0,0,0,0.12)' }}
              >
                {/* Hover glow */}
                <motion.div
                  className="absolute inset-0 opacity-0 bg-gradient-to-br from-indigo-50 to-purple-50"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="relative">
                  <motion.div
                    className={`w-14 h-14 bg-gradient-to-br ${f.gradient} rounded-xl flex items-center justify-center mb-4`}
                    whileHover={{ rotate: 8, scale: 1.15 }}
                  >
                    <f.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-gray-600">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateSection className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 rounded-full text-yellow-700 text-sm font-semibold mb-4">⭐ What Users Say</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Productive People</h2>
          </AnimateSection>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              { name: 'Sarah K.', role: 'Product Manager', text: 'The AI assistant is incredible. I just tell it what I need and it handles everything. Saved me hours every week!', stars: 5 },
              { name: 'Ahmed R.', role: 'Software Engineer', text: 'Love the Kafka integration and real-time notifications. This is enterprise-level tech in a beautifully simple interface.', stars: 5 },
              { name: 'Maria L.', role: 'Freelancer', text: 'Recurring tasks changed my life. Set it once, forget about it. The AI even creates the next occurrence automatically!', stars: 5 },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={cardVariant}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              >
                <div className="flex mb-4">
                  {[...Array(t.stars)].map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: j * 0.08 }}
                    >
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                  >
                    {t.name[0]}
                  </motion.div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="relative py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingBlob className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
          <FloatingBlob className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimateSection variants={scaleIn}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
          </AnimateSection>

          <AnimateSection delay={0.15}>
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">Try AI mode for quick tasks or use traditional controls — both included free. Enterprise architecture, zero cost.</p>
          </AnimateSection>

          <AnimateSection delay={0.25}>
            <Link href="/register">
              <motion.span
                className="inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-indigo-600 bg-white rounded-xl shadow-xl cursor-pointer"
                whileHover={{ scale: 1.06, boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}
                whileTap={{ scale: 0.97 }}
              >
                Start Free — Both Modes Included <ArrowRight className="ml-2 w-5 h-5" />
              </motion.span>
            </Link>
          </AnimateSection>

          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {['✨ AI Assistant', '🎯 Manual Controls', '🔄 Recurring Tasks', '⚡ Kafka Events', '☸️ Kubernetes', '🔔 Live Notifications'].map((pill, i) => (
              <motion.div
                key={pill}
                variants={cardVariant}
                className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full text-white text-sm border border-white/20"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)', scale: 1.05 }}
              >
                {pill}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}