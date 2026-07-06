"use client";

import { useState, useEffect, use } from "react";
import { CheckSquare, AlertCircle } from "lucide-react";

interface GradebookData {
  students: { id: number; name: string }[];
  assignments: { id: number; title: string }[];
  submissions: { student_id: number; assignment_id: number; marks_assigned: number | null }[];
}

export default function FacultyGrades({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const classId = resolvedParams.id;
  
  const [data, setData] = useState<GradebookData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGradebook = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/classrooms/${classId}/gradebook`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch gradebook", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGradebook();
  }, [classId]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium">Loading gradebook...</p>
      </div>
    );
  }

  if (!data || data.students.length === 0) {
    return (
      <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center flex flex-col items-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">No students enrolled yet</h3>
        <p className="text-slate-500 mt-2">The gradebook requires active student enrollments.</p>
      </div>
    );
  }

  const getGrade = (studentId: number, assignmentId: number) => {
    const sub = data.submissions.find(s => s.student_id === studentId && s.assignment_id === assignmentId);
    if (!sub) return <span className="text-slate-300 font-medium text-xs">Missing</span>;
    if (sub.marks_assigned === null) return <span className="text-amber-500 font-bold text-xs">Pending</span>;
    return <span className="text-indigo-700 font-black">{sub.marks_assigned}%</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Master Gradebook</h2>
            <p className="text-sm font-medium text-slate-500">
              Overview of all assignments and grades
            </p>
          </div>
        </div>
        <button className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-200 transition-colors">
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-bold border-r border-slate-200 sticky left-0 bg-slate-50 z-10 w-48">Student Name</th>
                {data.assignments.map(assn => (
                  <th key={assn.id} className="p-4 font-bold text-center min-w-[120px] whitespace-nowrap">
                    {assn.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-800 border-r border-slate-200 sticky left-0 bg-white z-10">
                    {student.name}
                  </td>
                  {data.assignments.map(assn => (
                    <td key={assn.id} className="p-4 text-center border-r border-slate-100 last:border-r-0">
                      {getGrade(student.id, assn.id)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
