"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { TopNav } from "../components/TopNav";
import { useAppContext } from "../context/AppContext";
import {
  MessageSquare, ListTodo, Users, FileCode, CheckCircle2, Clock, FileText,
  Megaphone, Download, Eye, Pencil, Brain, BookOpen, AlertCircle, CheckCircle,
} from "lucide-react";
import { JoinClassModal } from "../components/JoinClassModal";

const STUDENT_ID = "s1";

// Mock student roster per class (same for all classes in this prototype)
const MOCK_STUDENTS = [
  { id: "s1", name: "Alex Johnson", rollNo: "CS101-042" },
  { id: "s2", name: "Rahul Kumar", rollNo: "CS101-015" },
  { id: "s3", name: "Priya Singh", rollNo: "CS101-008" },
  { id: "s4", name: "Arun Patel", rollNo: "CS101-023" },
  { id: "s5", name: "Anjali Desai", rollNo: "CS101-034" },
  { id: "s6", name: "Vikram Shah", rollNo: "CS101-007" },
  { id: "s7", name: "Divya Nair", rollNo: "CS101-019" },
  { id: "s8", name: "Ishita Verma", rollNo: "CS101-027" },
  { id: "s9", name: "Rohan Gupta", rollNo: "CS101-011" },
  { id: "s10", name: "Meera Joshi", rollNo: "CS101-033" },
];

function getStatusMeta(status: string, type: string) {
  if (type === "Material") return { label: "Available", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: <Eye className="w-3 h-3" /> };
  switch (status) {
    case "graded":
    case "Graded": return { label: "Graded", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> };
    case "pending":
    case "Turned In":
    case "Submitted": return { label: "Submitted", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: <CheckCircle className="w-3 h-3" /> };
    case "Missing": return { label: "Missing", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: <AlertCircle className="w-3 h-3" /> };
    default: return { label: "Pending", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: <Clock className="w-3 h-3" /> };
  }
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  "Assignment": <FileText className="w-5 h-5" />,
  "Quiz": <Brain className="w-5 h-5" />,
  "Coding Assignment": <FileCode className="w-5 h-5" />,
  "Material": <BookOpen className="w-5 h-5" />,
};

const TYPE_COLORS: Record<string, string> = {
  "Assignment": "bg-blue-100 text-blue-600",
  "Quiz": "bg-violet-100 text-violet-600",
  "Coding Assignment": "bg-emerald-100 text-emerald-600",
  "Material": "bg-amber-100 text-amber-600",
};

