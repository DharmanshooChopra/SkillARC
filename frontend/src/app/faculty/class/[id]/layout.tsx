import Link from "next/link";
import { BookOpen, MessagesSquare, FileText, CheckSquare, Users, Copy } from "lucide-react";

interface Classroom {
  id: number;
  name: string;
  section: string | null;
  class_code: string;
  faculty_id: number;
}

export default async function ClassHubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const classId = resolvedParams.id;
  
  // Fetch classrooms from the backend API
  let classrooms: Classroom[] = [];
  try {
    const res = await fetch("http://127.0.0.1:8000/classrooms/", { cache: "no-store" });
    if (res.ok) {
      classrooms = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch classrooms", err);
  }

  // Find the current classroom to display in the header
  const currentClass = classrooms.find(c => c.id.toString() === classId);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 hidden md:block">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm sticky top-24">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">My Classes</h3>
          <nav className="space-y-1">
            {classrooms.length > 0 ? classrooms.map((cls) => (
              <Link 
                key={cls.id} 
                href={`/faculty/class/${cls.id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  cls.id.toString() === classId 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="truncate">{cls.name}</span>
              </Link>
            )) : (
              <p className="text-sm text-slate-500 px-2">No classes found.</p>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Class Content Area */}
      <div className="flex-1 min-w-0">
        
        {/* Class Header Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl p-6 flex justify-between items-end shadow-md mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight relative z-10">
              {currentClass ? currentClass.name : "Classroom Not Found"}
            </h1>
            <p className="text-indigo-100 mt-1 font-medium relative z-10">
              {currentClass?.section ? currentClass.section : "General Section"}
            </p>
          </div>
          
          {currentClass?.class_code && (
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/30 text-white relative z-10 flex flex-col items-end">
              <span className="text-xs text-indigo-100 uppercase tracking-widest font-bold mb-1">Class Code</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono font-bold tracking-wider">{currentClass.class_code}</span>
              </div>
            </div>
          )}
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <Link 
              href={`/faculty/class/${classId}`}
              className="border-indigo-600 text-indigo-600 flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
            >
              <MessagesSquare className="w-4 h-4" />
              Announcements
            </Link>
            <Link 
              href={`/faculty/class/${classId}/classwork`}
              className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              Classwork
            </Link>
            <Link 
              href={`/faculty/class/${classId}/grades`}
              className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
            >
              <CheckSquare className="w-4 h-4" />
              Grades
            </Link>
            <Link 
              href={`/faculty/class/${classId}/students`}
              className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
            >
              <Users className="w-4 h-4" />
              Students List
            </Link>
          </nav>
        </div>

        {/* Tab Content */}
        {children}

      </div>
    </div>
  );
}
