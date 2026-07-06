"use client";

import { useState, useEffect } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays,
  parseISO
} from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Clock, X, Info, BookOpen } from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  event_type: string;
  date: string;
  is_default: boolean;
  classroom_id?: number | null;
}

export default function StudentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      const STUDENT_ID = 2; // Hardcoded for prototype
      const res = await fetch(`http://127.0.0.1:8000/users/${STUDENT_ID}/calendar`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const getEventsForDate = (date: Date) => {
    return events.filter(e => isSameDay(parseISO(e.date), date));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsViewModalOpen(true);
  };

  // Generate calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const dayEvents = getEventsForDate(day);
        const isHoliday = day.getDay() === 0 || dayEvents.some(e => e.event_type === "holiday");
        const isToday = isSameDay(day, new Date());

        days.push(
          <div 
            key={day.toString()}
            onClick={() => handleDateClick(cloneDay)}
            className={`min-h-[140px] p-2 border-b border-r border-slate-100 transition-all cursor-pointer relative group 
              ${!isCurrentMonth ? 'bg-slate-50 opacity-50' : 'hover:bg-teal-50/30'}
              ${isHoliday && isCurrentMonth ? 'bg-red-50/10' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold ${
                isToday ? 'bg-teal-600 text-white shadow-md' : 
                isHoliday && isCurrentMonth ? 'text-red-500' : 'text-slate-700'
              }`}>
                {formattedDate}
              </div>
              <button className="opacity-0 group-hover:opacity-100 text-teal-400 hover:text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-full transition-all p-1">
                <Info className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-2 space-y-1.5 px-1 max-h-[80px] overflow-hidden">
              {dayEvents.map(evt => (
                <div key={evt.id} className={`text-xs font-medium px-2 py-1 rounded-md truncate border shadow-sm ${
                  evt.event_type === 'holiday' ? 'bg-red-50 text-red-700 border-red-100' : 
                  evt.event_type === 'deadline' ? 'bg-teal-50 text-teal-700 border-teal-100' : 
                  'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                  {evt.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>);
      days = [];
    }
    return rows;
  };

  const getEventIcon = (type: string) => {
    if (type === 'holiday') return <MapPin className="w-4 h-4 text-red-500" />;
    if (type === 'deadline') return <Clock className="w-4 h-4 text-teal-500" />;
    return <BookOpen className="w-4 h-4 text-emerald-500" />;
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8 relative">
        
        {/* Calendar Main Area */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="text-teal-600" />
              {format(currentMonth, "MMMM yyyy")}
            </h1>
            <div className="flex items-center gap-3">
              <button onClick={handleToday} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                Today
              </button>
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1">
                <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                <div key={day} className={`py-4 text-center text-sm font-bold tracking-wide uppercase ${i === 0 ? 'text-red-500' : 'text-slate-400'}`}>
                  {day}
                </div>
              ))}
            </div>
            {renderCells()}
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-h-[600px] overflow-y-auto">
            <h2 className="font-bold text-slate-800 text-lg mb-4">Upcoming Schedule</h2>
            <div className="space-y-6">
              {events
                .filter(e => parseISO(e.date) >= new Date(new Date().setHours(0,0,0,0)))
                .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
                .slice(0, 10)
                .map((evt) => (
                <div key={evt.id} className={`relative pl-4 border-l-2 ${evt.event_type === 'deadline' ? 'border-teal-500' : evt.event_type === 'holiday' ? 'border-red-500' : 'border-emerald-500'}`}>
                  <div className={`absolute -left-[5px] top-1.5 h-2 w-2 rounded-full ${evt.event_type === 'deadline' ? 'bg-teal-500' : evt.event_type === 'holiday' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                  <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">{format(parseISO(evt.date), "MMM d, yyyy")}</p>
                  <h3 className="font-semibold text-slate-800">{evt.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 capitalize">{evt.event_type}</p>
                </div>
              ))}
              {events.filter(e => parseISO(e.date) >= new Date(new Date().setHours(0,0,0,0))).length === 0 && (
                <p className="text-slate-500 text-sm text-center">No upcoming events.</p>
              )}
            </div>
          </div>
        </div>

        {/* View Details Modal */}
        {isViewModalOpen && selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-teal-50/50">
                <h3 className="font-bold text-slate-800 text-lg">Events for {format(selectedDate, "MMM d")}</h3>
                <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 rounded-full p-1.5 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {getEventsForDate(selectedDate).length > 0 ? (
                  getEventsForDate(selectedDate).map(evt => (
                    <div key={evt.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="mt-0.5 bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                        {getEventIcon(evt.event_type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{evt.title}</h4>
                        <p className="text-sm text-slate-500 mt-1 capitalize">{evt.event_type}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CalendarIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No events scheduled.</p>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setIsViewModalOpen(false)} className="px-6 py-2.5 font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
