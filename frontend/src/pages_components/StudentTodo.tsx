"use client";
import React, { useState } from "react";
import Link from "next/link";
import { TopNav } from "../components/TopNav";
import { useAppContext } from "../context/AppContext";
import { Clock, FileText, Brain, FileCode, AlertCircle, CheckCircle2, BookOpen } from "lucide-react";
import { JoinClassModal } from "../components/JoinClassModal";

const TYPE_CONFIG = {
  Assignment: {
    label: "Assignments",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    borderColor: "border-blue-200",
    headerBg: "bg-blue-600",
  },
  Quiz: {
    label: "Quizzes",
    icon: Brain,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    badgeBg: "bg-violet-50",
    badgeText: "text-violet-700",
    borderColor: "border-violet-200",
    headerBg: "bg-violet-600",
  },
  "Coding Assignment": {
    label: "Coding Tasks",
    icon: FileCode,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    borderColor: "border-emerald-200",
    headerBg: "bg-emerald-600",
  },
} as const;

function getDueDateStatus(dueDate: string) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Overdue", color: "text-red-600 bg-red-50 border border-red-200" };
  if (diffDays === 0) return { label: "Due Today", color: "text-orange-600 bg-orange-50 border border-orange-200" };
  if (diffDays === 1) return { label: "Due Tomorrow", color: "text-orange-500 bg-orange-50 border border-orange-200" };
  if (diffDays <= 3) return { label: `Due in ${diffDays} days`, color: "text-amber-600 bg-amber-50 border border-amber-200" };
  return { label: `Due ${due.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`, color: "text-slate-600 bg-slate-50 border border-slate-200" };
}

const STUDENT_ID = "s1";

export function StudentTodo() {
  const { assignments, classes, submissions } = useAppContext();
  const [joinOpen, setJoinOpen] = useState(false);

  // An item is pending if the student has no submission for it
  const isPending = (a: typeof assignments[0]) => {
    if (a.type === "Material" || a.status === "Posted") return false;
    return !submissions.find(s => s.assignmentId === a.id && s.studentId === STUDENT_ID);
  };

  const pendingByType = {
    Assignment: assignments.filter(a => a.type === "Assignment" && isPending(a)),
    Quiz: assignments.filter(a => a.type === "Quiz" && isPending(a)),
    "Coding Assignment": assignments.filter(a => a.type === "Coding Assignment" && isPending(a)),
  };

  const totalPending = Object.values(pendingByType).reduce((sum, arr) => sum + arr.length, 0);

  const getClass = (classId: string) => classes.find(c => c.id === classId);

  const getLinkForItem = (assignment: typeof assignments[0]) => {
    return `/student/assignment/${assignment.id}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopNav role="student" onJoinClass={() => setJoinOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-7 h-7 text-indigo-600" />
              To-Do List & Deadlines
            </h1>
            <p className="text-gray-500 mt-1">All your pending work, organized by type.</p>
          </div>
          {totalPending > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 font-semibold text-sm">{totalPending} pending</span>
            </div>
          )}
        </div>

        {totalPending === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">All caught up!</h3>
            <p className="text-gray-400 mt-2">No pending assignments, quizzes, or coding tasks.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {(Object.entries(pendingByType) as [keyof typeof TYPE_CONFIG, typeof assignments][]).map(([type, items]) => {
              if (items.length === 0) return null;
              const config = TYPE_CONFIG[type];
              const Icon = config.icon;

              return (
                <div key={type} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Section Header */}
                  <div className={`${config.headerBg} px-6 py-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-white font-bold text-lg">{config.label}</h2>
                    </div>
                    <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full">
                      {items.length} pending
                    </span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-slate-100">
                    {items
                      .sort((a, b) => {
                        if (!a.dueDate) return 1;
                        if (!b.dueDate) return -1;
                        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                      })
                      .map(assignment => {
                        const cls = getClass(assignment.classId);
                        const dueDateStatus = getDueDateStatus(assignment.dueDate);
                        const link = getLinkForItem(assignment);

                        return (
                          <Link
                            key={assignment.id}
                            href={link}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                          >
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconBg}`}>
                              <Icon className={`w-5 h-5 ${config.iconColor}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                                {assignment.title}
                              </h3>
                              {cls && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="text-sm text-slate-500 truncate">{cls.name}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                              {dueDateStatus && (
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${dueDateStatus.color}`}>
                                  {dueDateStatus.label}
                                </span>
                              )}
                              {assignment.dueDate && (
                                <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{new Date(assignment.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                                </div>
                              )}
                              {assignment.maxScore && (
                                <span className={`text-xs font-medium px-2 py-1 rounded-md ${config.badgeBg} ${config.badgeText}`}>
                                  {assignment.maxScore} pts
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <JoinClassModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}