export function StudentClassHub() {
  const { id: classId } = useParams();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as "stream" | "classwork" | "people" | null;
  const [activeTab, setActiveTab] = useState<"stream" | "classwork" | "people">(tabParam || "stream");
  const { classes, assignments, announcements, submissions } = useAppContext();
  const [joinOpen, setJoinOpen] = useState(false);

  // Update active tab when URL changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const currentClass = classes.find(c => c.id === classId) || classes[0];
  const classAssignments = assignments.filter(a => a.classId === currentClass.id);
  const classAnnouncements = announcements.filter(a => a.classId === currentClass.id);
  const classMaterials = classAssignments.filter(a => a.type === "Material");

  // Merge announcements + material posts into a single stream, sorted by date
  const streamItems = [
    ...classAnnouncements.map(a => ({ kind: "announcement" as const, id: a.id, date: a.createdAt, data: a })),
    ...classMaterials.map(m => ({ kind: "material" as const, id: m.id, date: new Date().toISOString(), data: m })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopNav role="student" onJoinClass={() => setJoinOpen(true)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Class Header Banner */}
        <div className={`${currentClass.color} px-8 py-10 relative overflow-hidden flex-shrink-0`}>
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
          <div className="relative z-10 max-w-5xl mx-auto w-full">
            <h1 className="text-3xl font-bold text-white mb-1">{currentClass.name}</h1>
            <p className="text-white/80 font-medium text-lg">Dr. Smith • {currentClass.section}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-8">
            <nav className="flex space-x-8">
              {[
                { id: "stream", label: "Stream", icon: MessageSquare },
                { id: "classwork", label: "Classwork", icon: ListTodo },
                { id: "people", label: "People", icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-teal-600 text-teal-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? "text-teal-600" : "text-gray-400"}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-5xl mx-auto w-full">

            {/* ── STREAM TAB ─────────────────────────────────────────────────── */}
            {activeTab === "stream" && (
              <div className="space-y-5">
                {streamItems.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-slate-600 font-semibold">Nothing posted yet</h3>
                    <p className="text-slate-400 text-sm mt-1">Your teacher hasn't posted any announcements or materials.</p>
                  </div>
                ) : (
                  streamItems.map((item) => {
                    if (item.kind === "announcement") {
                      const ann = item.data;
                      return (
                        <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                              <Megaphone className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{ann.author}</h4>
                              <p className="text-xs text-gray-500">
                                {new Date(ann.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                            <span className="ml-auto text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full">Announcement</span>
                          </div>
                          {ann.text && <p className="text-gray-700 mb-4 whitespace-pre-wrap text-sm leading-relaxed">{ann.text}</p>}
                          {ann.attachments && ann.attachments.length > 0 && (
                            <div className="space-y-2 mt-4">
                              {ann.attachments.map((file: any, i: number) => (
                                <div key={i} className="border border-slate-200 rounded-xl p-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors group">
                                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">{file.type || "Document"}</p>
                                  </div>
                                  <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Material card
                    const mat = item.data as any;
                    return (
                      <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Dr. Smith posted new material</h4>
                            <p className="text-xs text-gray-500">Today</p>
                          </div>
                          <span className="ml-auto text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">Material</span>
                        </div>
                        <div className="border border-amber-200 rounded-xl p-4 flex items-center gap-3 hover:bg-amber-50 cursor-pointer transition-colors group">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900">{mat.title}</p>
                            {mat.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{mat.description}</p>}
                          </div>
                          <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── CLASSWORK TAB ───────────────────────────────────────────────── */}
            {activeTab === "classwork" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 text-lg">All Classwork</h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="px-2 py-1 bg-slate-100 rounded-md font-medium">{classAssignments.length} items</span>
                  </div>
                </div>

                {classAssignments.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
                    <ListTodo className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-slate-600 font-semibold">No classwork yet</h3>
                    <p className="text-slate-400 text-sm mt-1">Your teacher hasn't posted any assignments.</p>
                  </div>
                ) : (
                  classAssignments.map(item => {
                    const mySubmission = submissions.find(
                      s => s.assignmentId === item.id && s.studentId === STUDENT_ID
                    );
                    const submissionStatus = mySubmission
                      ? (mySubmission.status === "graded" ? "graded" : "Submitted")
                      : item.status;
                    const statusMeta = getStatusMeta(submissionStatus, item.type);
                    const isMaterial = item.type === "Material";
                    const canEdit = !mySubmission && !isMaterial;
                    const isGraded = mySubmission?.status === "graded";

                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow group"
                      >
                        {/* Type icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[item.type] || "bg-slate-100 text-slate-600"}`}>
                          {TYPE_ICON[item.type]}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border} flex items-center gap-1`}>
                              {statusMeta.icon} {statusMeta.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                            <span className="font-semibold text-slate-600">{item.type}</span>
                            {item.dueDate && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Due: {item.dueDate}
                              </span>
                            )}
                            {item.maxScore ? <span>{item.maxScore} pts</span> : null}
                            {isGraded && mySubmission?.score !== undefined && (
                              <span className="font-bold text-emerald-700">
                                Score: {mySubmission.score}/{item.maxScore}
                              </span>
                            )}
                            {isGraded && mySubmission?.feedback && (
                              <span className="italic text-slate-400 truncate max-w-[180px]" title={mySubmission.feedback}>
                                "{mySubmission.feedback}"
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isMaterial ? (
                            <div className="flex items-center gap-2">
                              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors">
                                <Eye className="w-3.5 h-3.5" /> View
                              </button>
                              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors">
                                <Download className="w-3.5 h-3.5" /> Download
                              </button>
                            </div>
                          ) : (
                            <Link
                              href={`/student/assignment/${item.id}`}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                canEdit
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {canEdit ? <><Pencil className="w-3.5 h-3.5" /> Open</> : <><Eye className="w-3.5 h-3.5" /> View</>}
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── PEOPLE TAB ──────────────────────────────────────────────────── */}
            {activeTab === "people" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-gray-900 text-lg">Students in this Class</h2>
                  <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                    {MOCK_STUDENTS.length} students
                  </span>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {MOCK_STUDENTS.map((student, i) => (
                    <div
                      key={student.id}
                      className={`flex items-center gap-4 px-6 py-4 ${i < MOCK_STUDENTS.length - 1 ? "border-b border-slate-100" : ""} ${student.id === STUDENT_ID ? "bg-indigo-50/50" : "hover:bg-slate-50"} transition-colors`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-sm">
                        {student.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-gray-900 ${student.id === STUDENT_ID ? "text-indigo-700" : ""}`}>
                          {student.name}
                          {student.id === STUDENT_ID && (
                            <span className="ml-2 text-[10px] font-bold text-indigo-500 bg-indigo-100 px-1.5 py-0.5 rounded-full align-middle">You</span>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{student.rollNo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <JoinClassModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}
