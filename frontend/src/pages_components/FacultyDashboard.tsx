"use client";
import React from "react";
import Link from "next/link";
import { TopNav } from "../components/TopNav";
import { CreateClassModal } from "../components/CreateClassModal";
import { useAppContext } from "../context/AppContext";
import { Plus, Users, FolderOpen, Edit, Trash2, X, BookOpen, Hash, LayoutGrid, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FacultyDashboard() {
  const { classes, setCreateModalOpen, updateClass, deleteClass, assignments } = useAppContext();
  const [editingClass, setEditingClass] = React.useState<any>(null);
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateClass(editingClass.id, {
        name: editingClass.name,
        section: editingClass.section,
        subjectCode: editingClass.subjectCode,
      });
      setEditingClass(null);
    }
  };

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
      <TopNav role="faculty" />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Classes</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage your active classrooms and assignments.</p>
          </div>
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
                  href={`/faculty/class/${c.id}`}
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
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50/80 px-2.5 py-1 rounded-md border border-indigo-100/50">
                        {c.section}
                      </span>
                      {c.subjectCode && (
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-200/50">
                          {c.subjectCode}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-slate-200/50 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-indigo-400" />
                          {c.studentsCount} Students
                        </div>
                        <div className="flex items-center">
                          <LayoutGrid className="w-4 h-4 mr-2 text-emerald-400" />
                          {activeAssignments} Active Tasks
                        </div>
                      </div>
                      
                      <div className="flex gap-2 justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingClass(c);
                          }}
                          className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors text-slate-400"
                          title="Edit Classroom"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete ${c.name}?`)) {
                              deleteClass(c.id);
                            }
                          }}
                          className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors text-slate-400"
                          title="Delete Classroom"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {/* Create Class Action Card */}
          <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
            <button 
              onClick={() => setCreateModalOpen(true)}
              className="w-full glass-panel border-2 border-dashed border-indigo-200/60 rounded-2xl bg-white/30 hover:bg-white/60 hover:border-indigo-400 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center p-8 h-full min-h-[240px] group"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all duration-300">
                <Plus className="w-8 h-8 text-indigo-400 group-hover:text-white transition-colors" />
              </div>
              <span className="text-xl font-bold text-slate-700 group-hover:text-indigo-700 tracking-tight">Create Classroom</span>
              <span className="text-sm font-medium text-slate-500 mt-1">Setup workspace & enroll students</span>
            </button>
          </motion.div>
        </motion.div>
      </main>

      {/* Edit Class Modal - Upgraded with Framer Motion */}
      <AnimatePresence>
        {editingClass && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-white"
            >
              <div className="px-6 py-5 border-b border-slate-100/50 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">Edit Classroom</h2>
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: "#f1f5f9" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingClass(null)} 
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleEditSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-indigo-500" /> Class Name
                    </label>
                    <input
                      required
                      type="text"
                      value={editingClass.name}
                      onChange={e => setEditingClass({ ...editingClass, name: e.target.value })}
                      className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-indigo-500" /> Section
                      </label>
                      <input
                        required
                        type="text"
                        value={editingClass.section || ''}
                        onChange={e => setEditingClass({ ...editingClass, section: e.target.value })}
                        className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center">
                        <Hash className="w-4 h-4 mr-2 text-indigo-500" /> Subject Code
                      </label>
                      <input
                        required
                        type="text"
                        value={editingClass.subjectCode || ''}
                        onChange={e => setEditingClass({ ...editingClass, subjectCode: e.target.value })}
                        className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                    >
                      Save Changes
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <CreateClassModal />
    </div>
  );
}
