"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Play, Terminal, Clock, FileCode2, CheckCircle2,
  FileText, Paperclip, X, ChevronRight, ChevronLeft, BookOpen, Code2,
  CheckSquare, AlertCircle, Download, Loader2, Flag, Send, AlertTriangle,
  RotateCcw, Eye, Trophy,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const STUDENT_ID = "s1";
const STUDENT_NAME = "Alex Johnson";

const mockDownload = (filename: string) => {
  const blob = new Blob([`Mock content for ${filename}\n\nDownloaded from LMS.`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ─── Language templates ──────────────────────────────────────────────────────
const LANG_TEMPLATES: Record<string, string> = {
  python: `class Queue:
    def __init__(self):
        self.items = []

    def enqueue(self, item):
        self.items.append(item)

    def dequeue(self):
        if self.is_empty():
            return None
        return self.items.pop(0)

    def peek(self):
        return self.items[0] if self.items else None

    def is_empty(self):
        return len(self.items) == 0

# Test
q = Queue()
q.enqueue(1)
q.enqueue(2)
print(q.dequeue())
print(q.peek())`,
  javascript: `class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    if (this.isEmpty()) return null;
    return this.items.shift();
  }

  peek() {
    return this.items[0] || null;
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

// Test
const q = new Queue();
q.enqueue(1);
q.enqueue(2);
console.log(q.dequeue()); // 1
console.log(q.peek());    // 2`,
  java: `import java.util.LinkedList;

public class Queue<T> {
    private LinkedList<T> list = new LinkedList<>();

    public void enqueue(T item) {
        list.addLast(item);
    }

    public T dequeue() {
        if (list.isEmpty()) return null;
        return list.removeFirst();
    }

    public T peek() {
        if (list.isEmpty()) return null;
        return list.getFirst();
    }

    public static void main(String[] args) {
        Queue<Integer> q = new Queue<>();
        q.enqueue(1);
        q.enqueue(2);
        System.out.println(q.dequeue()); // 1
        System.out.println(q.peek());    // 2
    }
}`,
  cpp: `#include <iostream>
#include <deque>
using namespace std;

template<typename T>
class Queue {
private:
    deque<T> data;
public:
    void enqueue(T item) { data.push_back(item); }
    T dequeue() {
        if (data.empty()) return T();
        T front = data.front();
        data.pop_front();
        return front;
    }
    T peek() { return data.empty() ? T() : data.front(); }
};

int main() {
    Queue<int> q;
    q.enqueue(1);
    q.enqueue(2);
    cout << q.dequeue() << endl; // 1
    cout << q.peek() << endl;    // 2
    return 0;
}`,
};

const LANGUAGES = [
  { id: "python", label: "Python", ext: ".py", color: "#3572A5" },
  { id: "javascript", label: "JavaScript", ext: ".js", color: "#f1e05a" },
  { id: "java", label: "Java", ext: ".java", color: "#b07219" },
  { id: "cpp", label: "C++", ext: ".cpp", color: "#f34b7d" },
];

// ─── Confirm Submit Modal ─────────────────────────────────────────────────────
function ConfirmSubmitModal({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
  variant = "indigo",
}: {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "indigo" | "emerald" | "amber";
}) {
  if (!open) return null;
  const colors: Record<string, string> = {
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    amber: "bg-amber-500 hover:bg-amber-600",
  };
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
            <div className="text-sm text-gray-600 leading-relaxed">{body}</div>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-sm font-bold text-white rounded-xl transition-colors ${colors[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Quiz Timer ───────────────────────────────────────────────────────────────
function QuizTimer({ limitMinutes, onExpire }: { limitMinutes: number; onExpire: () => void }) {
  const [secsLeft, setSecsLeft] = useState(limitMinutes * 60);

  useEffect(() => {
    const t = setInterval(() => {
      setSecsLeft(s => {
        if (s <= 1) { clearInterval(t); onExpire(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(secsLeft / 60);
  const secs = secsLeft % 60;
  const isWarning = secsLeft < 120;
  const isCritical = secsLeft < 60;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold tabular-nums ${
      isCritical ? "bg-red-100 text-red-700 animate-pulse" :
      isWarning ? "bg-amber-100 text-amber-700" :
      "bg-slate-100 text-slate-700"
    }`}>
      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </div>
  );
}

// ─── Coding Playground ───────────────────────────────────────────────────────
function CodingView({ assignment, onSubmit, alreadySubmitted }: {
  assignment: any;
  onSubmit: (code: string, lang: string) => void;
  alreadySubmitted: boolean;
}) {
  const [lang, setLang] = useState(assignment.language || "python");
  const [code, setCode] = useState(LANG_TEMPLATES[assignment.language || "python"] || LANG_TEMPLATES.python);
  const [output, setOutput] = useState<{ text: string; type: "info" | "success" | "fail" | "system" }[]>([
    { text: "Classroom Playground v1.0", type: "system" },
    { text: "Write your solution and press Run to test.", type: "system" },
  ]);
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; label: string }[] | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showProblem, setShowProblem] = useState(true);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = code.split("\n").length;

  const handleLangChange = (l: string) => {
    setLang(l);
    setCode(LANG_TEMPLATES[l] || "");
    setTestResults(null);
    setOutput([{ text: `Switched to ${LANGUAGES.find(x => x.id === l)?.label}`, type: "system" }]);
  };

  const runCode = () => {
    setRunning(true);
    setOutput(prev => [...prev, { text: `> Running ${LANGUAGES.find(l => l.id === lang)?.label} code…`, type: "info" }]);
    setTestResults(null);
    setTimeout(() => {
      const cases = assignment.testCases || [];
      const results = cases.map((tc: any, i: number) => {
        const passed = true; // Fixed random failure behavior
        return { passed, label: `Test ${i + 1}: Input(${tc.input}) → Expected: ${tc.output}` };
      });
      if (results.length === 0) {
        results.push(
          { passed: true, label: "Test 1: enqueue(1), enqueue(2), dequeue() → 1" },
          { passed: true, label: "Test 2: enqueue(5), peek() → 5" },
          { passed: true, label: "Test 3: dequeue() on empty → None" },
        );
      }
      const allPassed = results.every((r: any) => r.passed);
      const newOut = results.map((r: any) => ({
        text: `  ${r.passed ? "✓" : "✗"} ${r.label}`,
        type: r.passed ? "success" as const : "fail" as const,
      }));
      newOut.push({
        text: allPassed ? "All tests passed — ready to submit!" : `${results.filter((r: any) => !r.passed).length} test(s) failed.`,
        type: allPassed ? "success" : "fail",
      });
      setOutput(prev => [...prev, ...newOut]);
      setTestResults(results);
      setRunning(false);
    }, 1800);
  };

  const passedCount = testResults?.filter(r => r.passed).length ?? 0;
  const totalCount = testResults?.length ?? 0;

  return (
    <>
      <ConfirmSubmitModal
        open={confirmOpen}
        title="Submit Solution?"
        body={
          <span>
            {testResults
              ? `Your code passed ${passedCount}/${totalCount} test cases. `
              : "You haven't run your code yet. "}
            This action cannot be undone.
          </span>
        }
        confirmLabel="Submit Solution"
        onConfirm={() => { setConfirmOpen(false); onSubmit(code, lang); }}
        onCancel={() => setConfirmOpen(false)}
        variant="emerald"
      />

      <div className="flex-1 flex overflow-hidden bg-[#1e1e1e]">
        {/* Left: Editor */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-[#3e3e42]">
          {/* Editor toolbar */}
          <div className="flex items-center gap-2 bg-[#252526] border-b border-[#3e3e42] px-4 py-2 flex-shrink-0">
            {LANGUAGES.map(l => (
              <button
                key={l.id}
                onClick={() => !alreadySubmitted && handleLangChange(l.id)}
                disabled={alreadySubmitted}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${lang === l.id ? "bg-[#3e3e42] text-white" : "text-gray-500 hover:text-gray-300 disabled:cursor-not-allowed"}`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                {l.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-3">
              <span className="text-[11px] text-gray-500 font-mono">
                {`main${LANGUAGES.find(l => l.id === lang)?.ext}`}
              </span>
              <span className="text-[11px] text-gray-600 font-mono">{lineCount} lines</span>
            </div>
          </div>

          {/* Code area */}
          <div className="flex-1 flex overflow-auto">
            <div className="w-12 bg-[#1e1e1e] text-right pr-3 py-4 text-[#858585] text-[13px] font-mono select-none flex-shrink-0 leading-6 border-r border-[#3e3e42]/30">
              {Array.from({ length: Math.max(lineCount, 20) }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={textRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              disabled={alreadySubmitted}
              spellCheck={false}
              className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] text-[13px] font-mono leading-6 p-4 resize-none focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ tabSize: 4 }}
              onKeyDown={e => {
                if (e.key === "Tab") {
                  e.preventDefault();
                  const s = e.currentTarget.selectionStart;
                  const end = e.currentTarget.selectionEnd;
                  setCode(code.substring(0, s) + "    " + code.substring(end));
                  setTimeout(() => { if (textRef.current) { textRef.current.selectionStart = textRef.current.selectionEnd = s + 4; } }, 0);
                }
              }}
            />
          </div>

          {/* Action bar */}
          <div className="bg-[#252526] border-t border-[#3e3e42] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              {testResults && (
                <>
                  <span className="text-xs text-emerald-400 font-semibold">{testResults.filter(r => r.passed).length} passed</span>
                  {testResults.filter(r => !r.passed).length > 0 && (
                    <span className="text-xs text-red-400 font-semibold">{testResults.filter(r => !r.passed).length} failed</span>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={runCode}
                disabled={running || alreadySubmitted}
                className="flex items-center px-4 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] disabled:opacity-50 text-white text-sm font-semibold rounded transition-colors"
              >
                {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" fill="currentColor" />}
                {running ? "Running…" : "Run"}
              </button>
              {!alreadySubmitted ? (
                <button
                  onClick={() => setConfirmOpen(true)}
                  className="flex items-center px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded transition-colors"
                >
                  <Send className="w-3.5 h-3.5 mr-2" /> Submit
                </button>
              ) : (
                <span className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Submitted
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Problem + Console */}
        <div className="w-[380px] flex flex-col flex-shrink-0">
          {/* Problem toggle */}
          <button
            onClick={() => setShowProblem(s => !s)}
            className="flex items-center justify-between bg-[#252526] border-b border-[#3e3e42] px-4 py-2.5 text-gray-300 text-xs font-semibold hover:bg-[#2d2d2d] transition-colors flex-shrink-0"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Problem Statement
            </span>
            <Eye className={`w-3.5 h-3.5 transition-opacity ${showProblem ? "opacity-100" : "opacity-40"}`} />
          </button>

          {showProblem && (
            <div className="bg-[#252526] border-b border-[#3e3e42] px-4 py-3 flex-shrink-0 max-h-48 overflow-y-auto">
              <h3 className="text-white text-sm font-bold mb-1">{assignment.title}</h3>
              <p className="text-[#aaa] text-[12px] leading-relaxed whitespace-pre-wrap">
                {assignment.description || "No description provided."}
              </p>
            </div>
          )}

          {/* Test cases */}
          {assignment.testCases?.length > 0 && (
            <div className="bg-[#1e1e1e] border-b border-[#3e3e42] px-4 py-3 flex-shrink-0">
              <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
                Test Cases
                {testResults && (
                  <span className={`ml-2 ${testResults.every(r => r.passed) ? "text-emerald-400" : "text-amber-400"}`}>
                    {testResults.filter(r => r.passed).length}/{testResults.length} passing
                  </span>
                )}
              </p>
              <div className="space-y-2">
                {assignment.testCases.map((tc: any, i: number) => {
                  const result = testResults?.[i];
                  return (
                    <div
                      key={i}
                      className={`rounded px-3 py-2 text-[12px] font-mono border transition-colors ${
                        result
                          ? result.passed
                            ? "border-emerald-700 bg-emerald-950/40"
                            : "border-red-700 bg-red-950/40"
                          : "border-[#3e3e42] bg-[#252526]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>
                          <span className="text-gray-500">in: </span>
                          <span className="text-[#9cdcfe]">{tc.input}</span>
                          <span className="mx-2 text-gray-600">→</span>
                          <span className="text-gray-500">out: </span>
                          <span className="text-[#ce9178]">{tc.output}</span>
                        </span>
                        {result && (
                          <span className={`font-bold text-sm ${result.passed ? "text-emerald-400" : "text-red-400"}`}>
                            {result.passed ? "✓" : "✗"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Console */}
          <div className="flex items-center gap-2 bg-[#252526] border-b border-[#3e3e42] px-4 py-2 text-gray-400 text-xs font-semibold flex-shrink-0">
            <Terminal className="w-3.5 h-3.5" /> Console Output
          </div>
          <div className="flex-1 p-4 font-mono text-[12px] overflow-auto bg-[#1e1e1e] space-y-0.5">
            {output.map((line, i) => (
              <div
                key={i}
                className={
                  line.type === "success" ? "text-emerald-400" :
                  line.type === "fail" ? "text-red-400" :
                  line.type === "system" ? "text-gray-600" :
                  "text-gray-300"
                }
              >
                {line.text || <br />}
              </div>
            ))}
            {running && <div className="text-blue-400 animate-pulse">Processing…</div>}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Quiz View ────────────────────────────────────────────────────────────────
function QuizView({ assignment, onSubmit, alreadySubmitted, submission }: {
  assignment: any;
  onSubmit: (answers: number[], score: number) => void;
  alreadySubmitted: boolean;
  submission?: any;
}) {
  const questions = assignment.questions || [];
  const [answers, setAnswers] = useState<(number | null)[]>(
    submission?.quizAnswers ? submission.quizAnswers : Array(questions.length).fill(null)
  );
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(alreadySubmitted);
  const [score, setScore] = useState<number | null>(submission?.score ?? null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [flagged, setFlagged] = useState<boolean[]>(Array(questions.length).fill(false));
  const [reviewMode, setReviewMode] = useState(false);

  const answered = answers.filter(a => a !== null).length;
  const unanswered = questions.length - answered;
  const progress = questions.length > 0 ? (answered / questions.length) * 100 : 0;

  const doSubmit = () => {
    let correct = 0;
    questions.forEach((q: any, i: number) => {
      if (answers[i] === q.answer) correct++;
    });
    const finalScore = Math.round((correct / questions.length) * (assignment.maxScore || 10));
    setScore(finalScore);
    setSubmitted(true);
    onSubmit(answers.map(a => a ?? 0), finalScore);
  };

  if (submitted && score !== null) {
    const pct = Math.round((score / (assignment.maxScore || 10)) * 100);
    const gradeLabel = pct >= 90 ? "Excellent!" : pct >= 75 ? "Great work!" : pct >= 60 ? "Passed" : "Needs improvement";
    const gradeColor = pct >= 75 ? "text-emerald-600" : pct >= 60 ? "text-amber-600" : "text-red-600";
    const gradeBg = pct >= 75 ? "bg-emerald-100" : pct >= 60 ? "bg-amber-100" : "bg-red-100";

    const correctCount = questions.filter((q: any, i: number) => answers[i] === q.answer).length;

    return (
      <div className="flex-1 flex overflow-hidden bg-slate-50">
        {/* Score panel */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="p-6 border-b border-slate-100">
            <div className={`w-20 h-20 rounded-full ${gradeBg} flex items-center justify-center mx-auto mb-4`}>
              {pct >= 60
                ? <Trophy className="w-10 h-10 text-emerald-600" />
                : <AlertCircle className="w-10 h-10 text-red-500" />
              }
            </div>
            <div className="text-center">
              <h2 className="font-black text-gray-900 text-xl mb-1">Quiz Complete</h2>
              <div className="text-5xl font-black text-indigo-600 tabular-nums">
                {score}<span className="text-xl text-slate-400">/{assignment.maxScore || 10}</span>
              </div>
              <p className={`mt-2 font-bold ${gradeColor}`}>{pct}% — {gradeLabel}</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-emerald-600">{correctCount}</div>
                <div className="text-xs text-emerald-700 font-semibold mt-0.5">Correct</div>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-red-500">{questions.length - correctCount}</div>
                <div className="text-xs text-red-600 font-semibold mt-0.5">Incorrect</div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-1000 ${pct >= 75 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <button
              onClick={() => setReviewMode(!reviewMode)}
              className="w-full py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {reviewMode ? "Hide" : "Review"} Answers
            </button>
          </div>
        </div>

        {/* Review panel */}
        <div className="flex-1 overflow-y-auto p-6">
          {reviewMode ? (
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="font-bold text-gray-800 mb-4">Answer Review</h3>
              {questions.map((q: any, i: number) => {
                const isCorrect = answers[i] === q.answer;
                return (
                  <div
                    key={i}
                    className={`rounded-2xl border p-5 ${isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                        {i + 1}
                      </span>
                      <p className="font-semibold text-gray-900 text-sm">{q.q}</p>
                    </div>
                    <div className="pl-9 space-y-2">
                      {q.options.map((opt: string, oi: number) => {
                        const isUserAnswer = answers[i] === oi;
                        const isCorrectAnswer = q.answer === oi;
                        return (
                          <div
                            key={oi}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                              isCorrectAnswer ? "bg-emerald-100 border border-emerald-300" :
                              isUserAnswer && !isCorrectAnswer ? "bg-red-100 border border-red-300" :
                              "bg-white border border-gray-200"
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isCorrectAnswer ? "border-emerald-500 bg-emerald-500" :
                              isUserAnswer ? "border-red-400 bg-red-400" :
                              "border-gray-300"
                            }`}>
                              {(isCorrectAnswer || isUserAnswer) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            <span className={`flex-1 ${isCorrectAnswer ? "text-emerald-800 font-semibold" : isUserAnswer ? "text-red-700" : "text-gray-600"}`}>
                              {opt}
                            </span>
                            {isCorrectAnswer && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-200 px-1.5 py-0.5 rounded">Correct</span>}
                            {isUserAnswer && !isCorrectAnswer && <span className="text-[10px] font-bold text-red-600 bg-red-200 px-1.5 py-0.5 rounded">Your answer</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Trophy className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
                <p className="text-gray-400 text-sm font-medium">Click "Review Answers" to see your responses.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <>
      <ConfirmSubmitModal
        open={confirmOpen}
        title="Submit Quiz?"
        body={
          unanswered > 0
            ? <span><strong className="text-amber-700">{unanswered} question{unanswered > 1 ? 's' : ''} unanswered.</strong> You cannot change your answers after submitting.</span>
            : <span>All {questions.length} questions answered. Submit your quiz?</span>
        }
        confirmLabel="Submit Quiz"
        onConfirm={() => { setConfirmOpen(false); doSubmit(); }}
        onCancel={() => setConfirmOpen(false)}
        variant={unanswered > 0 ? "amber" : "emerald"}
      />

      <div className="flex-1 flex flex-col bg-slate-50 overflow-auto">
        {/* Progress bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <span className="text-sm font-semibold text-slate-500 tabular-nums">{answered}/{questions.length} answered</span>
          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-bold text-indigo-600 tabular-nums">{Math.round(progress)}%</span>
          {assignment.timeLimit && (
            <QuizTimer
              limitMinutes={assignment.timeLimit}
              onExpire={() => { setConfirmOpen(false); doSubmit(); }}
            />
          )}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-52 bg-white border-r border-slate-200 p-4 overflow-y-auto flex-shrink-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Navigator</p>
            <div className="grid grid-cols-4 gap-1.5 mb-4">
              {questions.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all relative ${
                    i === current
                      ? "bg-indigo-600 text-white shadow-sm"
                      : answers[i] !== null
                      ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {i + 1}
                  {flagged[i] && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-white" />
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-indigo-700">
                <div className="w-3 h-3 rounded bg-indigo-100 flex-shrink-0" /> Answered ({answered})
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <div className="w-3 h-3 rounded bg-slate-100 flex-shrink-0" /> Unanswered ({unanswered})
              </div>
              {flagged.some(Boolean) && (
                <div className="flex items-center gap-2 text-amber-600">
                  <div className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0" /> Flagged ({flagged.filter(Boolean).length})
                </div>
              )}
            </div>
          </div>

          {/* Question */}
          <div className="flex-1 flex flex-col p-6 overflow-auto">
            <div className="max-w-2xl w-full mx-auto flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Question {current + 1} of {questions.length}
                  </p>
                  <button
                    onClick={() => {
                      const nf = [...flagged];
                      nf[current] = !nf[current];
                      setFlagged(nf);
                    }}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                      flagged[current]
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        : "text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    {flagged[current] ? "Flagged" : "Flag"}
                  </button>
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-5 leading-relaxed">{q.q}</h3>

                <div className="space-y-2.5">
                  {q.options.map((opt: string, oi: number) => (
                    <label
                      key={oi}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                        answers[current] === oi
                          ? "border-indigo-600 bg-indigo-50 shadow-sm"
                          : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        answers[current] === oi ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                      }`}>
                        {answers[current] === oi && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm text-gray-800 font-medium leading-snug">{opt}</span>
                      <input
                        type="radio"
                        className="sr-only"
                        checked={answers[current] === oi}
                        onChange={() => setAnswers(prev => { const n = [...prev]; n[current] = oi; return n; })}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrent(c => Math.max(0, c - 1))}
                  disabled={current === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-sm hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex items-center gap-2">
                  {current < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrent(c => c + 1)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmOpen(true)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-colors shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Submit Quiz
                      {unanswered > 0 && (
                        <span className="bg-amber-400 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full ml-1">
                          {unanswered} left
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Assignment View ──────────────────────────────────────────────────────────
function AssignmentView({ assignment, onSubmit, alreadySubmitted, submission, maxScore }: {
  assignment: any;
  onSubmit: (text: string, files: string[]) => void;
  alreadySubmitted: boolean;
  submission?: any;
  maxScore?: number;
}) {
  const DRAFT_KEY = `draft-${assignment.id}`;
  const [response, setResponse] = useState(
    submission?.textResponse || localStorage.getItem(DRAFT_KEY) || ""
  );
  const [attachedFiles, setAttachedFiles] = useState<string[]>(submission?.files || []);
  const [dragOver, setDragOver] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setResponse(val);
    if (!alreadySubmitted) localStorage.setItem(DRAFT_KEY, val);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const names = Array.from(e.dataTransfer.files).map(f => f.name);
    setAttachedFiles(prev => [...prev, ...names]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(e.target.files || []).map(f => f.name);
    setAttachedFiles(prev => [...prev, ...names]);
  };

  const doSubmit = () => {
    localStorage.removeItem(DRAFT_KEY);
    onSubmit(response, attachedFiles);
  };

  const canSubmit = response.trim().length > 0 || attachedFiles.length > 0;

  return (
    <>
      <ConfirmSubmitModal
        open={confirmOpen}
        title="Submit Assignment?"
        body={<span>Once submitted you cannot edit your response. Make sure your work is complete.</span>}
        confirmLabel="Submit Assignment"
        onConfirm={() => { setConfirmOpen(false); doSubmit(); }}
        onCancel={() => setConfirmOpen(false)}
        variant="indigo"
      />

      <div className="flex-1 flex overflow-hidden bg-slate-50">
        {/* Left: Assignment brief */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 border-r border-slate-200">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{assignment.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{assignment.type} · {assignment.maxScore} pts</p>
                </div>
              </div>

              {assignment.description && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Instructions</h3>
                  <div className="bg-slate-50 rounded-xl p-5 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap border border-slate-200">
                    {assignment.description}
                  </div>
                </div>
              )}

              {assignment.files && assignment.files.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {assignment.files.map((f: string, i: number) => (
                      <a key={i} href={f.startsWith('http') ? f : `#`} onClick={f.startsWith('http') ? undefined : (e) => { e.preventDefault(); mockDownload(f); }} target={f.startsWith('http') ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-800 flex-1">{f}</span>
                        <Download className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Submission panel */}
        {assignment.type !== 'Material' && (
        <div className="w-[400px] flex-shrink-0 flex flex-col overflow-y-auto bg-white border-l border-slate-200">
          {alreadySubmitted ? (
            <div className="flex flex-col gap-4 p-6">
              {submission?.status === "graded" ? (
                <>
                  <div className="flex flex-col items-center text-center gap-3 pb-5 border-b border-slate-200">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Trophy className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl mb-1">Graded</h3>
                      {submission.score !== undefined && (
                        <div className="text-4xl font-black text-indigo-600 tabular-nums">
                          {submission.score}<span className="text-xl text-slate-400">/{maxScore}</span>
                        </div>
                      )}
                      {submission.score !== undefined && (
                        <p className="text-sm text-slate-500 mt-1">
                          {Math.round((submission.score / (maxScore || 100)) * 100)}%
                        </p>
                      )}
                    </div>
                    {submission.feedback && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left w-full">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Faculty Feedback</p>
                        <p className="text-sm text-gray-700 leading-relaxed">"{submission.feedback}"</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide text-slate-500">Your Submission</h4>
                    {response && (
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Text Response</label>
                        <div className="w-full border border-slate-200 rounded-xl p-4 text-sm text-gray-700 bg-slate-50 whitespace-pre-wrap leading-relaxed">
                          {response}
                        </div>
                      </div>
                    )}
                    {attachedFiles.length > 0 && (
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Files</label>
                        <div className="space-y-2">
                          {attachedFiles.map((f, i) => (
                            <a key={i} onClick={() => mockDownload(f)} className="flex items-center gap-3 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl cursor-pointer hover:bg-indigo-100 transition-colors">
                              <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                              <span className="text-sm text-indigo-800 font-medium flex-1 truncate">{f}</span>
                              <Download className="w-4 h-4 text-indigo-500 cursor-pointer hover:text-indigo-700" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl mb-2">Submitted!</h3>
                    <p className="text-slate-500 text-sm max-w-xs">Your work has been received. You'll be notified when it's graded.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-0.5">Your Submission</h3>
                <p className="text-xs text-slate-400">Draft auto-saved locally.</p>
              </div>

              {/* Text response */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Text Response</label>
                <textarea
                  value={response}
                  onChange={handleTextChange}
                  placeholder="Type your answer here…"
                  rows={8}
                  className="w-full border border-slate-200 rounded-xl p-4 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 placeholder:text-slate-400 transition-colors"
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-slate-400">{response.length} chars</span>
                  {response.length > 0 && (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Draft saved
                    </span>
                  )}
                </div>
              </div>

              {/* File upload */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Upload Documents</label>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    dragOver
                      ? "border-indigo-500 bg-indigo-50 scale-[1.01]"
                      : "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30"
                  }`}
                >
                  <Paperclip className={`w-6 h-6 mx-auto mb-2 transition-colors ${dragOver ? "text-indigo-500" : "text-slate-300"}`} />
                  <p className="text-sm text-slate-500 font-medium">
                    {dragOver ? "Drop to attach" : "Drag & drop files here"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">or click to browse · PDF, DOCX, TXT, images</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={handleFileSelect}
                    accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                  />
                </div>

                {attachedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <span className="text-sm text-indigo-800 font-medium flex-1 truncate">{f}</span>
                        <button
                          onClick={e => { e.stopPropagation(); setAttachedFiles(prev => prev.filter((_, j) => j !== i)); }}
                          className="text-indigo-300 hover:text-red-500 transition-colors p-0.5 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => canSubmit && setConfirmOpen(true)}
                disabled={!canSubmit}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <Send className="w-4 h-4" /> Submit Assignment
              </button>

              {!canSubmit && (
                <p className="text-center text-xs text-slate-400">Add a text response or attach a file to submit.</p>
              )}
            </div>
          )}
        </div>
        )}
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function StudentAssignment() {
  const { assignmentId } = useParams();
  const router = useRouter();
  const { assignments, classes, submissions, addSubmission } = useAppContext();

  const assignment = assignments.find(a => a.id === assignmentId) || assignments[0];
  const cls = classes.find(c => c.id === assignment?.classId);

  const mySubmission = submissions.find(
    s => s.assignmentId === assignment?.id && s.studentId === STUDENT_ID
  );
  const alreadySubmitted = !!mySubmission;

  const handleSubmitAssignment = (text: string, files: string[]) => {
    addSubmission({
      assignmentId: assignment.id,
      studentId: STUDENT_ID,
      studentName: STUDENT_NAME,
      rollNo: "CS101-042",
      submittedAt: "Just now",
      status: "pending",
      feedback: "",
      textResponse: text,
      files: files,
    });
  };

  const handleSubmitQuiz = (answers: number[], score: number) => {
    addSubmission({
      assignmentId: assignment.id,
      studentId: STUDENT_ID,
      studentName: STUDENT_NAME,
      rollNo: "CS101-042",
      submittedAt: "Just now",
      status: "graded",
      score,
      quizAnswers: answers,
      feedback: `Auto-graded: ${score}/${assignment.maxScore || 10}`,
    });
  };

  const handleSubmitCode = (code: string, lang: string) => {
    addSubmission({
      assignmentId: assignment.id,
      studentId: STUDENT_ID,
      studentName: STUDENT_NAME,
      rollNo: "CS101-042",
      submittedAt: "Just now",
      status: "pending",
      codeContent: code,
      language: lang,
      feedback: "",
    });
  };

  if (!assignment) return <div className="p-8 text-gray-500">Assignment not found.</div>;

  const isCoding = assignment.type === "Coding Assignment";
  const isQuiz = assignment.type === "Quiz";

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isCoding ? "bg-[#1e1e1e]" : "bg-slate-50"}`}>
      {/* Header */}
      <header className={`px-4 sm:px-6 py-3 flex items-center gap-3 flex-shrink-0 border-b ${
        isCoding ? "bg-[#2d2d2d] border-[#3e3e42]" : "bg-white border-slate-200"
      }`}>
        <button
          onClick={() => router.push(`/student/class/${assignment.classId}?tab=classwork`)}
          className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
            isCoding ? "text-gray-400 hover:text-white hover:bg-[#3e3e42]" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${
          isCoding ? "bg-emerald-900/50 text-emerald-400 border border-emerald-700" :
          isQuiz ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"
        }`}>
          {isCoding ? <Code2 className="w-3.5 h-3.5" /> : isQuiz ? <CheckSquare className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{assignment.type}</span>
        </div>

        <div className="flex-1 min-w-0 border-l border-slate-600/20 pl-3">
          <h1 className={`font-bold truncate ${isCoding ? "text-white text-sm sm:text-base" : "text-gray-900 text-base sm:text-lg"}`}>
            {assignment.title}
          </h1>
          <div className={`flex items-center gap-3 text-xs mt-0.5 ${isCoding ? "text-gray-400" : "text-slate-500"}`}>
            {cls && (
              <span className="flex items-center gap-1 truncate max-w-[140px]">
                <BookOpen className="w-3 h-3 flex-shrink-0" /> {cls.name}
              </span>
            )}
            {assignment.dueDate && (
              <span className="flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 h-3" /> {assignment.dueDate}
              </span>
            )}
            {assignment.maxScore && (
              <span className="flex-shrink-0">{assignment.maxScore} pts</span>
            )}
          </div>
        </div>

        {alreadySubmitted && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex-shrink-0 ${
            isCoding ? "text-emerald-400 bg-emerald-900/30" : "text-emerald-700 bg-emerald-100"
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Submitted</span>
          </div>
        )}
      </header>

      {/* Content */}
      {isCoding && (
        <CodingView
          assignment={assignment}
          onSubmit={handleSubmitCode}
          alreadySubmitted={alreadySubmitted}
        />
      )}
      {isQuiz && (
        <QuizView
          assignment={assignment}
          onSubmit={handleSubmitQuiz}
          alreadySubmitted={alreadySubmitted}
          submission={mySubmission}
        />
      )}
      {!isCoding && !isQuiz && (
        <AssignmentView
          assignment={assignment}
          onSubmit={handleSubmitAssignment}
          alreadySubmitted={alreadySubmitted}
          submission={mySubmission}
          maxScore={assignment.maxScore}
        />
      )}
    </div>
  );
}
