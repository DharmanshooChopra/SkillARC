"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { TopNav } from "../components/TopNav";
import { useAppContext } from "../context/AppContext";
import { CreateWorksheetModal } from "../components/CreateWorksheetModal";
import { AssignmentDetailModal } from "../components/AssignmentDetailModal";
import type { AssignmentItem } from "../context/AppContext";
import {
  Book,
  MessageSquare,
  ListTodo,
  Users,
  Settings,
  Plus,
  MoreVertical,
  FileCode,
  CheckCircle,
  FileText,
  Send,
  ClipboardList,
  Calendar,
  ChevronRight,
  Award,
  QrCode,
  Share2,
  Trash2,
  Copy,
} from "lucide-react";

export function FacultyClassHub() {
  const { id: classId } = useParams();
  const location = usePathname();
  const [activeTab, setActiveTab] = useState<"announcements" | "classwork" | "grades" | "students">(
    "classwork"
  );
  
  // Removed location.state?.tab effect since Next.js usePathname doesn't have state

  const { classes, assignments, submissions, announcements, addAnnouncement } = useAppContext();

  // Local state for students
  const [studentsList, setStudentsList] = useState(() => 
    ["Rahul Kumar", "Priya Singh", "Arun Patel", "Anjali Desai", "Vikram Shah", "Divya Nair"].map((name, i) => ({
      id: `student-${i}`,
      name,
      rollNo: `CS101-0${String(i + 1).padStart(2, '0')}`
    }))
  );
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"Assignment" | "Quiz" | "Coding Assignment" | "Material">("Assignment");
  const [editingAssignment, setEditingAssignment] = useState<AssignmentItem | null>(null);

  const [announcementText, setAnnouncementText] = useState("");
  const [announcementFile, setAnnouncementFile] = useState<File | null>(null);

  const currentClass = classes.find(c => c.id === classId) || classes[0];
  const classAssignments = assignments.filter(a => a.classId === currentClass.id);
  const classAnnouncements = announcements.filter(a => a.classId === currentClass.id);

  const handlePostAnnouncement = () => {
    if (!announcementText.trim() && !announcementFile) return;
    
    addAnnouncement({
      classId: currentClass.id,
      author: "Dr. Smith", // Hardcoded faculty name for now
      text: announcementText,
      attachments: announcementFile ? [{
        name: announcementFile.name,
        type: announcementFile.type || "Document",
      }] : undefined
    });
    
    setAnnouncementText("");
    setAnnouncementFile(null);
  };

  const materials = classAssignments.filter(a => a.type === 'Material');
  const assignmentItems = classAssignments.filter(a => a.type === 'Assignment');
  const quizItems = classAssignments.filter(a => a.type === 'Quiz');
  const codingItems = classAssignments.filter(a => a.type === 'Coding Assignment');
  const gradeable = classAssignments.filter(a => a.type !== 'Material');

  const openCreateModal = (type: "Assignment" | "Quiz" | "Coding Assignment" | "Material") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const getSubmissionStats = (assignmentId: string) => {
    const subs = submissions.filter(s => s.assignmentId === assignmentId);
    const graded = subs.filter(s => s.status === 'graded').length;
    return { total: subs.length, graded, pending: subs.length - graded };
  };

  const formatDueDate = (dueDate: string) => {
    if (!dueDate) return null;
    const d = new Date(dueDate);
    if (isNaN(d.getTime())) return dueDate;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const typeConfig = {
    'Assignment': { icon: FileText, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200', label: 'Assignment' },
    'Quiz': { icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200', label: 'Quiz' },
    'Coding Assignment': { icon: FileCode, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200', label: 'Coding' },
    'Material': { icon: Book, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200', label: 'Material' },
  };

  const AssignmentRow = ({ item }: { item: AssignmentItem }) => {
    const cfg = typeConfig[item.type] ?? typeConfig['Assignment'];
    const Icon = cfg.icon;
    const stats = getSubmissionStats(item.id);

    return (
      <div className="group bg-white border border-slate-200 rounded-xl p-4 flex items-center hover:shadow-md hover:border-slate-300 transition-all">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setEditingAssignment(item)}
            className="block text-left font-semibold text-gray-900 hover:text-indigo-700 transition-colors truncate w-full"
          >
            {item.title}
          </button>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
            {item.dueDate && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Due {formatDueDate(item.dueDate)}
              </span>
            )}
            {item.type !== 'Material' && stats.total > 0 && (
              <span className="text-xs text-gray-500">{stats.total} submitted</span>
            )}
          </div>
        </div>
        {item.type !== 'Material' && (
          <div className="flex items-center gap-2 mr-2">
            {stats.pending > 0 && (
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                {stats.pending} pending
              </span>
            )}
            {stats.graded > 0 && (
              <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                {stats.graded} graded
              </span>
            )}
          </div>
        )}
        <button
          onClick={() => setEditingAssignment(item)}
          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Edit"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const SectionGroup = ({
    label,
    items,
    emptyText,
    type,
  }: {
    label: string;
    items: AssignmentItem[];
    emptyText: string;
    type: "Assignment" | "Quiz" | "Coding Assignment" | "Material";
  }) => {
    const cfg = typeConfig[type];
    const Icon = cfg.icon;
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-6 h-6 rounded-md ${cfg.bg} ${cfg.color} flex items-center justify-center`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <h3 className={`text-sm font-bold uppercase tracking-wider ${cfg.color}`}>{label}</h3>
          <span className="text-xs text-gray-400 font-medium">({items.length})</span>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
            {emptyText}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => <AssignmentRow key={item.id} item={item} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopNav role="faculty" />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Other Classes</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {classes.map(c => (
              <Link
                key={c.id}
                href={`/faculty/class/${c.id}`}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  c.id === currentClass.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className={`w-2 h-2 rounded-full mr-3 ${c.color}`}></div>
                <span className="truncate">{c.name}</span>
              </Link>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <button className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600">
              <Settings className="w-4 h-4 mr-2" />
              Class Settings
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Class Header Banner */}
          <div className={`${currentClass.color} px-8 py-10 relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-2">{currentClass.name}</h1>
              <p className="text-white/80 font-medium text-lg">{currentClass.section}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-8">
            <nav className="flex space-x-8">
              {[
                { id: "announcements", label: "Announcements", icon: MessageSquare },
                { id: "classwork", label: "Classwork", icon: ListTodo },
                { id: "grades", label: "Grades", icon: Award },
                { id: "students", label: "Students List", icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? "text-indigo-600" : "text-gray-400"}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8 max-w-5xl mx-auto">
            {/* Announcements */}
            {activeTab === "announcements" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 font-bold text-sm">FA</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <textarea
                        className="w-full text-gray-700 placeholder-gray-400 border-none focus:ring-0 resize-none bg-slate-50 rounded-lg p-4"
                        rows={3}
                        placeholder="Share an announcement or resource with your class..."
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                      ></textarea>
                      
                      {announcementFile && (
                        <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg max-w-sm">
                          <FileText className="w-5 h-5 text-indigo-500" />
                          <span className="text-sm text-slate-700 truncate flex-1">{announcementFile.name}</span>
                          <button 
                            onClick={() => setAnnouncementFile(null)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            &times;
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <div>
                      <input 
                        type="file" 
                        id="announcement-file" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setAnnouncementFile(e.target.files[0]);
                          }
                        }}
                      />
                      <label htmlFor="announcement-file" className="cursor-pointer inline-flex text-gray-500 hover:text-indigo-600 p-2 rounded-md transition-colors">
                        <FileText className="w-5 h-5" />
                      </label>
                    </div>
                    <button 
                      onClick={handlePostAnnouncement}
                      disabled={!announcementText.trim() && !announcementFile}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4 mr-2" /> Post
                    </button>
                  </div>
                </div>

                {classAnnouncements.length === 0 ? (
                  <div className="text-center py-10 bg-white border border-slate-200 rounded-xl">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-slate-600 font-medium">No announcements yet</h3>
                    <p className="text-slate-400 text-sm mt-1">Post a message above to notify your students.</p>
                  </div>
                ) : (
                  classAnnouncements.map((ann) => (
                    <div key={ann.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-bold text-sm">
                            {ann.author.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{ann.author}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(ann.createdAt).toLocaleDateString('en-IN', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {ann.text && <p className="text-gray-700 mb-4 whitespace-pre-wrap">{ann.text}</p>}
                      
                      {ann.attachments && ann.attachments.length > 0 && (
                        <div className="space-y-2 mt-4">
                          {ann.attachments.map((file, i) => (
                            <div key={i} className="border border-slate-200 rounded-lg p-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors">
                              <div className="p-2 bg-red-100 text-red-600 rounded">
                                <FileText className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">{file.type || 'Document'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Classwork */}
            {activeTab === "classwork" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-semibold text-gray-800">Course Content</h2>
                  <div className="relative group">
                    <button className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-all">
                      <Plus className="w-4 h-4 mr-2" /> Create
                    </button>
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1">
                      <button onClick={() => openCreateModal('Assignment')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-3">
                        <div className="w-7 h-7 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        Assignment
                      </button>
                      <button onClick={() => openCreateModal('Quiz')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-3">
                        <div className="w-7 h-7 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                        Quiz
                      </button>
                      <button onClick={() => openCreateModal('Coding Assignment')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3">
                        <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileCode className="w-3.5 h-3.5" />
                        </div>
                        Coding Assignment
                      </button>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button onClick={() => openCreateModal('Material')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-3">
                        <div className="w-7 h-7 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Book className="w-3.5 h-3.5" />
                        </div>
                        Material
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                  <SectionGroup
                    label="Materials"
                    items={materials}
                    emptyText="No materials posted yet"
                    type="Material"
                  />
                  <SectionGroup
                    label="Assignments"
                    items={assignmentItems}
                    emptyText="No assignments created yet"
                    type="Assignment"
                  />
                  <SectionGroup
                    label="Quizzes"
                    items={quizItems}
                    emptyText="No quizzes created yet"
                    type="Quiz"
                  />
                  <SectionGroup
                    label="Coding Assignments"
                    items={codingItems}
                    emptyText="No coding assignments created yet"
                    type="Coding Assignment"
                  />
                </div>
              </div>
            )}

            {/* Grades */}
            {activeTab === "grades" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Grades & Evaluation</h2>
                  <p className="text-sm text-gray-500 mt-1">Click any assignment to start evaluation</p>
                </div>
                {gradeable.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Award className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No gradeable items yet</h3>
                    <p className="text-gray-500 max-w-sm mt-2">Create assignments, quizzes, or coding tasks in the Classwork tab.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gradeable.map(item => {
                      const cfg = typeConfig[item.type] ?? typeConfig['Assignment'];
                      const Icon = cfg.icon;
                      const stats = getSubmissionStats(item.id);
                      const isQuiz = item.type === 'Quiz';

                      return (
                        <Link
                          key={item.id}
                          href={`/faculty/evaluation/${item.id}`}
                          className="group bg-white border border-slate-200 rounded-xl p-5 flex items-center hover:shadow-md hover:border-indigo-200 transition-all"
                        >
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{item.title}</h4>
                            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                              {item.dueDate && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Due {formatDueDate(item.dueDate)}
                                </span>
                              )}
                              {isQuiz ? (
                                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                                  Auto-graded
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex items-center gap-6 mr-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{stats.total}</div>
                              <div className="text-xs text-gray-500">Submitted</div>
                            </div>
                            {isQuiz ? (
                              <div className="text-center">
                                <div className="text-lg font-bold text-emerald-600">{stats.graded}</div>
                                <div className="text-xs text-gray-500">Auto-graded</div>
                              </div>
                            ) : (
                              <>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">{stats.graded}</div>
                                  <div className="text-xs text-gray-500">Graded</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-orange-500">{stats.pending}</div>
                                  <div className="text-xs text-gray-500">Pending</div>
                                </div>
                              </>
                            )}
                          </div>
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            isQuiz
                              ? 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100'
                              : stats.pending > 0
                                ? 'bg-orange-50 text-orange-700 group-hover:bg-orange-100'
                                : 'bg-gray-50 text-gray-600 group-hover:bg-gray-100'
                          }`}>
                            {isQuiz ? (
                              <><ClipboardList className="w-4 h-4" /> View Results</>
                            ) : stats.pending > 0 ? (
                              <><Award className="w-4 h-4" /> Evaluate ({stats.pending})</>
                            ) : (
                              <><CheckCircle className="w-4 h-4" /> All Graded</>
                            )}
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Students */}
            {activeTab === "students" && (
              <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">Students ({studentsList.length})</h2>
                  <div className="flex gap-2">
                    {isDeleteMode ? (
                      <>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete selected students?")) {
                              setStudentsList(prev => prev.filter(s => !selectedStudents.includes(s.id)));
                              setSelectedStudents([]);
                              setIsDeleteMode(false);
                            }
                          }}
                          disabled={selectedStudents.length === 0}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          Confirm Delete ({selectedStudents.length})
                        </button>
                        <button
                          onClick={() => { setIsDeleteMode(false); setSelectedStudents([]); }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsDeleteMode(true)}
                        className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Students
                      </button>
                    )}
                  </div>
                </div>

                {/* Classroom Invite Card */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-indigo-900 mb-1">Invite Students to {currentClass.name}</h3>
                    <p className="text-sm text-indigo-700 mb-4">Share this classroom code or link with your students to give them access to materials, assignments, and announcements.</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center bg-white border border-indigo-200 rounded-lg overflow-hidden shadow-sm">
                        <span className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50 border-r border-indigo-100">Class Code</span>
                        <span className="px-4 py-2 font-mono font-bold text-indigo-700 tracking-wider text-lg">{currentClass.id.substring(0, 6).toUpperCase()}</span>
                        <button className="px-3 py-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors" title="Copy code">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm shadow-sm hover:bg-indigo-700 transition-colors">
                        <Share2 className="w-4 h-4" /> Copy Link
                      </button>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100 flex flex-col items-center justify-center flex-shrink-0">
                    <QrCode className="w-24 h-24 text-indigo-900" />
                    <span className="text-[10px] font-bold text-indigo-400 mt-1 tracking-wider uppercase">Scan to Join</span>
                  </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {isDeleteMode && (
                          <th className="px-5 py-3 w-12 text-center">
                            <input
                              type="checkbox"
                              checked={selectedStudents.length === studentsList.length && studentsList.length > 0}
                              onChange={(e) => setSelectedStudents(e.target.checked ? studentsList.map(s => s.id) : [])}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </th>
                        )}
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll No</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {studentsList.length === 0 ? (
                        <tr>
                          <td colSpan={isDeleteMode ? 5 : 4} className="px-5 py-8 text-center text-gray-500">
                            No students found.
                          </td>
                        </tr>
                      ) : (
                        studentsList.map((student, i) => (
                          <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                            {isDeleteMode && (
                              <td className="px-5 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedStudents.includes(student.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedStudents(prev => [...prev, student.id]);
                                    else setSelectedStudents(prev => prev.filter(id => id !== student.id));
                                  }}
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              </td>
                            )}
                            <td className="px-5 py-3 text-sm text-gray-500">{i + 1}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm flex items-center justify-center flex-shrink-0">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="font-medium text-gray-900 text-sm">{student.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-sm text-gray-500 font-mono">{student.rollNo}</td>
                            <td className="px-5 py-3">
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">Active</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {isModalOpen && currentClass && (
        <CreateWorksheetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          classId={currentClass.id}
          initialType={modalType}
        />
      )}

      {editingAssignment && (
        <AssignmentDetailModal
          assignment={editingAssignment}
          onClose={() => setEditingAssignment(null)}
        />
      )}
    </div>
  );
}
