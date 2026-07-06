"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Calendar as CalendarIcon, ArrowRight, BookOpen, FileCode2, HelpCircle } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string;
  task_type: "assignment" | "quiz" | "coding";
  classroom_id: number;
  classroom_name: string;
  is_submitted: boolean;
}

export default function StudentTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const STUDENT_ID = 2; // Hardcoded for prototype

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/users/${STUDENT_ID}/tasks`);
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const upcomingTasks = tasks.filter(t => !t.is_submitted);
  const completedTasks = tasks.filter(t => t.is_submitted);

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment": return <BookOpen className="w-5 h-5 text-indigo-500" />;
      case "coding": return <FileCode2 className="w-5 h-5 text-rose-500" />;
      case "quiz": return <HelpCircle className="w-5 h-5 text-amber-500" />;
      default: return <BookOpen className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "assignment": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "coding": return "bg-rose-100 text-rose-700 border-rose-200";
      case "quiz": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium">Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Clock className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Global To-Do List</h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">
            You have <strong className="text-teal-600">{upcomingTasks.length} pending tasks</strong> across all your classes.
          </p>
        </div>
      </div>

      {/* Upcoming Tasks Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-600" /> Action Required
        </h2>
        
        {upcomingTasks.length > 0 ? (
          <div className="space-y-3">
            {upcomingTasks.map(task => (
              <div key={`${task.task_type}-${task.id}`} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-300 transition-all group flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    {getIcon(task.task_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeColor(task.task_type)}`}>
                        {task.task_type}
                      </span>
                      <span className="text-xs font-bold text-slate-400">•</span>
                      <span className="text-xs font-bold text-slate-500">{task.classroom_name}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{task.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-sm font-medium text-rose-600">
                      <CalendarIcon className="w-4 h-4" />
                      Due {new Date(task.deadline).toLocaleDateString()} at {new Date(task.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>

                <Link 
                  href={`/student/class/${task.classroom_id}/classwork`}
                  className="w-full sm:w-auto bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-xl border border-slate-200 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  Go to Classwork <ArrowRight className="w-4 h-4" />
                </Link>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">You're all caught up!</h3>
            <p className="text-slate-500 font-medium mt-2">There are no upcoming tasks or assignments due across any of your classes.</p>
          </div>
        )}
      </div>

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Completed Recently
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedTasks.map(task => (
              <div key={`${task.task_type}-${task.id}`} className="bg-white border border-slate-200 rounded-2xl p-5 opacity-75 hover:opacity-100 transition-opacity flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-slate-100 text-slate-500 border-slate-200">
                      {task.task_type}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{task.classroom_name}</span>
                  </div>
                  <h3 className="font-bold text-slate-700 line-through decoration-slate-300">{task.title}</h3>
                </div>
                <div className="flex items-center gap-1 mt-4 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" /> Submitted
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
