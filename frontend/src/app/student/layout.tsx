import Link from "next/link";
import { UserCircle, Calendar, GraduationCap, LayoutGrid, BookOpen } from "lucide-react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Badge */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-black text-teal-900 tracking-tight">LearnConnect</span>
              </Link>
              <span className="px-3 py-1 text-xs font-bold bg-teal-100 text-teal-800 rounded-full border border-teal-200 shadow-sm">
                Student View
              </span>
            </div>

            {/* Center Links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/student" className="flex items-center gap-2 text-teal-600 font-bold border-b-2 border-teal-600 px-1 py-5">
                <LayoutGrid className="w-4 h-4" />
                My Enrolled Classes
              </Link>
              <Link href="/student/tasks" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors px-1 py-5">
                <BookOpen className="w-4 h-4" />
                Global To-Do List
              </Link>
              <Link href="/student/calendar" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors px-1 py-5">
                <Calendar className="w-4 h-4" />
                Calendar
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
                <span className="text-sm font-bold text-slate-700">Streak: 🔥 3 Days</span>
              </div>
              <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors ml-2">
                <UserCircle className="w-9 h-9 text-teal-600" />
                <span className="text-sm font-bold hidden sm:block">Rahul Kumar</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto relative">
        {children}
      </main>
    </div>
  );
}
