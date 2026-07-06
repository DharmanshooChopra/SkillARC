"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, BookOpen, Clock, MoreVertical, Plus, GraduationCap, ArrowRight, Activity, X, LayoutGrid } from "lucide-react";

interface Classroom {
  id: number;
  name: string;
  section: string | null;
  class_code: string;
  faculty_id: number;
  active_tasks: number;
}

export default function StudentDashboard() {
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  const STUDENT_ID = 2; // Hardcoded for prototype

  const fetchClasses = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/users/${STUDENT_ID}/classrooms`);
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (err) {
      console.error("Failed to fetch classes", err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      setError("Please enter a Class ID");
      return;
    }
    setError("");
    setIsJoining(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/classrooms/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: STUDENT_ID, class_code: classCode }),
      });
      if (res.ok) {
        setIsJoinModalOpen(false);
        setClassCode("");
        fetchClasses();
      } else {
        setError("Invalid Class Code or you are already enrolled.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
          <GraduationCap className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">Welcome back, Rahul! 👋</h1>
          <p className="text-teal-50 text-lg mb-8 leading-relaxed font-medium">
            You have <strong className="text-white">3 assignments</strong> due this week and <strong className="text-white">1 new announcement</strong>. 
            Keep up the great work and maintain your 3-day streak!
          </p>
          <div className="flex gap-4">
            <Link href="/student/tasks" className="bg-white text-teal-700 px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md hover:bg-teal-50 transition-all active:scale-95 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              View To-Do List
            </Link>
            <button 
              onClick={() => setIsJoinModalOpen(true)}
              className="bg-teal-800/40 backdrop-blur-sm border border-teal-500/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-800/60 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Join a Class
            </button>
          </div>
        </div>
      </div>

      {/* Grid Header */}
      <div className="flex justify-between items-end pt-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-teal-600" /> My Enrolled Classes
          </h2>
          <p className="text-slate-500 font-medium mt-1">Access your course materials and assignments</p>
        </div>
      </div>

      {/* Class Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length > 0 ? classes.map((cls) => (
          <div key={cls.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300 group flex flex-col">
            <div className="h-32 bg-gradient-to-r from-teal-500 to-emerald-400 p-6 relative">
              <button className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-black/10 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-sm">{cls.name}</h3>
                <p className="text-teal-50 text-sm font-medium drop-shadow-sm">{cls.section || 'General'}</p>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>Instructor ID: {cls.faculty_id}</span>
                </div>
                <div className={`flex items-center gap-3 text-sm font-medium ${cls.active_tasks > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cls.active_tasks > 0 ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <span>{cls.active_tasks} active task{cls.active_tasks !== 1 ? 's' : ''} due</span>
                </div>
              </div>
              <Link href={`/student/class/${cls.id}`} className="w-full bg-slate-50 text-teal-700 font-bold py-3 px-4 rounded-xl text-center hover:bg-teal-50 border border-slate-100 transition-colors flex justify-center items-center gap-2 group-hover:bg-teal-600 group-hover:text-white group-hover:shadow-md">
                Enter Class <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white border border-slate-200 border-dashed rounded-3xl text-center">
            <div className="h-20 w-20 bg-teal-50 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">You aren't enrolled in any classes yet</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Get the Class Code from your professor and join your first classroom to get started!
            </p>
            <button 
              onClick={() => setIsJoinModalOpen(true)}
              className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-sm"
            >
              Join a Class
            </button>
          </div>
        )}
      </div>

      {/* Join Class Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
                <Plus className="w-6 h-6 text-teal-600" /> Join Classroom
              </h3>
              <button 
                onClick={() => setIsJoinModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Class Code *</label>
                <input 
                  type="text" 
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="e.g. X7F9K2" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all text-slate-700 font-mono font-bold text-lg placeholder:text-slate-300 uppercase tracking-widest"
                  autoFocus
                />
                <p className="text-xs text-slate-500 font-medium mt-2">
                  Ask your instructor for the 6-character alphanumeric Class Code.
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsJoinModalOpen(false)} 
                className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-200 bg-white border border-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleJoinClass}
                disabled={isJoining || !classCode.trim()}
                className="px-8 py-2.5 font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                {isJoining ? "Joining..." : "Join Class"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
