"use client";
import React, { useState } from "react";
import Link from "next/link";
import { TopNav } from "../components/TopNav";
import { useAppContext } from "../context/AppContext";
import { CheckSquare, FolderOpen, LayoutGrid, AlertCircle, Plus } from "lucide-react";
import { JoinClassModal } from "../components/JoinClassModal";
import { motion } from "framer-motion";

export function StudentDashboard() {
  const { classes, assignments } = useAppContext();
  const [joinOpen, setJoinOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <TopNav role="student" onJoinClass={() => setJoinOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Classrooms</h1>
          <p className="text-gray-500 mt-1 font-medium">Access your enrolled courses and upcoming tasks.</p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {classes.map((c) => {
            const classAssignments = assignments.filter(a => a.classId === c.id);
            const activeAssignments = classAssignments.filter(a => a.status === 'Active').length;

            return (
              <motion.div key={c.id} variants={itemVariants} whileHover={{ y: -4 }}>
                <Link
                  href={`/student/class/${c.id}`}
                  className="group glass-panel rounded-2xl overflow-hidden hover:shadow-xl hover:border-indigo-300/50 transition-all duration-300 flex flex-col h-full relative"
                >
                  <div className={`${c.color} h-28 p-5 flex items-end relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-0"></div>
                    <div className="absolute top-0 right-0 p-4 opacity-30 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                      <FolderOpen className="w-32 h-32 text-white -mt-10 -mr-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-white relative z-10 truncate w-full tracking-tight drop-shadow-md" title={c.name}>
                      {c.name}
                    </h2>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col bg-white/40">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50/80 px-2.5 py-1 rounded-md border border-indigo-100/50">
                          {c.section}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-700">
                        Dr. Smith
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-slate-200/50 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <div className="flex items-center text-slate-600">
                          <LayoutGrid className="w-4 h-4 mr-2 text-indigo-400" />
                          {classAssignments.length} Total Tasks
                        </div>
                        {activeAssignments > 0 ? (
                          <div className="flex items-center text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                            <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                            {activeAssignments} Pending
                          </div>
                        ) : (
                          <div className="flex items-center text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                            All Caught Up
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {/* Join Class Action Card (Hidden internally, displayed from TopNav usually, but let's add one to grid to match Faculty) */}
          <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
            <button 
              onClick={() => setJoinOpen(true)}
              className="w-full glass-panel border-2 border-dashed border-indigo-200/60 rounded-2xl bg-white/30 hover:bg-white/60 hover:border-indigo-400 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center p-8 h-full min-h-[240px] group"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all duration-300">
                <Plus className="w-8 h-8 text-indigo-400 group-hover:text-white transition-colors" />
              </div>
              <span className="text-xl font-bold text-slate-700 group-hover:text-indigo-700 tracking-tight">Join a Classroom</span>
              <span className="text-sm font-medium text-slate-500 mt-1">Use a code from your professor</span>
            </button>
          </motion.div>
        </motion.div>
      </main>

      <JoinClassModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}
