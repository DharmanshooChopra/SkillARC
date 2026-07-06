import Link from "next/link";
import { ArrowLeft, Megaphone, FolderKanban } from "lucide-react";
import { use } from "react";

export default function StudentClassLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const classId = resolvedParams.id;

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      
      {/* Sub Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            <div className="flex items-center gap-6">
              <Link href="/student" className="text-slate-400 hover:text-slate-700 transition-colors p-2 -ml-2 rounded-full hover:bg-slate-100 group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div className="h-6 w-px bg-slate-200"></div>
              
              <nav className="flex space-x-1 text-sm font-bold">
                <Link 
                  href={`/student/class/${classId}`} 
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Megaphone className="w-4 h-4" /> Announcements
                </Link>
                <Link 
                  href={`/student/class/${classId}/classwork`} 
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <FolderKanban className="w-4 h-4" /> Classwork
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
