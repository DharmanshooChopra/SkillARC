"use client";
import React, { useState } from 'react';
import { X, Plus, Trash2, FileText, CheckCircle, FileCode, Book, Calendar, Save } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { AssignmentItem, QuizQuestion, TestCase } from '../context/AppContext';

interface Props {
  assignment: AssignmentItem;
  onClose: () => void;
}

export function AssignmentDetailModal({ assignment, onClose }: Props) {
  const { updateAssignment } = useAppContext();

  const [title, setTitle] = useState(assignment.title);
  const [description, setDescription] = useState(assignment.description ?? '');
  const [dueDate, setDueDate] = useState(assignment.dueDate ?? '');
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    assignment.questions ? JSON.parse(JSON.stringify(assignment.questions)) : []
  );
  const [testCases, setTestCases] = useState<TestCase[]>(
    assignment.testCases ? JSON.parse(JSON.stringify(assignment.testCases)) : []
  );
  const [language, setLanguage] = useState(assignment.language ?? 'python');
  const [maxScore, setMaxScore] = useState(assignment.maxScore ?? 100);

  const handleSave = () => {
    updateAssignment(assignment.id, {
      title,
      description,
      dueDate,
      maxScore,
      ...(assignment.type === 'Quiz' ? { questions } : {}),
      ...(assignment.type === 'Coding Assignment' ? { testCases, language } : {}),
    });
    onClose();
  };

  const typeConfig = {
    'Assignment': { icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
    'Quiz': { icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
    'Coding Assignment': { icon: FileCode, color: 'text-blue-600', bg: 'bg-blue-100' },
    'Material': { icon: Book, color: 'text-amber-600', bg: 'bg-amber-100' },
  };
  const cfg = typeConfig[assignment.type] ?? typeConfig['Assignment'];
  const Icon = cfg.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${cfg.bg} ${cfg.color} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{assignment.type}</span>
              <p className="text-sm font-semibold text-gray-800">Edit Details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Title + Due Date */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
              />
            </div>
            {assignment.type !== 'Material' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                />
              </div>
            )}
          </div>

          {/* Max Score */}
          {assignment.type !== 'Material' && (
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
              <input
                type="number"
                value={maxScore}
                onChange={e => setMaxScore(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          )}

          {/* --- Assignment fields --- */}
          {(assignment.type === 'Assignment' || assignment.type === 'Material') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {assignment.type === 'Material' ? 'Description' : 'Instructions / Questions'}
              </label>
              <textarea
                rows={6}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-gray-800"
              />
            </div>
          )}

          {/* --- Quiz fields --- */}
          {assignment.type === 'Quiz' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800">Quiz Questions</h4>
                <span className="text-xs text-gray-500">{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
              </div>
              {questions.map((q, qi) => (
                <div key={qi} className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1">
                      {qi + 1}
                    </span>
                    <input
                      type="text"
                      value={q.q}
                      onChange={e => {
                        const nq = [...questions];
                        nq[qi] = { ...nq[qi], q: e.target.value };
                        setQuestions(nq);
                      }}
                      placeholder="Question text"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 outline-none text-gray-800"
                    />
                    <button
                      type="button"
                      onClick={() => setQuestions(questions.filter((_, i) => i !== qi))}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="pl-9 space-y-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`q-${qi}-ans`}
                          checked={q.answer === oi}
                          onChange={() => {
                            const nq = [...questions];
                            nq[qi] = { ...nq[qi], answer: oi };
                            setQuestions(nq);
                          }}
                          className="accent-indigo-600 flex-shrink-0"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={e => {
                            const nq = [...questions];
                            const opts = [...nq[qi].options];
                            opts[oi] = e.target.value;
                            nq[qi] = { ...nq[qi], options: opts };
                            setQuestions(nq);
                          }}
                          placeholder={`Option ${oi + 1}`}
                          className={`flex-1 border rounded-lg px-3 py-1.5 text-sm outline-none ${
                            q.answer === oi
                              ? 'border-green-400 bg-green-50 text-green-800'
                              : 'border-gray-300 focus:border-indigo-400'
                          }`}
                        />
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const nq = [...questions];
                              const opts = nq[qi].options.filter((_, i) => i !== oi);
                              nq[qi] = { ...nq[qi], options: opts, answer: Math.min(nq[qi].answer, opts.length - 1) };
                              setQuestions(nq);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const nq = [...questions];
                        nq[qi] = { ...nq[qi], options: [...nq[qi].options, ''] };
                        setQuestions(nq);
                      }}
                      className="text-xs text-indigo-600 font-medium hover:underline flex items-center mt-1"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Option
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setQuestions([...questions, { q: '', options: ['', ''], answer: 0 }])}
                className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-indigo-300 flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Question
              </button>
            </div>
          )}

          {/* --- Coding fields --- */}
          {assignment.type === 'Coding Assignment' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement</label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Language</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="all">All Languages</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C / C++</option>
                  <option value="web">HTML / CSS / JS</option>
                </select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800 text-sm">Test Cases</h4>
                  <span className="text-xs text-gray-500">{testCases.length} test case{testCases.length !== 1 ? 's' : ''}</span>
                </div>
                {testCases.map((tc, i) => (
                  <div key={i} className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Input</label>
                      <input
                        type="text"
                        value={tc.input}
                        onChange={e => {
                          const ntc = [...testCases];
                          ntc[i] = { ...ntc[i], input: e.target.value };
                          setTestCases(ntc);
                        }}
                        className="w-full mt-1 border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="relative">
                      <label className="text-xs text-gray-500 font-medium">Expected Output</label>
                      <input
                        type="text"
                        value={tc.output}
                        onChange={e => {
                          const ntc = [...testCases];
                          ntc[i] = { ...ntc[i], output: e.target.value };
                          setTestCases(ntc);
                        }}
                        className="w-full mt-1 border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:ring-indigo-500 outline-none pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setTestCases(testCases.filter((_, idx) => idx !== i))}
                        className="absolute right-1 top-6 p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setTestCases([...testCases, { input: '', output: '' }])}
                  className="text-xs text-indigo-600 font-medium hover:underline flex items-center"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Test Case
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
