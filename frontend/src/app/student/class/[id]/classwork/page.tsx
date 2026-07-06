"use client";

import { useState, useEffect, use } from "react";
import { 
  FileText, BookOpen, FileCheck, Code2, 
  ExternalLink, CheckCircle, Upload, X, Paperclip, Terminal
} from "lucide-react";

interface Material { id: number; title: string; content: string; file_url?: string; created_at: string; }
interface Assignment { id: number; title: string; description: string; file_url?: string; deadline: string; }
interface Quiz { id: number; title: string; description: string; quiz_link?: string; deadline: string; timer_minutes: number; }
interface Coding { id: number; title: string; problem_statement: string; deadline: string; timer_minutes: number; }

export default function StudentClasswork({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const classId = resolvedParams.id;
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [codings, setCodings] = useState<Coding[]>([]);
  
  // Submit Modals State
  const [submitType, setSubmitType] = useState<"assignment" | "quiz" | "coding" | null>(null);
  const [activeWorkId, setActiveWorkId] = useState<number | null>(null);
  const [submitContent, setSubmitContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedWorks, setCompletedWorks] = useState<{ type: string, id: number }[]>([]);

  const STUDENT_ID = 2; // Hardcoded student

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, aRes, qRes, cRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/classrooms/${classId}/materials`),
          fetch(`http://127.0.0.1:8000/classrooms/${classId}/assignments`),
          fetch(`http://127.0.0.1:8000/classrooms/${classId}/quizzes`),
          fetch(`http://127.0.0.1:8000/classrooms/${classId}/codings`),
        ]);
        if (mRes.ok) setMaterials(await mRes.json());
        if (aRes.ok) setAssignments(await aRes.json());
        if (qRes.ok) setQuizzes(await qRes.json());
        if (cRes.ok) setCodings(await cRes.json());
        
        // In a real app, we'd also fetch submissions to populate `completedWorks`
      } catch (err) {
        console.error("Failed to fetch classwork", err);
      }
    };
    fetchData();
  }, [classId]);

  const handleSubmit = async () => {
    if (!submitType || !activeWorkId) return;
    setIsSubmitting(true);
    
    let finalContent = submitContent;

    // Handle File Upload for Assignment
    if (submitType === 'assignment' && selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      try {
        const upRes = await fetch("http://127.0.0.1:8000/upload/", {
          method: "POST",
          body: formData,
        });
        if (upRes.ok) {
          const upData = await upRes.json();
          finalContent = upData.file_url;
        }
      } catch (e) {
        console.error("Upload failed", e);
      }
    }

    try {
      let endpoint = "";
      if (submitType === 'assignment') endpoint = `http://127.0.0.1:8000/assignments/${activeWorkId}/submit`;
      if (submitType === 'quiz') endpoint = `http://127.0.0.1:8000/quizzes/${activeWorkId}/submit`;
      if (submitType === 'coding') endpoint = `http://127.0.0.1:8000/codings/${activeWorkId}/submit`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: STUDENT_ID, content: finalContent || "Completed" })
      });
      
      if (res.ok) {
        setCompletedWorks(prev => [...prev, { type: submitType, id: activeWorkId }]);
        closeModal();
      }
    } catch (e) {
      console.error("Submission failed", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setSubmitType(null);
    setActiveWorkId(null);
    setSubmitContent("");
    setSelectedFile(null);
  };

  const isCompleted = (type: string, id: number) => {
    return completedWorks.some(w => w.type === type && w.id === id);
  };

  const renderWorkCard = (type: string, item: any, icon: React.ReactNode, bgColor: string, iconColor: string) => {
    const done = isCompleted(type, item.id);
    return (
      <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group">
        <div>
          <div className="flex items-start gap-4 mb-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${bgColor} ${iconColor}`}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                {item.title}
                {done && <CheckCircle className="w-5 h-5 text-emerald-500" />}
              </h3>
              {item.deadline && (
                <p className="text-xs font-bold text-rose-500 mt-1 uppercase tracking-wider">
                  Due: {new Date(item.deadline).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <p className="text-slate-600 text-sm mb-4 line-clamp-3">
            {item.description || item.content || item.problem_statement}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
          {(item.file_url || item.quiz_link) && (
            <a 
              href={item.file_url || item.quiz_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 bg-slate-50 text-slate-700 py-2.5 rounded-xl font-bold text-sm text-center hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> Open Material
            </a>
          )}
          {type !== 'material' && (
            <button 
              onClick={() => {
                setSubmitType(type as any);
                setActiveWorkId(item.id);
              }}
              disabled={done}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-center transition-all flex items-center justify-center gap-2 shadow-sm 
                ${done 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed' 
                  : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-md active:scale-95'}`}
            >
              {done ? (
                <>Submitted <CheckCircle className="w-4 h-4" /></>
              ) : (
                <>Submit Work <Upload className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Classwork</h2>
          <p className="text-slate-500 font-medium text-sm">View and submit your assignments</p>
        </div>
      </div>

      {/* Sections */}
      {materials.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" /> Reference Materials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materials.map(m => renderWorkCard('material', m, <FileText className="w-6 h-6" />, 'bg-indigo-50', 'text-indigo-600'))}
          </div>
        </section>
      )}

      {assignments.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-rose-500" /> Assignments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map(a => renderWorkCard('assignment', a, <FileCheck className="w-6 h-6" />, 'bg-rose-50', 'text-rose-600'))}
          </div>
        </section>
      )}

      {quizzes.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-amber-500" /> Quizzes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map(q => renderWorkCard('quiz', q, <CheckCircle className="w-6 h-6" />, 'bg-amber-50', 'text-amber-600'))}
          </div>
        </section>
      )}

      {codings.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-500" /> Coding Tasks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {codings.map(c => renderWorkCard('coding', c, <Code2 className="w-6 h-6" />, 'bg-emerald-50', 'text-emerald-600'))}
          </div>
        </section>
      )}

      {/* Submission Modal */}
      {submitType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-600" /> 
                Submit {submitType.charAt(0).toUpperCase() + submitType.slice(1)}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full p-2 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              
              {submitType === 'assignment' && (
                <>
                  <div className="p-4 border-2 border-dashed border-teal-200 rounded-2xl bg-teal-50 flex justify-center hover:bg-teal-100 transition-colors cursor-pointer group relative">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                    <div className="text-center">
                      <Paperclip className="w-8 h-8 text-teal-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <p className="font-bold text-teal-800">{selectedFile ? selectedFile.name : "Attach File"}</p>
                      <p className="text-xs text-teal-600/70 mt-1">PDF, DOCX, ZIP up to 50MB</p>
                    </div>
                  </div>
                  
                  <div className="text-center text-slate-400 font-bold text-sm">OR</div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Submission Link / Text</label>
                    <textarea 
                      value={submitContent}
                      onChange={(e) => setSubmitContent(e.target.value)}
                      placeholder="Paste your link or type your answer here..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 resize-none h-32 text-slate-700"
                    />
                  </div>
                </>
              )}

              {submitType === 'coding' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> Code / GitHub Link
                  </label>
                  <textarea 
                    value={submitContent}
                    onChange={(e) => setSubmitContent(e.target.value)}
                    placeholder="Paste your code or GitHub repository link here..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none h-48 font-mono text-sm text-slate-700 bg-slate-50"
                  />
                </div>
              )}

              {submitType === 'quiz' && (
                <div className="text-center py-4 space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-2">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">Finished the Quiz?</h4>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    Once you've completed the quiz on Google Forms or the external link, click below to mark it as submitted in LearnConnect.
                  </p>
                </div>
              )}

            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-200 bg-white border border-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || (submitType !== 'quiz' && !submitContent && !selectedFile)}
                className="px-8 py-2.5 font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                {isSubmitting ? "Submitting..." : "Turn In"}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
