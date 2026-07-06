"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { BookOpen, Calendar, Plus, User, CheckSquare, FileText, Library, Home, LogOut, ChevronDown, Bell, Megaphone, ClipboardList } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export function TopNav({ role, onJoinClass }: { role: "faculty" | "student"; onJoinClass?: () => void }) {
  const location = usePathname();
  const router = useRouter();
  const { setCreateModalOpen, notifications, markNotificationRead, classes } = useAppContext();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const isFaculty = role === "faculty";
  const homePath = isFaculty ? "/faculty" : "/student";
  const userName = isFaculty ? "Dr. Smith" : "Alex Johnson";
  
  const facultyLinks = [
    { name: "My Classes", path: "/faculty", icon: BookOpen },
    { name: "Global Calendar", path: "/faculty/calendar", icon: Calendar },
  ];

  const studentLinks = [
    { name: "My Classrooms", path: "/student", icon: Library },
    { name: "To-Do List/Deadlines", path: "/student/todo", icon: CheckSquare },
    { name: "Calendar", path: "/student/calendar", icon: Calendar },
    { name: "My Report Card", path: "/student/report", icon: FileText },
  ];

  const links = isFaculty ? facultyLinks : studentLinks;

  const unreadNotifications = notifications.filter(n => !n.read);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="glass-panel sticky top-0 z-50 border-b-0"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors" title="Back to Portal Selection">
              <Home className="w-5 h-5" />
            </Link>

            <Link href={homePath} className="flex items-center gap-2 border-r border-slate-200/60 pr-6 mr-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 leading-tight text-lg tracking-tight">Classroom</span>
                <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">{isFaculty ? "Faculty View" : "Student View"}</span>
              </div>
            </Link>

            <div className="hidden sm:flex sm:space-x-2">
              {links.map((link) => {
                const isActive = location === link.path;
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                      isActive
                        ? "text-indigo-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-slate-50/50"
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-indigo-50 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <link.icon className="w-4 h-4 mr-2 relative z-10" />
                    <span className="relative z-10">{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isFaculty && (
              <div className="relative" ref={notifRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl overflow-hidden z-50 border border-white/60"
                    >
                      <div className="px-4 py-3 border-b border-slate-100/50 bg-white/40 flex justify-between items-center backdrop-blur-md">
                        <h3 className="font-semibold text-gray-900 tracking-tight">Notifications</h3>
                        {unreadNotifications.length > 0 && (
                          <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full shadow-sm">
                            {unreadNotifications.length} new
                          </span>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-gray-500">No notifications</div>
                        ) : (
                          notifications.map(n => {
                            const cls = classes.find(c => c.id === n.classId);
                            const isAnnouncement = n.type === 'announcement';
                            return (
                              <motion.div
                                whileHover={{ backgroundColor: "rgba(248, 250, 252, 0.5)" }}
                                key={n.id}
                                onClick={() => {
                                  if (!n.read) markNotificationRead(n.id);
                                  if (n.classId) router.push(`/student/class/${n.classId}`);
                                  setNotificationsOpen(false);
                                }}
                                className={`p-4 border-b border-slate-100/50 cursor-pointer transition-colors ${!n.read ? 'bg-indigo-50/20' : 'bg-transparent'}`}
                              >
                                <div className="flex gap-3 items-start">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${isAnnouncement ? 'bg-violet-100 text-violet-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                    {isAnnouncement ? <Megaphone className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <h4 className={`text-sm leading-snug ${!n.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                        {n.title}
                                      </h4>
                                      {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1 ml-2 shadow-[0_0_8px_rgba(79,70,229,0.6)]"></span>}
                                    </div>
                                    {cls && (
                                      <p className="text-[10px] text-indigo-500 font-bold mt-0.5 truncate uppercase tracking-wider">{cls.name}</p>
                                    )}
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{n.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                                      {new Date(n.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {isFaculty ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCreateModalOpen(true)}
                className="hidden sm:flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Class
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (onJoinClass) onJoinClass();
                }}
                className="hidden sm:flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Join Class
              </motion.button>
            )}

            <div className="relative" ref={profileRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shadow-sm border border-white">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden md:flex flex-col items-start mr-1">
                  <span className="text-sm font-semibold text-gray-700 leading-tight tracking-tight">{userName}</span>
                  <span className="text-[10px] text-gray-500 capitalize font-medium">{role}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-48 glass-panel rounded-2xl overflow-hidden z-50 border border-white/60"
                  >
                    <div className="py-1">
                      <button 
                        onClick={() => router.push('/')}
                        className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
