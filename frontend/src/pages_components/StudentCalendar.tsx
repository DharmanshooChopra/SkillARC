"use client";
import React, { useState } from 'react';
import { TopNav } from '../components/TopNav';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { Calendar as CalendarIcon, CheckCircle2, FileText, CheckCircle, FileCode } from 'lucide-react';
import 'react-day-picker/dist/style.css';

export function StudentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { events, assignments, classes } = useAppContext();

  // A helper function to parse YYYY-MM-DD from assignment dueDate strings like "2026-07-15 23:59"
  const getAssignmentDate = (dateString: string) => {
    if (!dateString) return null;
    const parts = dateString.split(' ')[0].split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return null;
  };

  const selectedDateEvents = events.filter(ev => 
    selectedDate && isSameDay(ev.date, selectedDate)
  );

  const selectedDateAssignments = assignments.filter(a => {
    if (!selectedDate || !a.dueDate) return false;
    const assignmentDate = getAssignmentDate(a.dueDate);
    return assignmentDate && isSameDay(assignmentDate, selectedDate);
  });

  const hasEventOrAssignment = (date: Date) => {
    const hasEvent = events.some(ev => isSameDay(ev.date, date));
    const hasAssignment = assignments.some(a => {
      const aDate = getAssignmentDate(a.dueDate);
      return aDate && isSameDay(aDate, date);
    });
    return hasEvent || hasAssignment;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Quiz': return <CheckCircle className="w-5 h-5" />;
      case 'Coding Assignment': return <FileCode className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Quiz': return 'text-violet-600 bg-violet-100';
      case 'Coding Assignment': return 'text-blue-600 bg-blue-100';
      default: return 'text-emerald-600 bg-emerald-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopNav role="student" />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Calendar</h1>
          <p className="text-gray-500 mt-1">View your schedule, global events, and assignment deadlines.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Calendar Picker Side */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:w-auto w-full">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="font-sans"
              modifiers={{
                hasItem: (date) => hasEventOrAssignment(date)
              }}
              modifiersClassNames={{
                selected: 'bg-indigo-600 text-white rounded-full',
                today: 'text-indigo-600 font-bold',
                hasItem: 'after:content-[""] after:w-1.5 after:h-1.5 after:bg-indigo-400 after:rounded-full after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 relative'
              }}
            />
          </div>

          {/* Details Side */}
          <div className="flex-1 flex flex-col gap-6 w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center">
                <CalendarIcon className="w-5 h-5 text-indigo-500 mr-2" />
                <h2 className="text-lg font-bold text-gray-800">
                  {selectedDate ? format(selectedDate, "EEEE, MMMM do, yyyy") : "Select a date"}
                </h2>
              </div>
              
              <div className="p-6">
                {(selectedDateEvents.length > 0 || selectedDateAssignments.length > 0) ? (
                  <div className="space-y-4">
                    {selectedDateEvents.map(ev => (
                      <div key={ev.id} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{ev.title}</h4>
                          {ev.note && <p className="text-gray-600 mt-1">{ev.note}</p>}
                        </div>
                      </div>
                    ))}

                    {selectedDateAssignments.map(a => {
                      const cls = classes.find(c => c.id === a.classId);
                      return (
                        <div key={a.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-4 shadow-sm">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(a.type)}`}>
                            {getTypeIcon(a.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide bg-slate-100 text-slate-600">
                                {a.type}
                              </span>
                              {cls && <span className="text-xs font-semibold text-indigo-600">{cls.name}</span>}
                            </div>
                            <h4 className="font-semibold text-gray-900 text-lg mt-1">{a.title}</h4>
                            <p className="text-gray-500 text-sm mt-1">Due at: {a.dueDate?.split(' ')[1] || '11:59 PM'}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>No events or assignments scheduled for this day.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
