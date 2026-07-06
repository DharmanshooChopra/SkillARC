"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Check, ExternalLink } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Submission {
  id: number;
  content: string;
  submitted_at: string;
  marks_assigned: number | null;
  feedback: string | null;
  student: User;
}

export default function EvaluationPortal({ params }: { params: Promise<{ assignment_id: string }> }) {
  const resolvedParams = use(params);
  const assignmentId = resolvedParams.assignment_id;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [points, setPoints] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/assignments/${assignmentId}/submissions`);
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data);
        }
      } catch (err) {
        console.error("Failed to fetch submissions", err);
      }
    };
    fetchSubmissions();
  }, [assignmentId]);

  const displayedSubmissions = activeTab === "pending" 
    ? submissions.filter(s => s.marks_assigned === null)
    : submissions;

  const activeSubmission = displayedSubmissions[currentIndex] || null;

  // Update form state when active submission changes
  useEffect(() => {
    if (activeSubmission) {
      setPoints(activeSubmission.marks_assigned !== null ? activeSubmission.marks_assigned.toString() : "");
      setFeedback(activeSubmission.feedback || "");
    }
  }, [activeSubmission]);

  const handleSaveAndNext = async () => {
    if (!activeSubmission) return;
    setIsSaving(true);
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/submissions/${activeSubmission.id}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          marks_assigned: points ? parseInt(points) : null,
          feedback: feedback 
        }),
      });

      if (res.ok) {
        const updatedSub = await res.json();
        // Update local state
        setSubmissions(prev => prev.map(s => s.id === updatedSub.id ? { ...s, marks_assigned: updatedSub.marks_assigned, feedback: updatedSub.feedback } : s));
        
        // Advance queue
        if (currentIndex < displayedSubmissions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error("Failed to save grade", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < displayedSubmissions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const quickGrades = [
    { label: "A+", value: "95" },
    { label: "A", value: "90" },
    { label: "B+", value: "85" },
    { label: "B", value: "80" },
    { label: "C", value: "75" },
  ];

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when typing in textarea/input unless it's a specific global shortcut
      if (document.activeElement?.tagName === "TEXTAREA" || document.activeElement?.tagName === "INPUT") {
         return;
      }

      // 1-5 for quick grades
      if (e.key >= "1" && e.key <= "5") {
        e.preventDefault();
        setPoints(quickGrades[parseInt(e.key) - 1].value);
      }
      // Enter to Save & Next
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSaveAndNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveAndNext]);

  const pendingCount = submissions.filter(s => s.marks_assigned === null).length;

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col">
      {/* Header Context */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 shrink-0 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/faculty/class/1/classwork" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-slate-800 text-lg">Evaluation Queue</h1>
            <p className="text-xs text-slate-500 font-medium">{submissions.length} total • {pendingCount} pending review</p>
          </div>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Pane: Submission Queue */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 flex gap-2">
            <button 
              onClick={() => { setActiveTab("pending"); setCurrentIndex(0); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'pending' ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              Pending ({pendingCount})
            </button>
            <button 
              onClick={() => { setActiveTab("all"); setCurrentIndex(0); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'all' ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              All ({submissions.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {displayedSubmissions.length > 0 ? displayedSubmissions.map((sub, i) => (
              <div 
                key={sub.id} 
                onClick={() => setCurrentIndex(i)}
                className={`relative rounded-xl p-4 cursor-pointer transition-all ${
                  currentIndex === i 
                    ? 'bg-indigo-50 border border-indigo-200 shadow-sm' 
                    : 'bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                {currentIndex === i && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-l-xl"></div>}
                
                {currentIndex === i && (
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-indigo-700 tracking-wider">→ VIEWING NOW</span>
                  </div>
                )}
                
                <h3 className={`font-semibold ${currentIndex === i ? 'text-slate-900' : 'text-slate-700'}`}>
                  {(i + 1).toString().padStart(2, '0')}. {sub.student.name}
                </h3>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-slate-500">{new Date(sub.submitted_at).toLocaleTimeString()}</p>
                  {sub.marks_assigned !== null && <span className="text-xs font-bold text-emerald-600">{sub.marks_assigned}%</span>}
                </div>
              </div>
            )) : (
              <div className="text-center text-slate-500 py-8 text-sm">
                No submissions in this queue.
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Evaluation Area */}
        <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
          {activeSubmission ? (
            <div className="max-w-4xl mx-auto w-full p-8 flex flex-col gap-6">
              
              {/* Student Header Info */}
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{activeSubmission.student.name}</h2>
                  <div className="flex gap-4 text-sm text-slate-500 mt-1">
                    <span>Email: {activeSubmission.student.email}</span>
                    <span>•</span>
                    <span>Submitted {new Date(activeSubmission.submitted_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-indigo-100 text-indigo-800 font-bold px-4 py-2 rounded-lg">
                  Queue: {currentIndex + 1} of {displayedSubmissions.length}
                </div>
              </div>

              {/* Submission Content Container */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative overflow-hidden flex flex-col gap-4">
                <h3 className="font-bold text-slate-700 border-b border-slate-100 pb-2">Student's Submission</h3>
                
                {activeSubmission.content && (activeSubmission.content.startsWith('http') || activeSubmission.content.startsWith('www')) ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                    <FileText className="w-16 h-16 text-indigo-300 mb-4" />
                    <h4 className="text-slate-700 font-medium mb-2">Attachment or Link Provided</h4>
                    <a 
                      href={activeSubmission.content} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow flex items-center gap-2"
                    >
                      Open Link / File <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-slate-800 whitespace-pre-wrap font-mono text-sm overflow-x-auto">
                    {activeSubmission.content || "No text provided."}
                  </div>
                )}
              </div>

              {/* Evaluation Controls */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col gap-6">
                
                {/* Scoring */}
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-2 tracking-wide uppercase">Points Awarded</label>
                    <input 
                      type="number" 
                      value={points}
                      onChange={(e) => setPoints(e.target.value)}
                      placeholder="0 - 100" 
                      className="w-full text-2xl font-bold text-slate-800 border-b-2 border-slate-200 pb-2 focus:outline-none focus:border-indigo-600 transition-colors bg-transparent"
                    />
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                    <span className="block text-xs font-bold text-slate-500 mb-1 tracking-wide uppercase">Percentage</span>
                    <span className="text-2xl font-bold text-indigo-700">{points ? `${points} %` : '--'}</span>
                  </div>
                </div>

                {/* Quick Grades */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-3 tracking-wide uppercase">Quick Grade</label>
                  <div className="flex gap-2">
                    {quickGrades.map((q, i) => (
                      <button 
                        key={q.label}
                        onClick={() => setPoints(q.value)}
                        className={`flex-1 py-3 rounded-xl font-bold border transition-all ${
                          points === q.value 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md transform -translate-y-0.5' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        {q.label}
                        <span className="block text-xs font-normal opacity-70">({q.value})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 tracking-wide uppercase">Feedback (Optional)</label>
                  <textarea 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Great work! Consider adding..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all resize-none h-24"
                  ></textarea>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Check className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
                <h2 className="text-xl font-bold text-slate-700">All caught up!</h2>
                <p className="mt-2">No more submissions in this queue.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Action Bar */}
      <footer className="bg-white border-t border-slate-200 p-4 shrink-0 flex justify-between items-center px-8 z-10">
        <span className="text-xs text-slate-400 font-medium">💡 Press <kbd className="bg-slate-100 px-1 rounded">ENTER</kbd> to Save & Next | <kbd className="bg-slate-100 px-1 rounded">1-5</kbd> for Quick Grade</span>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSkip}
            disabled={!activeSubmission || currentIndex === displayedSubmissions.length - 1}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            Skip to Next →
          </button>
          <button 
            onClick={handleSaveAndNext}
            disabled={!activeSubmission || isSaving}
            className="px-8 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:transform-none transition-all shadow-lg shadow-green-600/20 flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <Check className="w-5 h-5" /> {isSaving ? "Saving..." : "Save & Next"}
          </button>
        </div>
      </footer>
    </div>
  );
}
