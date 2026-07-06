"use client";

import { useState, useEffect, use } from "react";
import { Megaphone, Clock, Info } from "lucide-react";

interface Announcement {
  id: number;
  content: string;
  created_at: string;
}

export default function StudentClassAnnouncements({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const classId = resolvedParams.id;
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/classrooms/${classId}/announcements`);
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data);
        }
      } catch (err) {
        console.error("Failed to fetch announcements", err);
      }
    };
    fetchAnnouncements();
  }, [classId]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 shadow-sm">
          <Megaphone className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Class Announcements</h2>
          <p className="text-slate-500 font-medium text-sm">Stay updated with messages from your instructor</p>
        </div>
      </div>

      <div className="space-y-4">
        {announcements.length > 0 ? announcements.map((ann) => (
          <div key={ann.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 group-hover:bg-emerald-400 transition-colors"></div>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-lg">{ann.content}</p>
                <div className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(ann.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-16 bg-slate-50 border border-slate-200 border-dashed rounded-3xl">
            <Info className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No announcements yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
