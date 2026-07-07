"use client";
import React, { createContext, useContext, useState } from 'react';
import {
  classes as initialClasses,
  assignments as initialAssignments,
  submittedStudents as initialSubmissions,
} from '../data/mockData';
import type { QuizQuestion, TestCase, StudentSubmission } from '../data/mockData';

export type { QuizQuestion, TestCase, StudentSubmission };

export type ClassItem = typeof initialClasses[0] & { subjectCode?: string; joinCode?: string };

export type AssignmentItem = {
  id: string;
  classId: string;
  title: string;
  type: 'Assignment' | 'Quiz' | 'Coding Assignment' | 'Material';
  dueDate: string;
  status: string;
  description?: string;
  maxScore?: number;
  files?: any[];
  // Quiz
  questions?: QuizQuestion[];
  // Coding
  language?: string;
  testCases?: TestCase[];
};

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  note: string;
}

export type AnnouncementAttachment = {
  name: string;
  type: string;
  url?: string;
};

export type AnnouncementItem = {
  id: string;
  classId: string;
  author: string;
  text: string;
  attachments?: AnnouncementAttachment[];
  createdAt: string;
};

export type StudentNotification = {
  id: string;
  type: 'announcement' | 'assignment_graded' | 'new_assignment';
  title: string;
  message: string;
  date: string;
  read: boolean;
  classId: string;
  link?: string;
};

interface AppContextType {
  classes: ClassItem[];
  addClass: (newClass: Omit<ClassItem, 'id' | 'color' | 'lightColor' | 'textColor' | 'studentsCount'>) => void;
  updateClass: (id: string, updates: Partial<ClassItem>) => void;
  deleteClass: (id: string) => void;
  assignments: AssignmentItem[];
  addAssignment: (newAssignment: Omit<AssignmentItem, 'id'>) => void;
  updateAssignment: (id: string, updates: Partial<AssignmentItem>) => void;
  deleteAssignment: (id: string) => void;
  submissions: StudentSubmission[];
  gradeSubmission: (submissionId: string, score: number, feedback: string) => void;
  addSubmission: (submission: Omit<StudentSubmission, 'id'>) => void;
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  announcements: AnnouncementItem[];
  addAnnouncement: (announcement: Omit<AnnouncementItem, 'id' | 'createdAt'>) => void;
  deleteAnnouncement: (id: string) => void;
  notifications: StudentNotification[];
  markNotificationRead: (id: string) => void;
  isCreateModalOpen: boolean;
  setCreateModalOpen: (open: boolean) => void;
  joinedClassIds: string[];
  joinClass: (classId: string) => void;
}

const defaultContext: AppContextType = {
  classes: initialClasses,
  addClass: () => {},
  updateClass: () => {},
  deleteClass: () => {},
  assignments: initialAssignments as AssignmentItem[],
  addAssignment: () => {},
  updateAssignment: () => {},
  deleteAssignment: () => {},
  submissions: initialSubmissions,
  gradeSubmission: () => {},
  addSubmission: () => {},
  events: [],
  addEvent: () => {},
  announcements: [],
  addAnnouncement: () => {},
  deleteAnnouncement: () => {},
  notifications: [],
  markNotificationRead: () => {},
  isCreateModalOpen: false,
  setCreateModalOpen: () => {},
  joinedClassIds: [],
  joinClass: () => {},
};

