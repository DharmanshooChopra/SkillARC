"use client";

import { useState, useEffect, use } from "react";
import { Plus, Code2, ClipboardList, BookOpen, MoreVertical, FileText, Calendar, Clock, X, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { format, parseISO, isAfter } from "date-fns";

// Types
type ClassworkType = "material" | "assignment" | "quiz" | "coding";

interface BaseWork {
  id: number;
  classroom_id: number;
  title: string;
  created_at: string;
}

interface Material extends BaseWork { type: "material"; content: string; }
interface Assignment extends BaseWork { type: "assignment"; description: string; deadline: string; }
interface Quiz extends BaseWork { type: "quiz"; description: string; deadline: string; timer_minutes: number; }
interface Coding extends BaseWork { type: "coding"; problem_statement: string; deadline: string; timer_minutes: number; }

type ClassworkItem = Material | Assignment | Quiz | Coding;

export default function Classwork({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const classId = resolvedParams.id;

  const [items, setItems] = useState<ClassworkItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modalType, setModalType] = useState<ClassworkType | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // Also used for description / problem_statement
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [timer, setTimer] = useState("60");
  const [quizLink, setQuizLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [matRes, assnRes, quizRes, codeRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/classrooms/${classId}/materials`),
        fetch(`http://127.0.0.1:8000/classrooms/${classId}/assignments`),
        fetch(`http://127.0.0.1:8000/classrooms/${classId}/quizzes`),
        fetch(`http://127.0.0.1:8000/classrooms/${classId}/codings`),
      ]);

      const mats = matRes.ok ? await matRes.json() : [];
      const assns = assnRes.ok ? await assnRes.json() : [];
      const quizzes = quizRes.ok ? await quizRes.json() : [];
      const codes = codeRes.ok ? await codeRes.json() : [];

      const merged: ClassworkItem[] = [
        ...mats.map((m: any) => ({ ...m, type: "material" as const })),
        ...assns.map((a: any) => ({ ...a, type: "assignment" as const })),
        ...quizzes.map((q: any) => ({ ...q, type: "quiz" as const })),
        ...codes.map((c: any) => ({ ...c, type: "coding" as const })),
      ];

      // Sort: items with deadlines first (sorted by closest deadline), then materials by creation date
      merged.sort((a, b) => {
        if ("deadline" in a && "deadline" in b) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if ("deadline" in a) return -1;
        if ("deadline" in b) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setItems(merged);
    } catch (err) {
      console.error("Failed to fetch classwork", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [classId]);

  const handleCreate = async () => {
    if (!title) return;
    setIsSubmitting(true);
    
    let uploadedFileUrl = "";
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const uploadRes = await fetch("http://127.0.0.1:8000/upload/", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedFileUrl = uploadData.file_url;
        }
      } catch (err) {
        console.error("File upload failed", err);
      }
    }

    let endpoint = "";
    let payload: any = { title };

    if (modalType === "material") {
      endpoint = "materials";
      payload.content = content;
      if (uploadedFileUrl) payload.file_url = uploadedFileUrl;
    } else {
      // Parse ISO deadline
      const combinedDateTime = new Date(`${deadlineDate}T${deadlineTime || "23:59"}:00`).toISOString();
      payload.deadline = combinedDateTime;
      
      if (modalType === "assignment") {
        endpoint = "assignments";
        payload.description = content;
        if (uploadedFileUrl) payload.file_url = uploadedFileUrl;
      } else if (modalType === "quiz") {
        endpoint = "quizzes";
        payload.description = content;
        payload.timer_minutes = parseInt(timer) || 60;
        if (quizLink) payload.quiz_link = quizLink;
      } else if (modalType === "coding") {
        endpoint = "codings";
        payload.problem_statement = content;
        payload.timer_minutes = parseInt(timer) || 60;
      }
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/classrooms/${classId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        closeModal();
        fetchData();
      }
    } catch (err) {
      console.error("Failed to create", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (type: ClassworkType) => {
    setModalType(type);
    setIsDropdownOpen(false);
    setTitle("");
    setContent("");
    setDeadlineDate("");
    setDeadlineTime("");
    setTimer("60");
    setQuizLink("");
    setFile(null);
  };

  const closeModal = () => setModalType(null);

  const getIcon = (type: string) => {
    switch(type) {
      case "coding": return <Code2 className="w-5 h-5 text-indigo-600" />;
      case "quiz": return <ClipboardList className="w-5 h-5 text-teal-600" />;
      case "assignment": return <FileText className="w-5 h-5 text-blue-600" />;
      case "material": return <BookOpen className="w-5 h-5 text-orange-600" />;
      default: return <BookOpen className="w-5 h-5 text-slate-600" />;
    }
  };

  const getBg = (type: string) => {
    switch(type) {
      case "coding": return "bg-indigo-50 group-hover:bg-indigo-100";
      case "quiz": return "bg-teal-50 group-hover:bg-teal-100";
      case "assignment": return "bg-blue-50 group-hover:bg-blue-100";
      case "material": return "bg-orange-50 group-hover:bg-orange-100";
      default: return "bg-slate-50 group-hover:bg-slate-100";
    }
  };

  return (
    <div className="space-y-8 relative max-w-5xl mx-auto">
      
      {/* Action Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="pl-2">
          <h2 className="text-xl font-bold text-slate-800">Classwork Stream</h2>
          <p className="text-sm text-slate-500 font-medium">Manage assignments, quizzes, and materials</p>
        </div>
        
        {/* Create Button with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md active:translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Create
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20 py-2 animate-in fade-in slide-in-from-top-2">
              <button onClick={() => openModal("assignment")} className="w-full text-left px-4 py-3 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium flex items-center gap-3 transition-colors">
                <FileText className="w-4 h-4" /> Assignment
              </button>
              <button onClick={() => openModal("quiz")} className="w-full text-left px-4 py-3 text-slate-700 hover:bg-teal-50 hover:text-teal-700 font-medium flex items-center gap-3 transition-colors">
                <ClipboardList className="w-4 h-4" /> Quiz
              </button>
              <button onClick={() => openModal("coding")} className="w-full text-left px-4 py-3 text-slate-700 hover:bg-purple-50 hover:text-purple-700 font-medium flex items-center gap-3 transition-colors">
                <Code2 className="w-4 h-4" /> Coding Task
              </button>
              <div className="h-px bg-slate-100 my-1"></div>
              <button onClick={() => openModal("material")} className="w-full text-left px-4 py-3 text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-medium flex items-center gap-3 transition-colors">
                <BookOpen className="w-4 h-4" /> Material
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {items.length > 0 ? items.map((task) => (
          <div key={`${task.type}-${task.id}`} className="group flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-5">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${getBg(task.type)}`}>
                {getIcon(task.type)}
              </div>
              <div>
                <Link href={`/faculty/evaluate/${task.id}`} className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {task.title}
                </Link>
                <div className="flex items-center gap-4 mt-1">
                  {"deadline" in task ? (
                    <p className={`text-sm font-medium flex items-center gap-1.5 ${
                      isAfter(new Date(), parseISO((task as any).deadline)) ? "text-red-500" : "text-slate-500"
                    }`}>
                      <Calendar className="w-3.5 h-3.5" />
                      Due {format(parseISO((task as any).deadline), "MMM d, yyyy • h:mm a")}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500 font-medium">Reference Material</p>
                  )}
                  
                  {"timer_minutes" in task && (
                    <p className="text-sm font-medium flex items-center gap-1.5 text-slate-500 border-l border-slate-200 pl-4">
                      <Clock className="w-3.5 h-3.5" />
                      {(task as any).timer_minutes} mins
                    </p>
                  )}
                  {"file_url" in task && (task as any).file_url && (
                    <a href={(task as any).file_url} target="_blank" rel="noreferrer" className="text-sm font-medium flex items-center gap-1.5 text-indigo-500 hover:text-indigo-700 border-l border-slate-200 pl-4 transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                      View Attachment
                    </a>
                  )}
                  {"quiz_link" in task && (task as any).quiz_link && (
                    <a href={(task as any).quiz_link} target="_blank" rel="noreferrer" className="text-sm font-medium flex items-center gap-1.5 text-teal-500 hover:text-teal-700 border-l border-slate-200 pl-4 transition-colors">
                      <LinkIcon className="w-3.5 h-3.5" />
                      Open Quiz
                    </a>
                  )}
                </div>
              </div>
            </div>
            <button className="text-slate-300 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        )) : (
          <div className="text-center py-20 bg-white/50 border border-slate-200 border-dashed rounded-3xl">
            <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Your classwork is empty</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Click the Create button above to assign homework, quizzes, coding tasks, or upload syllabus materials.
            </p>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getBg(modalType)}`}>
                  {getIcon(modalType)}
                </div>
                <h3 className="font-bold text-slate-800 text-lg capitalize">
                  Create {modalType.replace('_', ' ')}
                </h3>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 rounded-full p-1.5 transition-colors shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Title *</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midterm Assignment 1" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 font-medium" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {modalType === "material" ? "Content / Links" : modalType === "coding" ? "Problem Statement" : "Instructions (Optional)"}
                </label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write instructions or paste links here..." 
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 min-h-[120px] resize-y" 
                />
              </div>

              {(modalType === "material" || modalType === "assignment") && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Upload File</label>
                  <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer border border-slate-200 rounded-lg p-2 bg-slate-50" 
                  />
                </div>
              )}

              {modalType === "quiz" && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">External Quiz Link (e.g., Google Forms)</label>
                  <input 
                    type="url" 
                    value={quizLink}
                    onChange={(e) => setQuizLink(e.target.value)}
                    placeholder="https://forms.gle/..."
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700" 
                  />
                </div>
              )}
              
              {/* Deadline & Timer row */}
              {modalType !== "material" && (
                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" /> Deadline Date *
                      </label>
                      <input 
                        type="date" 
                        value={deadlineDate}
                        onChange={(e) => setDeadlineDate(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-all text-slate-700" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" /> Deadline Time
                      </label>
                      <input 
                        type="time" 
                        value={deadlineTime}
                        onChange={(e) => setDeadlineTime(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-all text-slate-700" 
                      />
                    </div>
                  </div>

                  {(modalType === "quiz" || modalType === "coding") && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" /> Time Limit (Minutes) *
                      </label>
                      <input 
                        type="number" 
                        value={timer}
                        onChange={(e) => setTimer(e.target.value)}
                        placeholder="60"
                        min="1"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-all text-slate-700 font-medium" 
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        The timer begins as soon as the student starts the {modalType}. It will auto-submit when time is up.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={closeModal} className="px-5 py-2 font-semibold text-slate-600 hover:bg-slate-200 bg-white border border-slate-200 rounded-xl transition-colors shadow-sm">
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={!title || isSubmitting || (modalType !== "material" && !deadlineDate)}
                className="px-6 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                {isSubmitting ? "Saving..." : "Assign to Class"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
