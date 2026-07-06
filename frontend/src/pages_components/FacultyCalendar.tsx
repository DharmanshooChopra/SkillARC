"use client";
import React, { useState } from 'react';
import { TopNav } from '../components/TopNav';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { Calendar as CalendarIcon, Clock, Plus, Tag, CheckCircle2 } from 'lucide-react';
import 'react-day-picker/dist/style.css';

export function FacultyCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { events, addEvent } = useAppContext();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && title) {
      addEvent({ date: selectedDate, title, note });
      setTitle('');
      setNote('');
    }
  };

  const selectedDateEvents = events.filter(ev => 
    selectedDate && isSameDay(ev.date, selectedDate)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopNav role="faculty" />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Global Calendar</h1>
          <p className="text-gray-500 mt-1">Manage important dates, exams, and schedule classes.</p>
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
                hasEvent: (date) => events.some(ev => isSameDay(ev.date, date))
              }}
              modifiersClassNames={{
                selected: 'bg-indigo-600 text-white rounded-full',
                today: 'text-indigo-600 font-bold',
                hasEvent: 'after:content-[""] after:w-1.5 after:h-1.5 after:bg-indigo-400 after:rounded-full after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 relative'
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
                {selectedDateEvents.length > 0 ? (
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
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>No events scheduled for this day.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Add Event Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Plus className="w-5 h-5 text-indigo-500 mr-2" />
                Add Event for {selectedDate ? format(selectedDate, "MMM d") : "..."}
              </h3>
              
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Tag className="w-4 h-4 mr-1.5 text-gray-400" /> Event Title
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., Midterm Exam - Section A"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-gray-400" /> Additional Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional details or timings..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!selectedDate || !title}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg shadow-sm transition-colors"
                >
                  Save Event
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
