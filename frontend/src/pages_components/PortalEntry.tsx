"use client";
import React from "react";
import Link from "next/link";
import { BookOpen, GraduationCap, Presentation } from "lucide-react";

export function PortalEntry() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Classroom LMS</h1>
        <p className="text-gray-500 mt-2">Empowering education, seamlessly.</p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 max-w-2xl w-full border border-slate-100">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold text-gray-800">Select your portal to continue</h2>
          <p className="text-gray-500 mt-2 text-sm">Choose your role to access your personalized workspace.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/faculty"
            className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-slate-100 bg-white hover:border-indigo-600 hover:bg-indigo-50/50 hover:shadow-md transition-all duration-200"
          >
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <Presentation className="w-10 h-10" />
            </div>
            <span className="text-xl font-bold text-gray-800 group-hover:text-indigo-900 transition-colors">Faculty Portal</span>
            <span className="text-sm text-gray-500 mt-2 text-center">Manage classes, grade assignments, and track analytics.</span>
          </Link>

          <Link
            href="/student"
            className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-slate-100 bg-white hover:border-teal-600 hover:bg-teal-50/50 hover:shadow-md transition-all duration-200"
          >
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <GraduationCap className="w-10 h-10" />
            </div>
            <span className="text-xl font-bold text-gray-800 group-hover:text-teal-900 transition-colors">Student Portal</span>
            <span className="text-sm text-gray-500 mt-2 text-center">Access classes, submit assignments, and view grades.</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
