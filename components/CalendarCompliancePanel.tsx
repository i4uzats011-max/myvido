'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sunrise,
  Sunset,
  Sparkles,
  Award,
  Filter,
} from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { setSelectedDate } from '@/store/slices/tasksSlice';
import { setActiveView } from '@/store/slices/uiSlice';
import { ComplianceItem, getAllCalendarItemsForMonth, getPrayerTimingsForDate } from '@/lib/compliance';

export default function CalendarCompliancePanel() {
  const dispatch = useAppDispatch();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [calendarItems, setCalendarItems] = useState<ComplianceItem[]>([]);
  const [todayPrayers, setTodayPrayers] = useState<any>(null);

  useEffect(() => {
    // Fetch month items from API or directly from our robust compliance engine
    const items = getAllCalendarItemsForMonth(currentYear, currentMonth);
    setCalendarItems(items);

    const todayStr = new Date().toISOString().split('T')[0];
    setTodayPrayers(getPrayerTimingsForDate(todayStr));
  }, [currentYear, currentMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const filteredItems = calendarItems.filter((item) => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  const handleDateClick = (dateStr: string) => {
    dispatch(setSelectedDate(dateStr));
    dispatch(setActiveView('tasks'));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-inner">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Statutory Compliance &amp; Master Festival Calendar</span>
            </h1>
            <p className="text-xs text-neutral-400">
              TDS · GST · Income Tax · ROC · Indian Bank Holidays · All Regional Festivals · Namaz Times
            </p>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-[#1b1b1b] border border-[#303030] p-1.5 rounded-2xl">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-neutral-400 hover:text-white hover:bg-[#252525] rounded-xl transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm text-neutral-100 px-3 min-w-[130px] text-center">
            {monthNames[currentMonth - 1]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 text-neutral-400 hover:text-white hover:bg-[#252525] rounded-xl transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          ['all', 'All Events & Deadlines'],
          ['tds', 'TDS & TCS Returns'],
          ['gst', 'GST (GSTR-1, 3B, CMP-08)'],
          ['income-tax', 'Income Tax & Advance Tax'],
          ['roc', 'ROC / MCA Compliances'],
          ['bank-holiday', 'Bank Holidays'],
          ['festival', 'Festivals (Hindu/Punjabi/Marathi)'],
          ['islamic', 'Islamic & Ramadan'],
        ].map(([catKey, catLabel]) => (
          <button
            key={catKey}
            onClick={() => setFilterCategory(catKey)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
              filterCategory === catKey
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#2b2b2b]'
            }`}
          >
            {catLabel}
          </button>
        ))}
      </div>

      {/* Events List for Month */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredItems.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-[#141414] border border-[#262626] rounded-2xl">
            <Sparkles className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-neutral-300">
              No matching events or deadlines found for this category.
            </h3>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleDateClick(item.date)}
              className="bg-[#161616] border border-[#282828] hover:border-[#383838] p-4 rounded-2xl shadow-md transition hover:scale-[1.01] cursor-pointer flex flex-col justify-between space-y-2.5"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.category === 'tds'
                        ? 'bg-blue-900/60 text-blue-300 border border-blue-800/40'
                        : item.category === 'gst'
                        ? 'bg-purple-900/60 text-purple-300 border border-purple-800/40'
                        : item.category === 'income-tax'
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-800/40'
                        : item.category === 'roc'
                        ? 'bg-amber-900/60 text-amber-300 border border-amber-800/40'
                        : item.category === 'bank-holiday'
                        ? 'bg-red-900/60 text-red-300 border border-red-800/40'
                        : 'bg-rose-900/60 text-rose-300 border border-rose-800/40'
                    }`}
                  >
                    {item.category}
                  </span>

                  <span className="text-xs font-bold text-neutral-300">
                    📅 {item.date}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-neutral-100">{item.title}</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#242424] flex items-center justify-between text-[11px] text-neutral-400">
                <span>{item.statutoryAct || 'National & Regional Celebration'}</span>
                {item.formName && (
                  <span className="font-mono text-amber-400 font-semibold">{item.formName}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
