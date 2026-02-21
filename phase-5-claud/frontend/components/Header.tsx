// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { Menu, X, CheckSquare, LogOut, User } from 'lucide-react';
// import { isAuthenticated, getUserName, logout } from '@/lib/api';

// const Header = () => {
//   const pathname = usePathname();
//   const [userName, setUserName] = useState<string | null>(null);  // ✅ CHANGED from userEmail
//   const [loading, setLoading] = useState(true);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   useEffect(() => {
//     const checkAuth = () => {
//       if (isAuthenticated()) {
//         const name = getUserName();  // ✅ CHANGED from getUserEmail
//         setUserName(name);
//       } else {
//         setUserName(null);
//       }
//       setLoading(false);
//     };

//     checkAuth();

//     const handleStorageChange = () => {
//       checkAuth();
//     };

//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   const handleLogout = () => {
//     logout();
//     setUserName(null);
//   };

//   const navLinks = [
//     { href: '/', label: 'Home', show: true },
//     { href: '/chat', label: 'Chat', show: !!userName },
//     { href: '/tasks', label: 'My Tasks', show: !!userName },
//   ];

//   return (
//     <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-14 sm:h-16">
//           {/* Logo - Responsive */}
//           <div className="flex items-center">
//             <Link href="/" className="flex items-center space-x-2 group">
//               <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
//                 <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//               </div>
//               <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden xs:inline">
//                 TaskFlow
//               </span>
//             </Link>
//           </div>

//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex items-center space-x-1">
//             {navLinks.map((link) =>
//               link.show && (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   className={`${
//                     pathname === link.href
//                       ? 'text-indigo-600 bg-indigo-50'
//                       : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
//                   } px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200`}
//                 >
//                   {link.label}
//                 </Link>
//               )
//             )}
//           </nav>

//           {/* Desktop Auth Buttons */}
//           <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
//             {loading ? (
//               <div className="flex items-center space-x-2">
//                 <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
//                 <div className="h-4 w-20 lg:w-24 bg-gray-200 rounded animate-pulse"></div>
//               </div>
//             ) : userName ? (
//               <div className="flex items-center space-x-2 lg:space-x-3">
//                 {/* User Info - Shows NAME - Responsive */}
//                 <div className="flex items-center space-x-2 px-2 lg:px-3 py-1.5 lg:py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
//                   <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
//                     <User className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
//                   </div>
//                   <div className="hidden lg:block min-w-0">
//                     <p className="text-xs text-gray-500 font-medium">Welcome back</p>
//                     <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px] xl:max-w-[150px]">
//                       {userName}  {/* ✅ SHOWING NAME INSTEAD OF EMAIL */}
//                     </p>
//                   </div>
//                   <div className="lg:hidden min-w-0">
//                     <p className="text-xs font-semibold text-gray-900 truncate max-w-[80px]">
//                       {userName}  {/* ✅ SHOWING NAME ON SMALLER SCREENS */}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Logout Button - Responsive */}
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
//                 >
//                   <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                   <span className="hidden lg:inline">Logout</span>
//                 </button>
//               </div>
//             ) : (
//               <div className="flex items-center space-x-2 lg:space-x-3">
//                 <Link
//                   href="/login"
//                   className="px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
//                 >
//                   Sign In
//                 </Link>
//                 <Link
//                   href="/register"
//                   className="px-3 lg:px-5 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
//                 >
//                   Get Started
//                 </Link>
//               </div>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <div className="md:hidden">
//             <button
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
//               aria-label="Toggle menu"
//             >
//               {mobileMenuOpen ? (
//                 <X className="w-5 h-5 sm:w-6 sm:h-6" />
//               ) : (
//                 <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu - Fully Responsive */}
//         {mobileMenuOpen && (
//           <div className="md:hidden py-3 sm:py-4 border-t border-gray-200 animate-in slide-in-from-top duration-200">
//             <nav className="flex flex-col space-y-1 sm:space-y-2 mb-3 sm:mb-4">
//               {navLinks.map((link) =>
//                 link.show && (
//                   <Link
//                     key={link.href}
//                     href={link.href}
//                     onClick={() => setMobileMenuOpen(false)}
//                     className={`${
//                       pathname === link.href
//                         ? 'text-indigo-600 bg-indigo-50'
//                         : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
//                     } px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all touch-manipulation`}
//                   >
//                     {link.label}
//                   </Link>
//                 )
//               )}
//             </nav>

