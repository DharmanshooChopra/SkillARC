"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users, BookOpen, Clock, LayoutGrid, List, X, Pencil, Trash2 } from "lucide-react";

interface Classroom {
  id: number;
  name: string;
  section: string;
  class_code: string;
  faculty_id: number;
  student_count: number;
  active_tasks: number;
}

export default function FacultyDashboard() {
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [classSection, setClassSection] = useState("");

  const [editingClass, setEditingClass] = useState<Classroom | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSection, setEditSection] = useState("");

  const gradients = [
    { color: "from-indigo-500 to-indigo-700", bgLight: "bg-indigo-50", textDark: "text-indigo-900" },
    { color: "from-teal-500 to-teal-700", bgLight: "bg-teal-50", textDark: "text-teal-900" },
    { color: "from-violet-500 to-violet-700", bgLight: "bg-violet-50", textDark: "text-violet-900" },
    { color: "from-rose-500 to-rose-700", bgLight: "bg-rose-50", textDark: "text-rose-900" },
    { color: "from-blue-500 to-blue-700", bgLight: "bg-blue-50", textDark: "text-blue-900" }
  ];

  const fetchClasses = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/classrooms/");
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (err) {
      console.error("Failed to fetch classrooms", err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async () => {
    if (!className) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/classrooms/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: className,
          section: classSection || null,
          faculty_id: 1 // Using the seeded faculty user
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setClassName("");
        setClassSection("");
        fetchClasses(); // Refresh list
      }
    } catch (err) {
      console.error("Failed to create class", err);
    }
  };

  const openEditModal = (cls: Classroom) => {
    setEditingClass(cls);
    setEditName(cls.name);
    setEditSection(cls.section || "");
    setIsEditModalOpen(true);
  };

  const handleEditClass = async () => {
    if (!editingClass || !editName) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/classrooms/${editingClass.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, section: editSection || null, faculty_id: 1 })
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingClass(null);
        fetchClasses();
      }
    } catch (err) {
      console.error("Failed to edit class", err);
    }
  };

  const handleDeleteClass = async (id: number) => {
    if (!confirm("Are you sure you want to delete this class? This cannot be undone.")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/classrooms/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchClasses();
      }
    } catch (err) {
      console.error("Failed to delete class", err);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Classes</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your active classrooms and assignments.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <button className="p-2 bg-slate-100 text-slate-800 rounded-md shadow-sm">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Create Class
          </button>
        </div>
      </div>
      
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Active Class Cards */}
        {classes.map((cls, idx) => {
          const theme = gradients[idx % gradients.length];
          return (
            <div key={cls.id} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative">
              
              {/* Card Header */}
              <div className={`h-32 bg-gradient-to-br ${theme.color} p-5 flex flex-col justify-between relative overflow-hidden`}>
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="flex justify-between items-start relative z-10">
                  <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-white/10">
                    {cls.section || "General"}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.preventDefault(); openEditModal(cls); }}
                      className="text-white/70 hover:text-white transition-colors bg-black/10 hover:bg-black/20 p-1.5 rounded-full"
                      title="Edit Class"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.preventDefault(); handleDeleteClass(cls.id); }}
                      className="text-white/70 hover:text-rose-200 transition-colors bg-black/10 hover:bg-rose-500/20 p-1.5 rounded-full"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <Link href={`/faculty/class/${cls.id}`} className="relative z-10 block mt-auto">
                  <h2 className="text-white text-2xl font-bold truncate group-hover:underline decoration-2 underline-offset-4">{cls.name}</h2>
                </Link>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Next Class:</span>
                    </div>
                    <span className="text-slate-800 font-bold">Scheduled</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      <span>Active Tasks:</span>
                    </div>
                    <span className={`font-bold px-2 py-0.5 rounded-md ${theme.bgLight} ${theme.textDark}`}>
                      {cls.active_tasks} pending
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <Users className="h-4 w-4" />
                    <span>{cls.student_count} Student{cls.student_count !== 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm z-10">
                      +0
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })}

        {/* Create Class Action Card */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group flex flex-col items-center justify-center min-h-[300px] bg-slate-50/50 border-2 border-dashed border-slate-300 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-300 cursor-pointer"
        >
          <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-slate-100">
            <Plus className="h-8 w-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <span className="font-bold text-slate-600 group-hover:text-indigo-700 transition-colors text-lg">Create New Class</span>
          <p className="text-slate-400 text-sm mt-2 font-medium px-8 text-center">Set up a new workspace for your students in seconds.</p>
        </button>

      </div>

      {/* Create Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Create New Class</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 rounded-full p-1.5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Class Name *</label>
                <input 
                  type="text" 
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. CS101 - Intro to Programming" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Section (Optional)</label>
                <input 
                  type="text" 
                  value={classSection}
                  onChange={(e) => setClassSection(e.target.value)}
                  placeholder="e.g. Section A"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700" 
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleCreateClass}
                disabled={!className}
                className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
              >
                Create Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {isEditModalOpen && editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Edit Class</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 rounded-full p-1.5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Class Name *</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Section (Optional)</label>
                <input 
                  type="text" 
                  value={editSection}
                  onChange={(e) => setEditSection(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700" 
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleEditClass}
                disabled={!editName}
                className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
