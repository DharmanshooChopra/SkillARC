import Link from "next/link";
import { GraduationCap, Users } from "lucide-react";

export default function PortalEntry() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-indigo-900 tracking-tight">LearnConnect LMS</h1>
        <p className="text-slate-500 mt-3 text-lg">Select your portal to continue.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl justify-center">
        {/* Faculty Portal Card */}
        <Link 
          href="/faculty" 
          className="group flex-1 bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
        >
          <div className="h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
            <Users className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
            Faculty Portal
          </h2>
          <p className="text-slate-500 mt-2">Manage classes, assignments, and evaluate submissions.</p>
        </Link>

        {/* Student Portal Card */}
        <Link 
          href="/student" 
          className="group flex-1 bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-xl hover:teal-300 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
        >
          <div className="h-24 w-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-teal-100 transition-colors">
            <GraduationCap className="h-12 w-12 text-teal-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">
            Student Portal
          </h2>
          <p className="text-slate-500 mt-2">View tasks, submit assignments, and track grades.</p>
        </Link>
      </div>
    </main>
  );
}
