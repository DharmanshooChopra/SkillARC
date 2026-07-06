"use client";
import React, { useState } from "react";
import { TopNav } from "../components/TopNav";
import { useAppContext } from "../context/AppContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar, Legend, Cell,
} from "recharts";
import { Award, TrendingUp, BookOpen, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Star } from "lucide-react";
import { JoinClassModal } from "../components/JoinClassModal";

const STUDENT_ID = "s1"; // mock logged-in student

const CLASS_COLORS = ["#6366f1", "#14b8a6", "#f43f5e", "#f59e0b", "#8b5cf6"];

function getGrade(pct: number) {
  if (pct >= 90) return { label: "A+", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  if (pct >= 80) return { label: "A", color: "text-green-600 bg-green-50 border-green-200" };
  if (pct >= 70) return { label: "B", color: "text-blue-600 bg-blue-50 border-blue-200" };
  if (pct >= 60) return { label: "C", color: "text-yellow-600 bg-yellow-50 border-yellow-200" };
  if (pct >= 50) return { label: "D", color: "text-orange-600 bg-orange-50 border-orange-200" };
  return { label: "F", color: "text-red-600 bg-red-50 border-red-200" };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 shadow-lg rounded-xl px-4 py-3">
        <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name}: {p.value}{typeof p.value === 'number' && p.dataKey === 'pct' ? '%' : ''} pts
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function StudentReportCard() {
  const { classes, assignments, submissions } = useAppContext();
  const [expandedClass, setExpandedClass] = useState<string | null>(classes[0]?.id || null);
  const [joinOpen, setJoinOpen] = useState(false);

  // Build per-class report data
  const classReports = classes.map((cls, idx) => {
    const classAssignments = assignments.filter(a => a.classId === cls.id && a.type !== "Material");
    const mySubmissions = submissions.filter(s =>
      s.studentId === STUDENT_ID &&
      classAssignments.some(a => a.id === s.assignmentId) &&
      s.status === "graded" &&
      s.score !== undefined
    );

    const graded = mySubmissions.map(sub => {
      const assignment = classAssignments.find(a => a.id === sub.assignmentId)!;
      const maxScore = assignment.maxScore || 100;
      const pct = Math.round((sub.score! / maxScore) * 100);
      return {
        id: sub.assignmentId,
        title: assignment.title.length > 22 ? assignment.title.substring(0, 22) + "…" : assignment.title,
        fullTitle: assignment.title,
        type: assignment.type,
        score: sub.score!,
        maxScore,
        pct,
        feedback: sub.feedback,
        submittedAt: sub.submittedAt,
      };
    });

    const totalScored = mySubmissions.reduce((s, sub) => s + (sub.score || 0), 0);
    const totalMax = mySubmissions.reduce((s, sub) => {
      const a = classAssignments.find(a => a.id === sub.assignmentId);
      return s + (a?.maxScore || 100);
    }, 0);
    const overallPct = totalMax > 0 ? Math.round((totalScored / totalMax) * 100) : null;

    const pending = classAssignments.filter(a => {
      const sub = submissions.find(s => s.assignmentId === a.id && s.studentId === STUDENT_ID);
      return !sub;
    });

    return {
      cls,
      color: CLASS_COLORS[idx % CLASS_COLORS.length],
      graded,
      overallPct,
      pending: pending.length,
      totalAssignments: classAssignments.length,
      submitted: mySubmissions.length,
    };
  });

  // Overall stats
  const allGraded = classReports.flatMap(r => r.graded);
  const overallScored = allGraded.reduce((s, g) => s + g.score, 0);
  const overallMax = allGraded.reduce((s, g) => s + g.maxScore, 0);
  const overallPct = overallMax > 0 ? Math.round((overallScored / overallMax) * 100) : 0;

  // Radar data
  const radarData = classReports.map(r => ({
    subject: r.cls.name.split(" - ")[0],
    score: r.overallPct || 0,
  }));

  // Summary bar chart: score per class — use cls.id as dataKey to avoid duplicate name collisions in recharts
  const summaryBar = classReports.map(r => ({
    id: r.cls.id,
    name: r.cls.name.split(" - ")[0],
    score: r.overallPct || 0,
    fill: r.color,
  }));

  const TYPE_COLORS: Record<string, string> = {
    Assignment: "#6366f1",
    Quiz: "#8b5cf6",
    "Coding Assignment": "#14b8a6",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopNav role="student" onJoinClass={() => setJoinOpen(true)} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-indigo-600" />
            My Report Card
          </h1>
          <p className="text-gray-500 mt-1">Track your academic progress across all enrolled classes.</p>
        </div>

        {/* Overall Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col items-center justify-center text-center">
            <div className="text-3xl font-black text-indigo-600 mb-1">{overallPct}%</div>
            <div className="text-xs text-slate-500 font-medium">Overall Score</div>
            <div className={`mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getGrade(overallPct).color}`}>
              Grade {getGrade(overallPct).label}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col items-center justify-center text-center">
            <div className="text-3xl font-black text-emerald-600 mb-1">{allGraded.length}</div>
            <div className="text-xs text-slate-500 font-medium">Graded Items</div>
            <div className="mt-2 flex items-center gap-1 text-emerald-600">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Evaluated</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col items-center justify-center text-center">
            <div className="text-3xl font-black text-amber-500 mb-1">
              {classReports.reduce((s, r) => s + r.pending, 0)}
            </div>
            <div className="text-xs text-slate-500 font-medium">Pending Tasks</div>
            <div className="mt-2 flex items-center gap-1 text-amber-500">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">To Submit</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col items-center justify-center text-center">
            <div className="text-3xl font-black text-violet-600 mb-1">{classes.length}</div>
            <div className="text-xs text-slate-500 font-medium">Enrolled Classes</div>
            <div className="mt-2 flex items-center gap-1 text-violet-600">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Courses</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        {allGraded.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Class Score Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-gray-800">Score by Class</h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={summaryBar} barCategoryGap="30%">
                  <CartesianGrid key="cg-summary" strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis key="xa-summary" dataKey="id" tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(id) => summaryBar.find(e => e.id === id)?.name ?? id} />
                  <YAxis key="ya-summary" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} unit="%" />
                  <Tooltip key="tt-summary" content={<CustomTooltip />} />
                  <Bar key="bar-summary" dataKey="score" radius={[6, 6, 0, 0]} name="Score">
                    {summaryBar.map((entry) => (
                      <Cell key={`summary-${entry.id}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-violet-600" />
                <h2 className="font-bold text-gray-800">Performance Radar</h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid key="pg-radar" stroke="#e2e8f0" />
                  <PolarAngleAxis key="pa-radar" dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Radar key="r-radar" name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} dot={{ fill: "#6366f1", r: 4 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Per-Class Detailed Reports */}
        <div className="space-y-4">
          {classReports.map(report => {
            const isExpanded = expandedClass === report.cls.id;
            const grade = report.overallPct !== null ? getGrade(report.overallPct) : null;

            return (
              <div key={report.cls.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Class Header */}
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedClass(isExpanded ? null : report.cls.id)}
                >
                  <div className="flex items-center gap-4 px-6 py-5 hover:bg-slate-50 transition-colors">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: report.color + "22" }}>
                      <BookOpen className="w-6 h-6" style={{ color: report.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{report.cls.name}</h3>
                      <p className="text-sm text-slate-500">{report.cls.section}</p>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-6 mr-4">
                      <div className="text-center">
                        <div className="text-sm font-bold text-gray-700">{report.submitted}/{report.totalAssignments}</div>
                        <div className="text-xs text-slate-400">Submitted</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-amber-600">{report.pending}</div>
                        <div className="text-xs text-slate-400">Pending</div>
                      </div>
                      <div className="text-center">
                        {report.overallPct !== null ? (
                          <>
                            <div className="text-sm font-bold" style={{ color: report.color }}>{report.overallPct}%</div>
                            <div className="text-xs text-slate-400">Score</div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm font-bold text-slate-400">–</div>
                            <div className="text-xs text-slate-400">No grades</div>
                          </>
                        )}
                      </div>
                    </div>

                    {grade && (
                      <span className={`hidden sm:inline px-3 py-1 rounded-lg text-sm font-black border ${grade.color}`}>
                        {grade.label}
                      </span>
                    )}

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    )}
                  </div>
                </button>

                {/* Progress bar */}
                {report.overallPct !== null && (
                  <div className="px-6 pb-1">
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${report.overallPct}%`, backgroundColor: report.color }}
                      />
                    </div>
                  </div>
                )}

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-6">
                    {report.graded.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <XCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No graded submissions yet.</p>
                      </div>
                    ) : (
                      <>
                        {/* Per-assignment bar chart */}
                        {report.graded.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-slate-600 mb-3">Score per Submission</h4>
                            <ResponsiveContainer width="100%" height={160}>
                              <BarChart data={report.graded} barCategoryGap="30%">
                                <CartesianGrid key={`cg-${report.cls.id}`} strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis key={`xa-${report.cls.id}`} dataKey="id" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(id) => report.graded.find(g => g.id === id)?.title ?? id} />
                                <YAxis key={`ya-${report.cls.id}`} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                                <Tooltip key={`tt-${report.cls.id}`} content={<CustomTooltip />} />
                                <Bar key={`bar-${report.cls.id}`} dataKey="score" name="Score" radius={[4, 4, 0, 0]}>
                                  {report.graded.map((g) => (
                                    <Cell key={`${report.cls.id}-${g.id}`} fill={TYPE_COLORS[g.type] || report.color} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Table */}
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Task</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Type</th>
                                <th className="text-center px-4 py-3 font-semibold text-slate-600">Score</th>
                                <th className="text-center px-4 py-3 font-semibold text-slate-600">%</th>
                                <th className="text-center px-4 py-3 font-semibold text-slate-600">Grade</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Feedback</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {report.graded.map((g, i) => {
                                const g2 = getGrade(g.pct);
                                return (
                                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate" title={g.fullTitle}>
                                      {g.fullTitle}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span
                                        className="px-2 py-0.5 rounded text-xs font-semibold"
                                        style={{ backgroundColor: (TYPE_COLORS[g.type] || report.color) + "22", color: TYPE_COLORS[g.type] || report.color }}
                                      >
                                        {g.type}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-gray-800">
                                      {g.score}/{g.maxScore}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                                          <div className="h-1.5 rounded-full" style={{ width: `${g.pct}%`, backgroundColor: TYPE_COLORS[g.type] || report.color }} />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-600">{g.pct}%</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <span className={`px-2 py-0.5 rounded-md text-xs font-black border ${g2.color}`}>
                                        {g2.label}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px]">
                                      {g.feedback || <span className="italic text-slate-300">No feedback</span>}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <JoinClassModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}