const AppContext = createContext<AppContextType>(defaultContext);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [joinedClassIds, setJoinedClassIds] = useState<string[]>(['c1', 'c2', 'c3']);
  const [assignments, setAssignments] = useState<AssignmentItem[]>(initialAssignments as AssignmentItem[]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(initialSubmissions);
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 'h1', date: new Date('2026-10-31T00:00:00'), title: 'Diwali', note: 'Festival Holiday' },
    { id: 'h2', date: new Date('2026-12-25T00:00:00'), title: 'Christmas', note: 'Festival Holiday' },
    { id: 'h3', date: new Date('2026-01-26T00:00:00'), title: 'Republic Day', note: 'National Holiday' },
  ]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([
    {
      id: 'ann1',
      classId: 'c1',
      author: 'Dr. Smith',
      text: 'Welcome to the class! Please check out the introductory materials before our first session.',
      attachments: [{ name: 'Syllabus_2026.pdf', type: 'PDF Document' }],
      createdAt: new Date().toISOString()
    }
  ]);
  const [notifications, setNotifications] = useState<StudentNotification[]>([
    {
      id: 'notif_seed1',
      type: 'announcement',
      title: 'New announcement from Dr. Smith',
      message: 'Welcome to the class! Please check out the introductory materials before our first session.',
      date: new Date().toISOString(),
      read: false,
      classId: 'c1',
    },
    {
      id: 'notif_seed2',
      type: 'new_assignment',
      title: 'New Assignment: Assignment 1: Variables and Types',
      message: 'Due: 2026-10-15',
      date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
      classId: 'c1',
    },
    {
      id: 'notif_seed3',
      type: 'new_assignment',
      title: 'New Assignment: Array Operations',
      message: 'Due: 2026-10-20',
      date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      read: true,
      classId: 'c2',
    },
  ]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const addClass = (newClass: any) => {
    const colors = [
      { color: "bg-blue-600", lightColor: "bg-blue-50", textColor: "text-blue-600" },
      { color: "bg-purple-600", lightColor: "bg-purple-50", textColor: "text-purple-600" },
      { color: "bg-emerald-600", lightColor: "bg-emerald-50", textColor: "text-emerald-600" },
      { color: "bg-amber-600", lightColor: "bg-amber-50", textColor: "text-amber-600" },
    ];
    const theme = colors[classes.length % colors.length];
    setClasses([...classes, { id: `c${Date.now()}`, studentsCount: 0, ...newClass, ...theme }]);
  };

  const updateClass = (id: string, updates: Partial<ClassItem>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    // Also remove related assignments and announcements?
    setAssignments(prev => prev.filter(a => a.classId !== id));
    setAnnouncements(prev => prev.filter(a => a.classId !== id));
    setJoinedClassIds(prev => prev.filter(classId => classId !== id));
  };

  const joinClass = (classId: string) => {
    if (!joinedClassIds.includes(classId)) {
      setJoinedClassIds(prev => [...prev, classId]);
    }
  };

  const addAssignment = (newAssignment: Omit<AssignmentItem, 'id'>) => {
    const id = `a${Date.now()}`;
    setAssignments([...assignments, { id, ...newAssignment }]);
    // Auto-add calendar event if there's a due date
    if (newAssignment.dueDate) {
      const d = new Date(newAssignment.dueDate);
      if (!isNaN(d.getTime())) {
        setEvents(prev => [...prev, {
          id: `ev${Date.now()}`,
          date: d,
          title: `Due: ${newAssignment.title}`,
          note: `${newAssignment.type} due`,
        }]);
      }
    }
    // Fire student notification for new assignments and materials
    if (newAssignment.type !== 'Material') {
      setNotifications(prev => [{
        id: `notif${Date.now()}`,
        type: 'new_assignment',
        title: `New ${newAssignment.type}: ${newAssignment.title}`,
        message: newAssignment.dueDate ? `Due: ${newAssignment.dueDate}` : 'No due date',
        date: new Date().toISOString(),
        read: false,
        classId: newAssignment.classId,
        link: `/student/class/${newAssignment.classId}`,
      }, ...prev]);
    } else {
      setNotifications(prev => [{
        id: `notif${Date.now()}`,
        type: 'announcement',
        title: `New Material Posted: ${newAssignment.title}`,
        message: newAssignment.description || 'New study material has been uploaded.',
        date: new Date().toISOString(),
        read: false,
        classId: newAssignment.classId,
        link: `/student/class/${newAssignment.classId}`,
      }, ...prev]);
    }
  };

  const updateAssignment = (id: string, updates: Partial<AssignmentItem>) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const gradeSubmission = (submissionId: string, score: number, feedback: string) => {
    setSubmissions(prev =>
      prev.map(s =>
        s.id === submissionId ? { ...s, score, feedback, status: 'graded' as const } : s
      )
    );
  };

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    setEvents(prev => [...prev, { id: `e${Date.now()}`, ...event }]);
  };

  const addAnnouncement = (newAnnouncement: Omit<AnnouncementItem, 'id' | 'createdAt'>) => {
    const id = `ann${Date.now()}`;
    const announcement = { ...newAnnouncement, id, createdAt: new Date().toISOString() };
    setAnnouncements([announcement, ...announcements]);
    
    // Add notification for students
    setNotifications(prev => [{
      id: `notif${Date.now()}`,
      type: 'announcement',
      title: `New announcement from ${newAnnouncement.author}`,
      message: newAnnouncement.text,
      date: new Date().toISOString(),
      read: false,
      classId: newAnnouncement.classId,
    }, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const addSubmission = (submission: Omit<StudentSubmission, 'id'>) => {
    const id = `sub${Date.now()}`;
    setSubmissions(prev => [...prev, { id, ...submission }]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <AppContext.Provider value={{
      classes, addClass, updateClass, deleteClass,
      assignments, addAssignment, updateAssignment, deleteAssignment,
      submissions, gradeSubmission, addSubmission,
      events, addEvent,
      announcements, addAnnouncement, deleteAnnouncement,
      notifications, markNotificationRead,
      isCreateModalOpen, setCreateModalOpen,
      joinedClassIds, joinClass,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
