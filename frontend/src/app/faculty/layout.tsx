import Link from "next/link";
import { Plus, UserCircle, Calendar, BarChart3, LayoutGrid } from "lucide-react";

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Badge */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-bold text-indigo-900 tracking-tight">LearnConnect</span>
              </Link>
              <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">
                Faculty View
              </span>
            </div>

            {/* Center Links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/faculty" className="flex items-center gap-2 text-indigo-600 font-medium border-b-2 border-indigo-600 px-1 py-5">
                <LayoutGrid className="w-4 h-4" />
                My Classes
              </Link>
              <Link href="/faculty/calendar" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors px-1 py-5">
                <Calendar className="w-4 h-4" />
                Global Calendar
              </Link>
              <Link href="/faculty/analytics" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors px-1 py-5">
                <BarChart3 className="w-4 h-4" />
                Overall Analytics
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button className="flex items-center justify-center h-10 w-10 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-sm" title="Create Class">
                <Plus className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                <UserCircle className="w-8 h-8" />
                <span className="text-sm font-medium hidden sm:block">Dr. Smith</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