//             {/* Mobile Auth Section */}
//             {loading ? (
//               <div className="px-3 sm:px-4 py-2 sm:py-3">
//                 <div className="h-16 sm:h-20 bg-gray-200 rounded-lg animate-pulse"></div>
//               </div>
//             ) : userName ? (
//               <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-3 border-t border-gray-200">
//                 {/* Mobile User Info - Shows NAME */}
//                 <div className="px-3 sm:px-4 py-3 sm:py-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
//                       <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//                     </div>
//                     <div className="min-w-0 flex-1">
//                       <p className="text-xs text-gray-500 font-medium">Signed in as</p>
//                       <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
//                         {userName}  {/* ✅ SHOWING NAME ON MOBILE */}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Mobile Logout Button */}
//                 <button
//                   onClick={() => {
//                     handleLogout();
//                     setMobileMenuOpen(false);
//                   }}
//                   className="w-full flex items-center justify-center space-x-2 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-all touch-manipulation"
//                 >
//                   <LogOut className="w-4 h-4" />
//                   <span>Logout</span>
//                 </button>
//               </div>
//             ) : (
//               <div className="space-y-2 pt-2 sm:pt-3 border-t border-gray-200">
//                 <Link
//                   href="/login"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-all touch-manipulation"
//                 >
//                   Sign In
//                 </Link>
//                 <Link
//                   href="/register"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 text-center text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:shadow-lg active:scale-[0.98] transition-all touch-manipulation"
//                 >
//                   Get Started
//                 </Link>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Header;
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, CheckSquare, LogOut, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isAuthenticated, getUserName, logout } from '@/lib/api';

const Header = () => {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const name = getUserName();
        setUserName(name);
      } else {
        setUserName(null);
      }
      setLoading(false);
    };

    checkAuth();

    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);

    // Scroll effect
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUserName(null);
  };

  const navLinks = [
    { href: '/', label: 'Home', show: true },
    { href: '/chat', label: 'Chat', show: !!userName },
    { href: '/tasks', label: 'My Tasks', show: !!userName },
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-gray-200/80'
          : 'bg-white/80 backdrop-blur-lg border-b border-gray-200/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">

          {/* ── LOGO ── */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <motion.div
              className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/30"
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.div>
            <motion.span
              className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden xs:inline"
              whileHover={{ letterSpacing: '0.02em' }}
              transition={{ duration: 0.2 }}
            >
              TaskFlow
            </motion.span>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav className="hidden md:flex items-center p-1 bg-gray-100/80 rounded-xl gap-0.5">
            {navLinks.map((link) =>
              link.show && (
                <Link key={link.href} href={link.href} className="relative">
                  <motion.span
                    className={`relative inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
                      pathname === link.href
                        ? 'text-indigo-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {pathname === link.href && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200/80"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </motion.span>
                </Link>
              )
            )}
          </nav>

          {/* ── DESKTOP AUTH ── */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : userName ? (
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* User badge */}
                <motion.div
                  className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100/80"
                  whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(99,102,241,0.15)' }}
                >
                  <div className="relative">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <User className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                  </div>
                  <div className="hidden lg:block min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Welcome back</p>
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px] xl:max-w-[150px]">
                      {userName}
                    </p>
                  </div>
                  <div className="lg:hidden min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate max-w-[80px]">{userName}</p>
                  </div>
                </motion.div>

                {/* Logout */}
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200 border border-transparent hover:border-red-100"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link href="/login">
                  <motion.span
                    className="inline-flex px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors duration-200 cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Sign In
                  </motion.span>
                </Link>
                <Link href="/register">
                  <motion.span
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md shadow-indigo-500/25 cursor-pointer"
                    whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(99,102,241,0.35)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Get Started
                  </motion.span>
                </Link>
              </motion.div>
            )}
          </div>

          {/* ── MOBILE MENU BUTTON ── */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors touch-manipulation"
              aria-label="Toggle menu"
              whileTap={{ scale: 0.92 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mobileMenuOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-3 border-t border-gray-100">
                {/* Nav links */}
                <nav className="flex flex-col gap-1 mb-3">
                  {navLinks.map((link, i) =>
                    link.show && (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all touch-manipulation ${
                            pathname === link.href
                              ? 'text-indigo-600 bg-indigo-50 border border-indigo-100'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pathname === link.href && (
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2" />
                          )}
                          {link.label}
                        </Link>
                      </motion.div>
                    )
                  )}
                </nav>

                {/* Mobile Auth */}
                {loading ? (
                  <div className="px-4 py-3">
                    <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                  </div>
                ) : userName ? (
                  <motion.div
                    className="space-y-2 pt-3 border-t border-gray-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    {/* Mobile user card */}
                    <div className="mx-1 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Signed in as</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile logout */}
                    <motion.button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all touch-manipulation border border-transparent hover:border-red-100"
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    className="space-y-2 pt-3 border-t border-gray-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-all touch-manipulation"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-4 py-2.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md shadow-indigo-500/25 transition-all touch-manipulation"
                    >
                      Get Started Free
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;