"use client";
import React, { useState, useEffect } from 'react';
import { X, Plus, FileText, CheckCircle, FileCode, Book, Trash2, Clock, Star, AlertCircle, Link as LinkIcon, Hash } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { QuizQuestion, TestCase } from '../context/AppContext';

type CreateType = 'Assignment' | 'Quiz' | 'Coding Assignment' | 'Material';

interface CreateWorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  initialType: CreateType;
}

const TODAY = new Date().toISOString().split('T')[0];

export function CreateWorksheetModal({ isOpen, onClose, classId, initialType }: CreateWorksheetModalProps) {
  const { addAssignment } = useAppContext();
  const [type, setType] = useState<CreateType>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [maxScore, setMaxScore] = useState(100);
  const [timeLimit, setTimeLimit] = useState<number | ''>('');
  const [submitted, setSubmitted] = useState(false);

  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { q: '', options: ['', '', '', ''], answer: 0 },
  ]);

  const [language, setLanguage] = useState('all');
  const [testCases, setTestCases] = useState<TestCase[]>([{ input: '', output: '' }]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setTitle('');
      setDescription('');
      setDueDate('');
      setDueTime('23:59');
      setMaxScore(100);
      setTimeLimit('');
      setSubmitted(false);
      setQuestions([{ q: '', options: ['', '', '', ''], answer: 0 }]);
      setLanguage('all');
      setTestCases([{ input: '', output: '' }]);
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!title.trim()) return;

    const fullDueDate = dueDate ? `${dueDate}${dueTime ? ' ' + dueTime : ''}` : '';

    addAssignment({
      classId,
      title: title.trim(),
      type,
      dueDate: fullDueDate,
      status: 'Active',
      description: description.trim(),
      maxScore: type === 'Material' ? 0 : maxScore,
      ...(type === 'Quiz' ? { questions, ...(timeLimit ? { timeLimit: Number(timeLimit) } : {}) } : {}),
      ...(type === 'Coding Assignment' ? { testCases, language } : {}),
    });
    onClose();
  };

  const typeConfig = [
    { id: 'Assignment' as CreateType, icon: FileText, label: 'Assignment', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', activeBg: 'bg-emerald-600', dot: 'bg-emerald-500' },
    { id: 'Quiz' as CreateType, icon: CheckCircle, label: 'Quiz', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', activeBg: 'bg-violet-600', dot: 'bg-violet-500' },
    { id: 'Coding Assignment' as CreateType, icon: FileCode, label: 'Coding', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', activeBg: 'bg-blue-600', dot: 'bg-blue-500' },
    { id: 'Material' as CreateType, icon: Book, label: 'Material', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', activeBg: 'bg-amber-600', dot: 'bg-amber-500' },
  ];

  const activeType = typeConfig.find(t => t.id === type)!;

  // ─── Assignment Fields ──────────────────────────────────────────────────────
  const renderAssignmentFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Instructions / Questions <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the assignment, list questions, or paste instructions here…"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 outline-none resize-none transition-colors placeholder:text-gray-400"
        />
      </div>
      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <AlertCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-emerald-700 leading-relaxed">
          Students will see these instructions and can submit a text response or attach files (PDF, DOCX, images).
        </p>
      </div>
    </div>
  );

  // ─── Quiz Fields ────────────────────────────────────────────────────────────
  const renderQuizFields = () => (
    <div className="space-y-5">
      {/* Time limit */}
      <div className="flex items-center gap-3 p-4 bg-violet-50 border border-violet-200 rounded-xl">
        <Clock className="w-4 h-4 text-violet-600 flex-shrink-0" />
        <div className="flex-1">
          <span className="text-sm font-semibold text-violet-800">Time Limit</span>
          <p className="text-xs text-violet-600 mt-0.5">Leave blank for unlimited time</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={180}
            value={timeLimit}
            onChange={e => setTimeLimit(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="—"
            className="w-16 border border-violet-300 rounded-lg px-2 py-1.5 text-sm text-center font-semibold text-violet-800 focus:ring-2 focus:ring-violet-500 outline-none bg-white"
          />
          <span className="text-xs text-violet-600 font-medium">min</span>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[11px] font-bold flex items-center justify-center">{questions.length}</span>
            Question{questions.length !== 1 ? 's' : ''}
          </h4>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">Click radio to mark correct answer</span>
        </div>

        {questions.map((q, qi) => (
          <div key={qi} className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="flex items-start gap-3 px-4 pt-4 pb-3 bg-gray-50/80 border-b border-gray-100">
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{qi + 1}</span>
              <input
                type="text"
                placeholder={`Question ${qi + 1}…`}
                value={q.q}
                onChange={e => {
                  const nq = [...questions];
                  nq[qi] = { ...nq[qi], q: e.target.value };
                  setQuestions(nq);
                }}
                className="flex-1 bg-transparent border-0 text-sm font-medium text-gray-800 focus:outline-none placeholder:text-gray-400"
              />
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => setQuestions(questions.filter((_, i) => i !== qi))}
                  className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="px-4 py-3 space-y-2">
              {q.options.map((opt, oi) => (
                <div
                  key={oi}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${q.answer === oi ? 'bg-emerald-50 border border-emerald-200' : 'border border-gray-100 hover:border-gray-200'}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const nq = [...questions];
                      nq[qi] = { ...nq[qi], answer: oi };
                      setQuestions(nq);
                    }}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${q.answer === oi ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 hover:border-violet-400'}`}
                  >
                    {q.answer === oi && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </button>
                  <input
                    type="text"
                    placeholder={`Option ${oi + 1}`}
                    value={opt}
                    onChange={e => {
                      const nq = [...questions];
                      const opts = [...nq[qi].options];
                      opts[oi] = e.target.value;
                      nq[qi] = { ...nq[qi], options: opts };
                      setQuestions(nq);
                    }}
                    className="flex-1 bg-transparent border-0 text-sm text-gray-700 focus:outline-none placeholder:text-gray-400"
                  />
                  {q.answer === oi && (
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide bg-emerald-100 px-1.5 py-0.5 rounded">Correct</span>
                  )}
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        const nq = [...questions];
                        const opts = nq[qi].options.filter((_, i) => i !== oi);
                        nq[qi] = { ...nq[qi], options: opts, answer: nq[qi].answer >= oi && nq[qi].answer > 0 ? nq[qi].answer - 1 : nq[qi].answer };
                        setQuestions(nq);
                      }}
                      className="p-0.5 text-gray-300 hover:text-red-400 rounded transition-colors flex-shrink-0"
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
                className="text-xs text-violet-600 font-semibold hover:text-violet-800 flex items-center gap-1 mt-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add option
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setQuestions([...questions, { q: '', options: ['', '', '', ''], answer: 0 }])}
          className="w-full py-3 border-2 border-dashed border-violet-200 rounded-xl text-sm font-semibold text-violet-600 hover:bg-violet-50 hover:border-violet-300 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>
    </div>
  );

  // ─── Coding Fields ──────────────────────────────────────────────────────────
  const renderCodingFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Problem Statement <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the problem clearly. Include constraints, examples, and expected input/output format…"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none resize-none transition-colors placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Allowed Languages</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'all', label: 'All Languages', sub: 'Python, Java, C++, JS…' },
            { value: 'python', label: 'Python Only', sub: '.py' },
            { value: 'java', label: 'Java Only', sub: '.java' },
            { value: 'cpp', label: 'C / C++ Only', sub: '.cpp / .c' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLanguage(opt.value)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${language === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200 bg-white'}`}
            >
              <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${language === opt.value ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`} />
              <div>
                <div className={`text-xs font-bold ${language === opt.value ? 'text-blue-700' : 'text-gray-700'}`}>{opt.label}</div>
                <div className="text-[11px] text-gray-400">{opt.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-700">Test Cases</h4>
          <span className="text-xs text-gray-400">{testCases.length} case{testCases.length !== 1 ? 's' : ''}</span>
        </div>
        {testCases.map((tc, index) => (
          <div key={index} className="grid grid-cols-2 gap-2 p-3 bg-gray-900 rounded-xl relative">
            <div>
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">Input</label>
              <input
                type="text"
                value={tc.input}
                onChange={e => {
                  const ntc = [...testCases];
                  ntc[index] = { ...ntc[index], input: e.target.value };
                  setTestCases(ntc);
                }}
                placeholder="e.g. 5 3"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-mono text-gray-200 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-600"
              />
            </div>
            <div className="relative">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">Expected Output</label>
              <input
                type="text"
                value={tc.output}
                onChange={e => {
                  const ntc = [...testCases];
                  ntc[index] = { ...ntc[index], output: e.target.value };
                  setTestCases(ntc);
                }}
                placeholder="e.g. 8"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-mono text-gray-200 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-600 pr-7"
              />
              {testCases.length > 1 && (
                <button
                  type="button"
                  onClick={() => setTestCases(testCases.filter((_, i) => i !== index))}
                  className="absolute right-1.5 top-7 p-0.5 text-gray-500 hover:text-red-400 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setTestCases([...testCases, { input: '', output: '' }])}
          className="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" /> Add Test Case
        </button>
      </div>
    </div>
  );

  // ─── Material Fields ────────────────────────────────────────────────────────
  const renderMaterialFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What is this material about? Add any context for students…"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-400 outline-none resize-none transition-colors placeholder:text-gray-400"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          <LinkIcon className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
          External Link <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="url"
          placeholder="https://docs.google.com/…"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-400 outline-none transition-colors placeholder:text-gray-400"
        />
      </div>
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Materials are visible in the Stream and Classwork tabs. Students can view and download them but cannot submit.
        </p>
      </div>
    </div>
  );

  const TypeIcon = activeType.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${activeType.bg} flex items-center justify-center`}>
              <TypeIcon className={`w-4 h-4 ${activeType.color}`} />
            </div>
            <h2 className="font-bold text-gray-900">
              Create {type === 'Coding Assignment' ? 'Coding Assignment' : type}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type selector */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex gap-1.5">
            {typeConfig.map(tc => {
              const Icon = tc.icon;
              const isActive = type === tc.id;
              return (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => setType(tc.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? `${tc.activeBg} text-white shadow-sm`
                      : `text-gray-500 hover:text-gray-700 hover:bg-gray-100`
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="create-form" onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder={`e.g. ${type === 'Quiz' ? 'Chapter 3 Quiz' : type === 'Coding Assignment' ? 'Implement a Stack' : type === 'Material' ? 'Lecture Slides — Week 5' : 'Problem Set 2'}`}
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 outline-none transition-colors placeholder:text-gray-400 ${
                  submitted && !title.trim()
                    ? 'border-red-400 focus:ring-red-400 bg-red-50'
                    : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-400'
                }`}
              />
              {submitted && !title.trim() && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Title is required
                </p>
              )}
            </div>

            {/* Due date + Max score row */}
            {type !== 'Material' && (
              <div className="grid grid-cols-2 gap-4">
                {/* Due date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <Clock className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    min={TODAY}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 outline-none transition-colors cursor-pointer"
                  />
                </div>

                {/* Due time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Time</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={e => setDueTime(e.target.value)}
                    disabled={!dueDate}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 outline-none transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Max score */}
            {type !== 'Material' && (
              <div className="flex items-center gap-4">
                <div className="w-40">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <Star className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                    Max Score
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={maxScore}
                      onChange={e => setMaxScore(Math.max(1, Number(e.target.value)))}
                      min={1}
                      max={1000}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 outline-none transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">pts</span>
                  </div>
                </div>
                {dueDate && (
                  <div className="flex items-center gap-2 pt-6 text-sm text-emerald-700 font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Added to calendar</span>
                  </div>
                )}
              </div>
            )}

            {/* Type-specific fields */}
            <div className={`border-t border-gray-100 pt-5`}>
              {type === 'Assignment' && renderAssignmentFields()}
              {type === 'Quiz' && renderQuizFields()}
              {type === 'Coding Assignment' && renderCodingFields()}
              {type === 'Material' && renderMaterialFields()}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-400">
            {type !== 'Material' && !dueDate && (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="w-3 h-3" /> No due date set
              </span>
            )}
          </div>
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-form"
              className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-sm transition-all hover:shadow-md active:scale-95 ${activeType.activeBg} hover:opacity-90`}
            >
              Create {type === 'Coding Assignment' ? 'Coding Assignment' : type}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
