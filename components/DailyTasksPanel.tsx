'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Palette,
  Sunrise,
  Sunset,
  ShieldAlert,
  Flame,
  Check,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTasksForDate,
  createTask,
  updateTask,
  deleteTask,
  setSelectedDate,
  setPriorityColor,
  fetchComplianceAndPrayers,
  TaskItem,
} from '@/store/slices/tasksSlice';
import { showToast, setActiveView } from '@/store/slices/uiSlice';
import { TaskPriority } from '@/lib/models/Task';

export default function DailyTasksPanel() {
  const dispatch = useAppDispatch();
  const {
    items: tasks,
    selectedDate,
    priorityColors,
    filterPriority,
    isLoading,
    complianceItems,
    prayerTimings,
  } = useAppSelector((state) => state.tasks);

  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('urgent-important');
  const [newDueDate, setNewDueDate] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Load tasks, compliances & prayers for the selected date
  useEffect(() => {
    dispatch(fetchTasksForDate(selectedDate));
    dispatch(fetchComplianceAndPrayers(selectedDate));
  }, [dispatch, selectedDate]);

  // Voice typing setup (Web Speech API)
  const toggleVoiceTyping = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      dispatch(
        showToast({
          message: 'Voice typing not supported on this browser. Try Chrome or Safari.',
          type: 'error',
        })
      );
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Hindi (India) with English fallback
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        dispatch(showToast({ message: 'Listening... बोलिए...', type: 'info' }));
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewTitle((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await dispatch(
      createTask({
        title: newTitle.trim(),
        priority: newPriority,
        date: selectedDate,
        dueDate: newDueDate || selectedDate,
      })
    );

    setNewTitle('');
    setNewDueDate('');
    dispatch(showToast({ message: 'Task added successfully! ✨', type: 'success' }));
  };

  // Toggle complete with satisfying animation
  const handleToggleComplete = async (task: TaskItem) => {
    const nextState = !task.completed;
    if (nextState) {
      setAnimatingTaskId(task._id);
      setTimeout(async () => {
        await dispatch(
          updateTask({
            id: task._id,
            updates: { completed: nextState },
          })
        );
        setAnimatingTaskId(null);
      }, 400);
    } else {
      await dispatch(
        updateTask({
          id: task._id,
          updates: { completed: nextState },
        })
      );
    }
  };

  // Date navigation helpers
  const changeDateByDays = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const dateStr = d.toISOString().split('T')[0];
    dispatch(setSelectedDate(dateStr));
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent-important':
        return { label: 'Urgent & Important (Q1)', color: priorityColors['urgent-important'], badge: 'Red' };
      case 'urgent-not-important':
        return { label: 'Urgent, Not Important (Q2)', color: priorityColors['urgent-not-important'], badge: 'Orange' };
      case 'important-not-urgent':
        return { label: 'Important, Not Urgent (Q3)', color: priorityColors['important-not-urgent'], badge: 'Yellow' };
      case 'not-urgent-not-important':
        return { label: 'Not Urgent & Not Important (Q4)', color: priorityColors['not-urgent-not-important'], badge: 'Green' };
      default:
        return { label: 'Normal Task', color: '#a3a3a3', badge: 'Gray' };
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (!filterPriority) return true;
    return t.priority === filterPriority;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 space-y-6 animate-fade-in">
      {/* Top Header & Date Navigation */}
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-inner">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Daily Tasks &amp; Eisenhower Planner</span>
            </h1>
            <p className="text-xs text-neutral-400">
              Prioritize with Red, Orange, Yellow, Green · Stay organized effortlessly
            </p>
          </div>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2 bg-[#1b1b1b] border border-[#303030] p-1.5 rounded-2xl">
          <button
            onClick={() => changeDateByDays(-1)}
            className="p-2 text-neutral-400 hover:text-white hover:bg-[#252525] rounded-xl transition"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => dispatch(setSelectedDate(e.target.value))}
            className="bg-transparent text-white font-semibold text-xs sm:text-sm px-2 py-1 outline-none cursor-pointer"
          />

          <button
            onClick={() => changeDateByDays(1)}
            className="p-2 text-neutral-400 hover:text-white hover:bg-[#252525] rounded-xl transition"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={() => dispatch(setSelectedDate(new Date().toISOString().split('T')[0]))}
              className="px-2.5 py-1 text-xs font-semibold bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-600/30 transition"
            >
              Today
            </button>
          )}

          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 text-neutral-400 hover:text-amber-400 hover:bg-[#252525] rounded-xl transition ml-1"
            title="Customize Priority Colors"
          >
            <Palette className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Color Customization Bar (Collapsible) */}
      {showColorPicker && (
        <div className="bg-[#181818] border border-[#2e2e2e] rounded-2xl p-4 animate-fade-in space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-300 font-semibold">
            <span>🎨 Customize Priority Colors (Eisenhower Matrix):</span>
            <button
              onClick={() => setShowColorPicker(false)}
              className="text-neutral-400 hover:text-white text-xs"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {(
              [
                ['urgent-important', 'Urgent & Important (Red default)'],
                ['urgent-not-important', 'Urgent, Not Important (Orange default)'],
                ['important-not-urgent', 'Important, Not Urgent (Yellow default)'],
                ['not-urgent-not-important', 'Not Urgent, Not Important (Green default)'],
              ] as const
            ).map(([pKey, pTitle]) => (
              <div key={pKey} className="flex items-center justify-between bg-[#121212] p-2.5 rounded-xl border border-[#2b2b2b]">
                <span className="text-[11px] text-neutral-300">{pTitle}</span>
                <input
                  type="color"
                  value={priorityColors[pKey]}
                  onChange={(e) =>
                    dispatch(setPriorityColor({ priority: pKey, color: e.target.value }))
                  }
                  className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Prayers & Sehri/Iftar + Statutory Compliances Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Namaz & Sehri/Iftar Timings */}
        {prayerTimings && (
          <div className="bg-[#161616] border border-[#2c2c2c] rounded-2xl p-4 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sunrise className="w-4 h-4 text-amber-400" />
                Prayer, Sehri &amp; Iftar Timings
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                Accurate Solar Times
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-[#1f1f1f] border border-[#303030]">
                <span className="text-[10px] text-neutral-400 block font-medium">Sehri Ends</span>
                <span className="font-bold text-amber-300">{prayerTimings.sehriEnd}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#1f1f1f] border border-[#303030]">
                <span className="text-[10px] text-neutral-400 block font-medium">Fajr</span>
                <span className="font-bold text-neutral-200">{prayerTimings.fajr}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#1f1f1f] border border-[#303030]">
                <span className="text-[10px] text-neutral-400 block font-medium">Dhuhr</span>
                <span className="font-bold text-neutral-200">{prayerTimings.dhuhr}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#1f1f1f] border border-[#303030]">
                <span className="text-[10px] text-neutral-400 block font-medium">Asr</span>
                <span className="font-bold text-neutral-200">{prayerTimings.asr}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#1f1f1f] border border-[#303030]">
                <span className="text-[10px] text-amber-400 font-medium">Iftar (Maghrib)</span>
                <span className="font-bold text-amber-300">{prayerTimings.iftar}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#1f1f1f] border border-[#303030]">
                <span className="text-[10px] text-neutral-400 block font-medium">Isha</span>
                <span className="font-bold text-neutral-200">{prayerTimings.isha}</span>
              </div>
            </div>
          </div>
        )}

        {/* Compliances & Holidays on Selected Date */}
        <div className="bg-[#161616] border border-[#2c2c2c] rounded-2xl p-4 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-red-500" />
              Calendar &amp; Due Dates for {selectedDate}
            </span>
            <button
              onClick={() => dispatch(setActiveView('calendar'))}
              className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
            >
              View Full Calendar →
            </button>
          </div>
          {complianceItems.length === 0 ? (
            <p className="text-xs text-neutral-500 py-3 text-center">
              No statutory deadlines or festival holidays on this date.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {complianceItems.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#1f1f1f] border border-[#333333] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.category === 'tds'
                          ? 'bg-blue-900/60 text-blue-300'
                          : c.category === 'gst'
                          ? 'bg-purple-900/60 text-purple-300'
                          : c.category === 'income-tax'
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : c.category === 'roc'
                          ? 'bg-amber-900/60 text-amber-300'
                          : 'bg-rose-900/60 text-rose-300'
                      }`}
                    >
                      {c.category}
                    </span>
                    <span className="font-semibold text-neutral-200">{c.title}</span>
                  </div>
                  {c.formName && (
                    <span className="text-[10px] text-neutral-400 font-mono">{c.formName}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Creation Form with Voice Typing */}
      <form
        onSubmit={handleAddTask}
        className="bg-[#161616] border border-[#2b2b2b] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3"
      >
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-red-500" />
            Add New Task / Todo
          </label>
          <span className="text-xs text-neutral-400">
            {completedCount}/{tasks.length} Completed ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#252525] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to be done? बोलकर भी लिख सकते हैं..."
              className="w-full pl-4 pr-11 py-3 bg-[#111111] border border-[#333333] rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500 transition"
            />
            {/* Voice Typing Microphone Button */}
            <button
              type="button"
              onClick={toggleVoiceTyping}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'text-neutral-400 hover:text-white hover:bg-[#252525]'
              }`}
              title="Voice Typing (बोलकर टाइप करें)"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Priority Dropdown */}
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
            className="w-full sm:w-auto px-3 py-3 bg-[#111111] border border-[#333333] rounded-xl text-xs sm:text-sm font-semibold text-neutral-200 outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="urgent-important">🔴 Red: Urgent &amp; Important</option>
            <option value="urgent-not-important">🟠 Orange: Urgent, Not Important</option>
            <option value="important-not-urgent">🟡 Yellow: Important, Not Urgent</option>
            <option value="not-urgent-not-important">🟢 Green: Not Urgent, Not Important</option>
          </select>

          {/* Due Date Option */}
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="w-full sm:w-auto px-3 py-3 bg-[#111111] border border-[#333333] rounded-xl text-xs text-neutral-200 outline-none focus:border-red-500 cursor-pointer"
            title="Optional Follow-up Due Date"
          />

          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="w-full sm:w-auto px-5 py-3 bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-bold text-sm rounded-xl transition shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-[#141414] border border-[#262626] rounded-2xl">
            <Sparkles className="w-8 h-8 text-neutral-600 mx-auto mb-2 animate-bounce" />
            <h3 className="text-base font-semibold text-neutral-300">No tasks for {selectedDate}</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Add your daily routines, important matters, or client follow-ups above.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const pInfo = getPriorityLabel(task.priority);
            const isAnimating = animatingTaskId === task._id;

            return (
              <div
                key={task._id}
                className={`flex items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                  task.completed
                    ? 'bg-[#121212] border-[#222222] opacity-60'
                    : 'bg-[#181818] border-[#2d2d2d] hover:border-[#3d3d3d] shadow-md'
                } ${isAnimating ? 'scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.3)] bg-emerald-950/20' : ''}`}
                style={{
                  borderLeftWidth: '4px',
                  borderLeftColor: pInfo.color,
                }}
              >
                {/* Left: Tick Checkbox & Title */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white transition flex-shrink-0 mt-0.5 sm:mt-0"
                    title={task.completed ? 'Mark pending' : 'Mark done'}
                  >
                    {task.completed || isAnimating ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-scale-up" />
                    ) : (
                      <Circle className="w-6 h-6 text-neutral-500 hover:text-white" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm sm:text-base font-semibold transition-all ${
                        task.completed ? 'line-through text-neutral-500' : 'text-neutral-100'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-neutral-400 mt-0.5 truncate">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {/* Priority Tag */}
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: `${pInfo.color}30`, color: pInfo.color }}
                      >
                        ● {pInfo.label}
                      </span>

                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-[10px] text-neutral-400 bg-[#252525] px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          Due: {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => dispatch(deleteTask(task._id))}
                    className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
