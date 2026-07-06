"use client";
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { X, Copy, Check, Hash, BookOpen, Users } from 'lucide-react';

export function CreateClassModal() {
  const { isCreateModalOpen, setCreateModalOpen, addClass } = useAppContext();
  const [formData, setFormData] = useState({ name: '', section: '', subjectCode: '' });
  const [createdCode, setCreatedCode] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    addClass({ ...formData, joinCode: code });
    setCreatedCode(code);
  };

  const handleCopy = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(createdCode).catch(() => fallbackCopy(createdCode));
    } else {
      fallbackCopy(createdCode);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fallbackCopy = (text: string) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  };

  const close = () => {
    setCreateModalOpen(false);
    setCreatedCode('');
    setFormData({ name: '', section: '', subjectCode: '' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Create New Class</h2>
          <button onClick={close} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!createdCode ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <BookOpen className="w-4 h-4 mr-1.5 text-indigo-500" /> Class Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Intro to Programming"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Users className="w-4 h-4 mr-1.5 text-indigo-500" /> Section
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., Section A"
                    value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Hash className="w-4 h-4 mr-1.5 text-indigo-500" /> Subject Code
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., CS101"
                    value={formData.subjectCode}
                    onChange={e => setFormData({ ...formData, subjectCode: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={close} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors">
                  Create Class
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Class Created!</h3>
              <p className="text-gray-500 text-sm mb-6">Share this unique code with your students so they can join the class.</p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between mb-8">
                <span className="text-3xl font-mono font-bold text-indigo-600 tracking-widest">{createdCode}</span>
                <button 
                  onClick={handleCopy}
                  className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-300 rounded-lg shadow-sm transition-all"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <button onClick={close} className="w-full px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors">
                Go to My Classes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
