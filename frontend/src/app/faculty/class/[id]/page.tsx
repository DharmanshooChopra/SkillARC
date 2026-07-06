"use client";

import { useState, useEffect, use } from "react";
import { Send, Image as ImageIcon, Link as LinkIcon, Paperclip, MoreHorizontal, User } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

interface Announcement {
  id: number;
  classroom_id: number;
  content: string;
  created_at: string;
}

export default function ClassAnnouncements({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const classId = resolvedParams.id;

  const [posts, setPosts] = useState<Announcement[]>([]);
  const [newContent, setNewContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/classrooms/${classId}/announcements`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch announcements", err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [classId]);

  const handlePost = async () => {
    if (!newContent.trim()) return;
    setIsPosting(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/classrooms/${classId}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
      if (res.ok) {
        setNewContent("");
        fetchAnnouncements();
      }
    } catch (err) {
      console.error("Failed to post announcement", err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Rich Composer */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300 transition-all">
        <div className="p-4 flex gap-4">
          <div className="h-10 w-10 shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
            <User className="w-5 h-5" />
          </div>
          <textarea 
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Announce something to your class..."
            className="w-full mt-2 text-slate-700 bg-transparent resize-none outline-none min-h-[60px] text-lg placeholder:text-slate-400"
          ></textarea>
        </div>
        
        {/* Composer Actions */}
        <div className="bg-slate-50/50 px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Attach file">
              <Paperclip className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Add link">
              <LinkIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Add image">
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={handlePost}
            disabled={isPosting || !newContent.trim()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Send className="w-4 h-4" />
            Post
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {posts.length > 0 ? posts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Dr. Smith</h4>
                  <p className="text-sm text-slate-500 font-medium">
                    {formatDistanceToNow(parseISO(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <button className="text-slate-300 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-lg ml-16">
              {post.content}
            </p>
            
            {/* Interactive Footer (Like / Comment placeholders for future) */}
            <div className="mt-6 ml-16 pt-4 border-t border-slate-100 flex gap-6 text-sm font-medium text-slate-500">
              <button className="hover:text-indigo-600 transition-colors">Add class comment...</button>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-white/50 border border-slate-200 border-dashed rounded-3xl">
            <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-indigo-400 ml-1" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No announcements yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Use the composer above to share a welcome message, syllabus link, or important update with your class.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
