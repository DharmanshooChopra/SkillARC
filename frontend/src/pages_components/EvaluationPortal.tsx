"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppContext } from "../context/AppContext";
import type { StudentSubmission } from "../context/AppContext";
import { notSubmitted } from "../data/mockData";
import {
  ArrowLeft,
  Check,
  SkipForward,
  RotateCcw,
  Terminal,
  CheckCircle,
  FileText,
  Award,
  User,
  Clock,
  ChevronRight,
  X,
} from "lucide-react";

// ─── Quiz results table ──────────────────────────────────────────────────────

function QuizResultsView({
  submissions,
  assignment,
}: {
  submissions: StudentSubmission[];
  assignment: any;
}) {
  const maxScore = assignment.maxScore ?? 10;
  const questions = assignment.questions ?? [];
  const [selected, setSelected] = useState<StudentSubmission | null>(null);

  const avg = submissions.length
    ? (submissions.reduce((s, sub) => s + (sub.score ?? 0), 0) / submissions.length).toFixed(1)
    : "–";

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Submitted", value: submissions.length, color: "text-gray-900" },
            { label: "Avg Score", value: `${avg}/${maxScore}`, color: "text-blue-600" },
            {
              label: "Pass Rate",
              value: `${Math.round((submissions.filter(s => (s.score ?? 0) >= maxScore * 0.5).length / (submissions.length || 1)) * 100)}%`,
              color: "text-green-600",
            },
            {
              label: "Top Score",
              value: `${Math.max(...submissions.map(s => s.score ?? 0), 0)}/${maxScore}`,
              color: "text-indigo-600",
            },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-emerald-50 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-emerald-800">Auto-Graded Results</h3>
            <span className="ml-auto text-xs text-emerald-600 font-medium">No manual grading required</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll No</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Percentage</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((sub, idx) => {
                const pct = Math.round(((sub.score ?? 0) / maxScore) * 100);
                const passed = pct >= 50;
                return (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-400">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {sub.studentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{sub.studentName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 font-mono">{sub.rollNo}</td>
                    <td className="px-5 py-3">
                      <span className="font-bold text-gray-900 text-sm">{sub.score ?? '–'}</span>
                      <span className="text-gray-400 text-xs">/{maxScore}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {passed ? '✓ Passed' : '✗ Failed'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{sub.submittedAt}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setSelected(sub)}
                        className="text-xs text-indigo-600 hover:underline font-medium"
                      >
                        View Answers
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quiz Answer Detail Modal */}
      {selected && questions.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">{selected.studentName}</h3>
                <p className="text-sm text-gray-500">
                  Score: {selected.score}/{maxScore} ({Math.round(((selected.score ?? 0) / maxScore) * 100)}%)
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {questions.map((q: any, qi: number) => {
                const studentAns = selected.quizAnswers?.[qi] ?? -1;
                const correct = studentAns === q.answer;
                return (
                  <div key={qi} className={`p-4 rounded-xl border ${correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <p className="font-medium text-gray-800 text-sm mb-3">
                      <span className="text-gray-500 mr-2">Q{qi + 1}.</span>{q.q}
                    </p>
                    <div className="space-y-1">
                      {q.options.map((opt: string, oi: number) => (
                        <div key={oi} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${
                          oi === q.answer ? 'bg-green-200 text-green-900 font-semibold' :
                          oi === studentAns && !correct ? 'bg-red-200 text-red-900' :
                          'text-gray-600'
                        }`}>
                          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs flex-shrink-0">
                            {String.fromCharCode(65 + oi)}
                          </span>
                          {opt}
                          {oi === q.answer && <span className="ml-auto text-xs">(Correct)</span>}
                          {oi === studentAns && !correct && <span className="ml-auto text-xs">(Selected)</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Queue-based evaluation (Assignment / Coding) ────────────────────────────

function QueueEvaluationView({
  submissions,
  notSubmittedList,
  assignment,
}: {
  submissions: StudentSubmission[];
  notSubmittedList: { id: string; name: string; rollNo: string }[];
  assignment: any;
}) {
  const { gradeSubmission } = useAppContext();
  const [subs, setSubs] = useState(submissions);
  const [activeQueueTab, setActiveQueueTab] = useState<"pending" | "graded">("pending");

  const pending = subs.filter(s => s.status === 'pending');
  const graded = subs.filter(s => s.status === 'graded');

  const [currentIdx, setCurrentIdx] = useState(0);
  const queueList = activeQueueTab === 'pending' ? pending : graded;
  const current = queueList[currentIdx] ?? pending[0] ?? graded[0] ?? null;

  const [scoreInput, setScoreInput] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (current) {
      setScoreInput(current.score != null ? String(current.score) : "");
      setFeedback(current.feedback ?? "");
    }
  }, [current?.id]);

  const maxScore = assignment.maxScore ?? 100;
  const isCoding = assignment.type === 'Coding Assignment';

  const quickGrades = [
    { label: "A+", value: Math.round(maxScore * 0.97) },
    { label: "A", value: Math.round(maxScore * 0.92) },
    { label: "B+", value: Math.round(maxScore * 0.87) },
    { label: "B", value: Math.round(maxScore * 0.80) },
    { label: "C", value: Math.round(maxScore * 0.70) },
  ];

  const handleSaveAndNext = () => {
    if (!current || !scoreInput) return;
    gradeSubmission(current.id, Number(scoreInput), feedback);
    setSubs(prev => prev.map(s => s.id === current.id ? { ...s, status: 'graded' as const, score: Number(scoreInput), feedback } : s));
    const nextIdx = currentIdx + 1;
    if (nextIdx < queueList.length) {
      setCurrentIdx(nextIdx);
    } else {
      setCurrentIdx(0);
      setActiveQueueTab('graded');
    }
    setScoreInput("");
    setFeedback("");
  };

  const handleSkip = () => {
    const nextIdx = currentIdx + 1 < queueList.length ? currentIdx + 1 : 0;
    setCurrentIdx(nextIdx);
  };

  const handleUndo = () => {
    if (!current) return;
    setSubs(prev => prev.map(s => s.id === current.id ? { ...s, status: 'pending' as const, score: undefined, feedback: '' } : s));
    setScoreInput("");
    setFeedback("");
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'Enter') handleSaveAndNext();
      if (e.key === 'Tab') { e.preventDefault(); handleSkip(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, scoreInput, feedback]);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Queue */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveQueueTab("pending"); setCurrentIdx(0); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeQueueTab === "pending" ? "bg-orange-50 text-orange-700 border border-orange-200" : "text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
            >
              Pending ({pending.length})
            </button>
            <button
              onClick={() => { setActiveQueueTab("graded"); setCurrentIdx(0); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeQueueTab === "graded" ? "bg-green-50 text-green-700 border border-green-200" : "text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
            >
              Graded ({graded.length})
            </button>
          </div>
          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span>{subs.length} total submitted</span>
            <span>{Math.round((graded.length / (subs.length || 1)) * 100)}% graded</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(graded.length / (subs.length || 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {queueList.length === 0 && (
            <div className="text-center py-10 text-sm text-gray-400">
              {activeQueueTab === 'pending' ? 'All submissions graded! 🎉' : 'No graded submissions yet.'}
            </div>
          )}
          {queueList.map((sub, idx) => (
            <button
              key={sub.id}
              onClick={() => setCurrentIdx(idx)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                current?.id === sub.id
                  ? "border-indigo-500 bg-indigo-50 shadow-sm"
                  : "border-transparent bg-white hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm truncate ${current?.id === sub.id ? "text-indigo-900" : "text-gray-800"}`}>
                    <span className="text-gray-400 mr-1.5">{String(idx + 1).padStart(2, '0')}.</span>
                    {sub.studentName}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                    <span className="font-mono">{sub.rollNo}</span>
                    <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{sub.submittedAt}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end ml-2 flex-shrink-0">
                  {current?.id === sub.id && (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full mb-1">VIEWING</span>
                  )}
                  {sub.status === 'graded' && sub.score != null && (
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      {sub.score}/{maxScore}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}

          {/* Not Submitted */}
          {notSubmittedList.length > 0 && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <h3 className="text-xs font-bold text-gray-400 mb-2 tracking-wider uppercase px-1">
                Not Submitted ({notSubmittedList.length})
              </h3>
              {notSubmittedList.map(ns => (
                <div key={ns.id} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-2 opacity-60 mb-1">
                  <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-600 text-xs">{ns.name}</div>
                    <div className="text-gray-400 text-[10px] font-mono">{ns.rollNo}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Right: Evaluation area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {!current ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">All Done!</h3>
            <p className="text-gray-500 mt-2">All submissions have been graded.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
              {/* Student header */}
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{current.studentName}</h2>
                  <div className="flex items-center text-sm text-gray-500 mt-1 gap-3">
                    <span className="font-medium text-gray-700 bg-gray-200 px-2 py-0.5 rounded font-mono text-xs">{current.rollNo}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Submitted {current.submittedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {current.status === 'graded' && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Graded: {current.score}/{maxScore}
                    </span>
                  )}
                  <div className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-lg text-sm font-bold">
                    {queueList.indexOf(current) + 1} / {queueList.length}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="flex-1 p-6 flex flex-col gap-6">
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 overflow-hidden relative min-h-[240px]">
                  {isCoding && current.codeContent ? (
                    <div className="absolute inset-0 bg-slate-900 p-6 font-mono text-sm text-green-400 overflow-y-auto w-full text-left flex flex-col">
                      <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-700 pb-2">
                        <Terminal className="w-4 h-4" />
                        <span>solution.{current.language === 'python' ? 'py' : current.language === 'java' ? 'java' : 'cpp'}</span>
                        <span className="ml-auto text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{current.language}</span>
                      </div>
                      <pre className="text-sm leading-relaxed"><code>{current.codeContent}</code></pre>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full py-12">
                      <FileText className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-gray-600 font-medium mb-4">student_submission.pdf</p>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm transition-colors">
                        Open Preview
                      </button>
                    </div>
                  )}
                </div>

                {/* Grading Controls */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex gap-4 mb-5">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Points Awarded</label>
                      <input
                        type="number"
                        placeholder={`0 – ${maxScore}`}
                        value={scoreInput}
                        onChange={e => setScoreInput(e.target.value)}
                        min={0}
                        max={maxScore}
                        className="w-full text-2xl font-bold text-gray-900 border-2 border-gray-200 rounded-xl p-3 focus:border-indigo-500 focus:ring-0 outline-none transition-colors"
                      />
                    </div>
                    <div className="w-44">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Percentage</label>
                      <div className={`w-full text-2xl font-bold bg-gray-50 border-2 border-transparent rounded-xl p-3 flex items-center ${
                        scoreInput ? Number(scoreInput) >= maxScore * 0.7 ? 'text-green-600' : Number(scoreInput) >= maxScore * 0.5 ? 'text-yellow-600' : 'text-red-500' : 'text-gray-400'
                      }`}>
                        {scoreInput ? `${Math.round((Number(scoreInput) / maxScore) * 100)}%` : "– %"}
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quick Grade</label>
                    <div className="flex gap-2">
                      {quickGrades.map(q => (
                        <button
                          key={q.label}
                          onClick={() => setScoreInput(q.value.toString())}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors border ${
                            scoreInput === String(q.value)
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700'
                          }`}
                        >
                          {q.label} ({q.value})
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Feedback (Optional)</label>
                    <textarea
                      rows={2}
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-indigo-500 focus:ring-0 outline-none transition-colors text-gray-700 resize-none"
                      placeholder="Great work! Consider..."
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAndNext}
                    disabled={!scoreInput}
                    className="flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-sm transition-colors"
                  >
                    <Check className="w-4 h-4 mr-2" /> Save & Next
                  </button>
                  <button
                    onClick={handleSkip}
                    className="flex items-center px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-colors"
                  >
                    <SkipForward className="w-4 h-4 mr-2" /> Skip
                  </button>
                  {current.status === 'graded' && (
                    <button
                      onClick={handleUndo}
                      className="flex items-center px-4 py-2.5 bg-white border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 text-gray-600 font-bold rounded-xl shadow-sm transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" /> Undo Grade
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  <span className="text-gray-600 mr-2">⌨</span>ENTER to save • TAB to skip
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Main EvaluationPortal ───────────────────────────────────────────────────

export function EvaluationPortal() {
  const { assignmentId } = useParams();
  const { assignments, submissions } = useAppContext();

  const assignment = assignments.find(a => a.id === assignmentId) || assignments[0];
  const assignmentSubs = submissions.filter(s => s.assignmentId === assignment.id);

  const typeLabels: Record<string, string> = {
    'Assignment': 'Assignment Evaluation',
    'Quiz': 'Quiz Results',
    'Coding Assignment': 'Code Review',
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href={`/faculty/class/${assignment.classId}`}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                {typeLabels[assignment.type] ?? 'Evaluation'}
              </h1>
              {assignment.type === 'Quiz' && (
                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Auto-graded</span>
              )}
            </div>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              {assignment.title}
              <span className="mx-2">•</span>
              <span className="text-indigo-600">{assignmentSubs.length} submitted</span>
              {assignment.type !== 'Quiz' && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-orange-500">
                    {assignmentSubs.filter(s => s.status === 'pending').length} pending
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Award className="w-4 h-4" />
          <span>Max score: <strong className="text-gray-900">{assignment.maxScore ?? 100}</strong></span>
        </div>
      </header>

      {/* Body: quiz shows table; others show queue */}
      {assignment.type === 'Quiz' ? (
        <QuizResultsView submissions={assignmentSubs} assignment={assignment} />
      ) : (
        <QueueEvaluationView
          submissions={assignmentSubs}
          notSubmittedList={notSubmitted}
          assignment={assignment}
        />
      )}
    </div>
  );
}
