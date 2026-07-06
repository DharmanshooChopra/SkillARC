"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, CheckCircle, FileText, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

interface AnalyticsData {
  active_students: number;
  avg_grade: number;
  completion_rate: number;
  total_submissions: number;
  needs_attention_count: number;
  recent_activity: { class: string; action: string; time: string }[];
  performance_trends: number[];
}

export default function OverallAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/faculty/1/analytics");
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };
    fetchAnalytics();
  }, []);

  const kpis = [
    { label: "Active Students", value: data?.active_students.toString() || "0", trend: "Live Data", up: true },
    { label: "Completion Rate", value: `${data?.completion_rate || 0}%`, trend: "Live Data", up: (data?.completion_rate || 0) > 50 },
    { label: "Avg Grade", value: `${data?.avg_grade || 0}%`, trend: "Live Data", up: (data?.avg_grade || 0) > 75 },
    { label: "Total Submissions", value: data?.total_submissions?.toString() || "0", trend: "Live Data", up: true },
  ];

  const recentActivity = data?.recent_activity || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Overall Analytics</h1>
          <p className="text-slate-500 mt-1">Track student performance and engagement across all classes.</p>
        </div>
        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
          Download Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
            <div className="flex items-end gap-4 mt-3">
              <h2 className="text-4xl font-black text-slate-800">{kpi.value}</h2>
              <span className={`flex items-center text-sm font-bold mb-1 ${kpi.up ? 'text-emerald-600' : 'text-rose-500'}`}>
                {kpi.up ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area (Mock for visual presentation) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" /> Performance Trends (Avg Grade per Assignment)
            </h3>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1.5 outline-none font-medium text-slate-700">
              <option>Last 30 Days</option>
              <option>This Semester</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end gap-2 justify-between mt-8 relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-400 pb-8 h-full">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
            
            {/* Grid lines */}
            <div className="absolute left-10 right-0 top-0 bottom-8 border-b border-slate-100 flex flex-col justify-between">
              <div className="border-b border-slate-100 w-full h-0"></div>
              <div className="border-b border-slate-100 w-full h-0"></div>
              <div className="border-b border-slate-100 w-full h-0"></div>
              <div className="border-b border-slate-100 w-full h-0"></div>
            </div>

            {/* Live Bars */}
            <div className="flex items-end justify-between w-full pl-12 h-56 z-10 pb-1">
              {(data?.performance_trends || [0,0,0,0,0,0,0]).map((height, i) => (
                <div key={i} className="w-12 bg-indigo-100 rounded-t-lg relative group flex justify-center">
                  <div 
                    className="absolute bottom-0 w-full bg-indigo-600 rounded-t-lg transition-all duration-500" 
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded shadow-lg transition-opacity">
                    {height > 0 ? `${Math.round(height)}%` : '0%'}
                  </span>
                </div>
              ))}
            </div>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-12 right-0 flex justify-between text-xs font-bold text-slate-500">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
              <span>Week 5</span>
              <span>Week 6</span>
              <span className="text-indigo-600">Current</span>
            </div>
          </div>
        </div>

        {/* Side Panel: Recent Activity & At Risk */}
        <div className="space-y-6">
          
          {/* At Risk Alert */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-rose-800 text-lg mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5" /> Needs Attention
            </h3>
            <p className="text-rose-700 text-sm mb-4">
              <strong>{data?.needs_attention_count || 0} student(s)</strong> have 0 submissions across all active assignments.
            </p>
            <button className="w-full bg-rose-600 text-white rounded-lg py-2 text-sm font-bold hover:bg-rose-700 transition-colors">
              Review Students
            </button>
          </div>

          {/* Activity Log */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Recent Activity</h3>
            <div className="space-y-5">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      <span className="font-bold text-indigo-600">{act.class}:</span> {act.action}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
