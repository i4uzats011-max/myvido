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
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  User,
  AlertCircle,
  IndianRupee,
  Tag,
  Filter,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchThreeDaysTasks,
  createTask,
  updateTask,
  deleteTask,
  setSelectedDate,
  setPriorityColor,
  setFilterPersonId,
  fetchComplianceAndPrayers,
  TaskItem,
} from '@/store/slices/tasksSlice';
import { fetchPersons, setSelectedPersonId } from '@/store/slices/ledgerSlice';
import { showToast, setActiveView } from '@/store/slices/uiSlice';
import { TaskPriority } from '@/lib/models/Task';

export default function DailyTasksPanel() {
  const dispatch = useAppDispatch();
  const {
    items: tasks,
    selectedDate,
    priorityColors,
    filterPriority,
    filterPersonId,
    complianceItems,
    prayerTimings,
  } = useAppSelector((state) => state.tasks);
  const { persons } = useAppSelector((state) => state.ledger);

  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('urgent-important');
  const [taskPersonId, setTaskPersonId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAmount, setTaskAmount] = useState<number | ''>('');
  const [taskTax, setTaskTax] = useState('');
  const [targetDayOffset, setTargetDayOffset] = useState<number>(0); // -1 = Prev, 0 = Today, 1 = Next
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAdvancedInputs, setShowAdvancedInputs] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Compute 3 dates: Prev, Current, Next
  const centerD = new Date(selectedDate);
  const prevD = new Date(centerD);
  prevD.setDate(prevD.getDate() - 1);
  const nextD = new Date(centerD);
  nextD.setDate(nextD.getDate() + 1);

  const prevDateStr = prevD.toISOString().split('T')[0];
  const currDateStr = centerD.toISOString().split('T')[0];
  const nextDateStr = nextD.toISOString().split('T')[0];

  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch 3-day tasks, compliances, and persons
  useEffect(() => {
    dispatch(fetchThreeDaysTasks(selectedDate));
    dispatch(fetchComplianceAndPrayers(selectedDate));
    if (persons.length === 0) {
      dispatch(fetchPersons(undefined));
    }
  }, [dispatch, selectedDate, persons.length]);

  // Voice typing setup
  const toggleVoiceTyping = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      dispatch(showToast({ message: 'Voice typing not supported on this browser', type: 'error' }));
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        dispatch(showToast({ message: 'Listening... बोलिए...', type: 'info' }));
      };

      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setNewTitle((prev) => (prev ? `${prev} ${text}` : text));
        setIsRecording(false);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let assignedDate = currDateStr;
    if (targetDayOffset === -1) assignedDate = prevDateStr;
    if (targetDayOffset === 1) assignedDate = nextDateStr;

    const matchedPerson = persons.find((p) => p._id === taskPersonId);

    await dispatch(
      createTask({
        title: newTitle.trim(),
        priority: newPriority,
        date: assignedDate,
        dueDate: taskDueDate || assignedDate,
        personId: taskPersonId || undefined,
        personName: matchedPerson ? matchedPerson.name : undefined,
        amount: taskAmount ? Number(taskAmount) : undefined,
        tax: taskTax.trim() || undefined,
        sourceType: taskPersonId ? 'person_field' : 'manual',
      })
    );

    setNewTitle('');
    setTaskAmount('');
    setTaskTax('');
    setTaskDueDate('');
    dispatch(showToast({ message: 'Task added successfully! ✨', type: 'success' }));
  };

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
      }, 350);
    } else {
      await dispatch(
        updateTask({
          id: task._id,
          updates: { completed: nextState },
        })
      );
    }
  };

  const changeCenterDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    dispatch(setSelectedDate(d.toISOString().split('T')[0]));
  };

  const getPriorityInfo = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent-important':
        return { label: 'Urgent & Important (Q1)', color: priorityColors['urgent-important'], badge: '🔴' };
      case 'urgent-not-important':
        return { label: 'Urgent, Not Important (Q2)', color: priorityColors['urgent-not-important'], badge: '🟠' };
      case 'important-not-urgent':
        return { label: 'Important, Not Urgent (Q3)', color: priorityColors['important-not-urgent'], badge: '🟡' };
      case 'not-urgent-not-important':
        return { label: 'Not Urgent & Not Important (Q4)', color: priorityColors['not-urgent-not-important'], badge: '🟢' };
      default:
        return { label: 'General Task', color: '#888', badge: '⚪' };
    }
  };

  // Collect persons who currently have tasks
  const personsWithTasksMap = new Map<string, { id: string; name: string; count: number }>();
  tasks.forEach((t) => {
    if (t.personId && t.personName) {
      const existing = personsWithTasksMap.get(t.personId);
      if (existing) {
        existing.count += 1;
      } else {
        personsWithTasksMap.set(t.personId, { id: t.personId, name: t.personName, count: 1 });
      }
    }
  });
  const personsWithTasks = Array.from(personsWithTasksMap.values());

  const renderDayColumn = (
    dateStr: string,
    dayTitle: string,
    badgeText: string,
    isCurrent: boolean
  ) => {
    let dayTasks = tasks.filter((t) => t.date === dateStr);
    if (filterPersonId) {
      dayTasks = dayTasks.filter((t) => t.personId === filterPersonId);
    }
    const dayCompleted = dayTasks.filter((t) => t.completed).length;

    return (
      <div
        className={`flex-1 min-w-[290px] rounded-2xl border p-4 flex flex-col justify-between transition-all ${
          isCurrent
            ? 'bg-[#161616] border-red-600/40 shadow-xl shadow-red-950/20'
            : 'bg-[#131313] border-[#262626]'
        }`}
      >
        {/* Column Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#252525] mb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {dayTitle}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isCurrent
                      ? 'bg-red-600 text-white'
                      : dateStr < todayStr
                      ? 'bg-neutral-800 text-neutral-400'
                      : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                  }`}
                >
                  {badgeText}
                </span>
              </div>
              <span className="text-xs text-neutral-400 font-mono block mt-0.5">
                📅 {dateStr}
              </span>
            </div>

            <span className="text-[11px] font-semibold text-neutral-400 bg-[#202020] px-2 py-1 rounded-lg">
              {dayCompleted}/{dayTasks.length} Done
            </span>
          </div>

          {/* Task Items List for this day */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {dayTasks.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-xs italic">
                {filterPersonId
                  ? 'इस पर्सन के लिए इस दिन कोई टास्क नहीं है।'
                  : `No tasks scheduled for ${dayTitle.toLowerCase()}.`}
              </div>
            ) : (
              dayTasks.map((task) => {
                const pInfo = getPriorityInfo(task.priority);
                const isAnimating = animatingTaskId === task._id;

                return (
                  <div
                    key={task._id}
                    className={`p-3 rounded-xl border transition-all duration-200 ${
                      task.completed
                        ? 'bg-[#111111] border-[#222222] opacity-60'
                        : 'bg-[#1b1b1b] border-[#2f2f2f] hover:border-[#3f3f3f] shadow-sm'
                    } ${isAnimating ? 'scale-[1.02] shadow-[0_0_15px_rgba(34,197,94,0.3)] bg-emerald-950/20' : ''}`}
                    style={{ borderLeftWidth: '3.5px', borderLeftColor: pInfo.color }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleComplete(task)}
                          className="mt-0.5 text-neutral-400 hover:text-white transition flex-shrink-0"
                        >
                          {task.completed || isAnimating ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-neutral-500 hover:text-white" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`text-xs sm:text-sm font-semibold transition ${
                              task.completed ? 'line-through text-neutral-500' : 'text-neutral-100'
                            }`}
                          >
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => dispatch(deleteTask(task._id))}
                        className="p-1 text-neutral-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Linked Personal Account, Amount, Tax, Due Date Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1.5 border-t border-[#262626] text-[10px]">
                      <span
                        className="px-1.5 py-0.5 rounded font-bold"
                        style={{ color: pInfo.color }}
                      >
                        {pInfo.badge} {pInfo.label.split(' ')[0]}
                      </span>

                      {/* Linked Personal Account clickable button */}
                      {task.personName && (
                        <button
                          onClick={() => {
                            if (task.personId) {
                              dispatch(setSelectedPersonId(task.personId));
                              dispatch(setActiveView('ledger'));
                            }
                          }}
                          className="flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-950/50 border border-blue-800/40 px-2 py-0.5 rounded-lg transition"
                          title="Open Personal Profile & Ledger"
                        >
                          <User className="w-3 h-3 text-blue-400" />
                          <span>{task.personName}</span>
                        </button>
                      )}

                      {/* Amount Badge */}
                      {task.amount ? (
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.5 rounded-lg">
                          <span>₹{Number(task.amount).toLocaleString('en-IN')}</span>
                        </span>
                      ) : null}

                      {/* Tax Badge */}
                      {task.tax ? (
                        <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-400 bg-amber-950/50 border border-amber-800/40 px-1.5 py-0.5 rounded-lg">
                          <Tag className="w-2.5 h-2.5" />
                          <span>{task.tax}</span>
                        </span>
                      ) : null}

                      {task.dueDate && task.dueDate !== task.date && (
                        <span className="text-amber-400 font-mono ml-auto">
                          Due: {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Add Button to this specific day */}
        <button
          onClick={() => {
            if (dateStr === prevDateStr) setTargetDayOffset(-1);
            else if (dateStr === nextDateStr) setTargetDayOffset(1);
            else setTargetDayOffset(0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="mt-3 w-full py-2 bg-[#202020] hover:bg-[#282828] text-neutral-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add to {dayTitle}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 space-y-6 animate-fade-in">
      {/* Top Header & 3-Day Window Controls */}
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-inner">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>3-Day Task Manager (पिछला · करंट · अगला)</span>
            </h1>
            <p className="text-xs text-neutral-400">
              Yesterday, Today, and Tomorrow at a glance · Person-wise Task Management &amp; Dues
            </p>
          </div>
        </div>

        {/* 3-Day Window Navigation */}
        <div className="flex items-center gap-2 bg-[#1b1b1b] border border-[#303030] p-1.5 rounded-2xl flex-wrap">
          <button
            onClick={() => changeCenterDate(-1)}
            className="p-2 text-neutral-400 hover:text-white hover:bg-[#252525] rounded-xl transition flex items-center gap-1 text-xs"
            title="Shift window back by 1 day"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev Day</span>
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => dispatch(setSelectedDate(e.target.value))}
            className="bg-transparent text-white font-semibold text-xs sm:text-sm px-2 py-1 outline-none cursor-pointer"
          />

          <button
            onClick={() => changeCenterDate(1)}
            className="p-2 text-neutral-400 hover:text-white hover:bg-[#252525] rounded-xl transition flex items-center gap-1 text-xs"
            title="Shift window forward by 1 day"
          >
            <span className="hidden sm:inline">Next Day</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {selectedDate !== todayStr && (
            <button
              onClick={() => dispatch(setSelectedDate(todayStr))}
              className="px-2.5 py-1 text-xs font-semibold bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-600/30 transition"
            >
              Today
            </button>
          )}

          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 text-neutral-400 hover:text-amber-400 hover:bg-[#252525] rounded-xl transition"
            title="Eisenhower Matrix Colors"
          >
            <Palette className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Person-wise Tasks Filter Bar */}
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-3 sm:p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-200">
            <Filter className="w-4 h-4 text-blue-400" />
            <span>पर्सन अनुसार फ़िल्टर (Filter by Person):</span>
          </div>

          <select
            value={filterPersonId || ''}
            onChange={(e) => dispatch(setFilterPersonId(e.target.value || null))}
            className="px-3 py-1.5 bg-[#1c1c1c] border border-[#333333] rounded-xl text-xs font-semibold text-white outline-none focus:border-blue-500"
          >
            <option value="">👥 सभी पर्सन के टास्क (All Persons Tasks)</option>
            {personsWithTasks.map((p) => (
              <option key={p.id} value={p.id}>
                👤 {p.name} ({p.count} tasks)
              </option>
            ))}
          </select>

          {filterPersonId && (
            <button
              onClick={() => dispatch(setFilterPersonId(null))}
              className="px-2.5 py-1 text-xs font-semibold text-red-400 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 rounded-xl transition"
            >
              फ़िल्टर हटाएं (Reset)
            </button>
          )}
        </div>

        <div className="text-xs text-neutral-400">
          Showing {tasks.length} total tasks across 3 days
        </div>
      </div>

      {/* Color Customization Bar */}
      {showColorPicker && (
        <div className="bg-[#181818] border border-[#2e2e2e] rounded-2xl p-4 animate-fade-in space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-300 font-semibold">
            <span>🎨 Eisenhower Matrix Priorities &amp; Colors:</span>
            <button onClick={() => setShowColorPicker(false)} className="text-neutral-400 hover:text-white text-xs">
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
                  onChange={(e) => dispatch(setPriorityColor({ priority: pKey, color: e.target.value }))}
                  className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Task Form with Person Linking, Due Date, Amount, Tax, 3-Day Assignment & Voice */}
      <form
        onSubmit={handleAddTask}
        className="bg-[#161616] border border-[#2b2b2b] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-red-500" />
            <span>टास्क जोड़ें (Quick Add Task with Person &amp; Dues)</span>
          </label>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-neutral-400">Target Day:</span>
            <button
              type="button"
              onClick={() => setTargetDayOffset(-1)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                targetDayOffset === -1 ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white bg-[#222]'
              }`}
            >
              Previous ({prevDateStr.slice(5)})
            </button>
            <button
              type="button"
              onClick={() => setTargetDayOffset(0)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                targetDayOffset === 0 ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white bg-[#222]'
              }`}
            >
              Current ({currDateStr.slice(5)})
            </button>
            <button
              type="button"
              onClick={() => setTargetDayOffset(1)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                targetDayOffset === 1 ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white bg-[#222]'
              }`}
            >
              Next ({nextDateStr.slice(5)})
            </button>
          </div>
        </div>

        {/* Row 1: Task Title & Priority */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="क्या काम करना है? बोलकर भी लिख सकते हैं..."
              className="w-full pl-4 pr-11 py-3 bg-[#111111] border border-[#333333] rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500 transition"
            />
            <button
              type="button"
              onClick={toggleVoiceTyping}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition ${
                isRecording ? 'bg-red-600 text-white animate-pulse' : 'text-neutral-400 hover:text-white'
              }`}
              title="Voice Typing (बोलकर लिखें)"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
            className="w-full sm:w-auto px-3 py-3 bg-[#111111] border border-[#333333] rounded-xl text-xs sm:text-sm font-semibold text-neutral-200 outline-none focus:border-red-500"
          >
            <option value="urgent-important">🔴 Red: Urgent &amp; Important</option>
            <option value="urgent-not-important">🟠 Orange: Urgent, Not Important</option>
            <option value="important-not-urgent">🟡 Yellow: Important, Not Urgent</option>
            <option value="not-urgent-not-important">🟢 Green: Not Urgent, Not Important</option>
          </select>

          <button
            type="button"
            onClick={() => setShowAdvancedInputs(!showAdvancedInputs)}
            className={`px-3 py-3 rounded-xl border text-xs font-semibold transition ${
              showAdvancedInputs || taskPersonId || taskAmount
                ? 'bg-blue-950/60 border-blue-500/60 text-blue-300'
                : 'bg-[#1b1b1b] border-[#333] text-neutral-400 hover:text-white'
            }`}
            title="Toggle Person, Due Date, Amount & Tax fields"
          >
            <span>+ पर्सन / राशि</span>
          </button>

          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="w-full sm:w-auto px-5 py-3 bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 text-white font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Row 2: Person Linking, Due Date, Amount, Tax (Always or Expanded) */}
        {(showAdvancedInputs || taskPersonId || taskAmount) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-[#252525] animate-fade-in">
            {/* Person Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-blue-400" />
                <span>पर्सन सेलेक्ट करें (Personal Account):</span>
              </label>
              <select
                value={taskPersonId}
                onChange={(e) => setTaskPersonId(e.target.value)}
                className="w-full px-3 py-2 bg-[#111111] border border-[#333333] rounded-xl text-xs text-neutral-200 outline-none focus:border-blue-500"
              >
                <option value="">-- बिना पर्सन के सामान्य टास्क --</option>
                {persons.map((p) => (
                  <option key={p._id} value={p._id}>
                    👤 {p.name} {p.mobile ? `(${p.mobile})` : ''} - {p.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Due Date */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>ड्यू डेट (Due Date - If different):</span>
              </label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#111111] border border-[#333333] rounded-xl text-xs text-neutral-200 outline-none focus:border-amber-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1 flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-emerald-400" />
                <span>अमाउंट (₹ Optional):</span>
              </label>
              <input
                type="number"
                value={taskAmount}
                onChange={(e) => setTaskAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="उदा. 25000"
                className="w-full px-3 py-2 bg-[#111111] border border-[#333333] rounded-xl text-xs text-neutral-200 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Tax */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-400" />
                <span>टैक्स / GST (Optional):</span>
              </label>
              <input
                type="text"
                value={taskTax}
                onChange={(e) => setTaskTax(e.target.value)}
                placeholder="उदा. 18% GST"
                className="w-full px-3 py-2 bg-[#111111] border border-[#333333] rounded-xl text-xs text-neutral-200 outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}
      </form>

      {/* 3-DAY COLUMNS (PREVIOUS · CURRENT · NEXT) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Day 1: Yesterday / Previous */}
        {renderDayColumn(prevDateStr, 'पिछला दिन (Previous)', 'Day - 1', false)}

        {/* Day 2: Today / Current */}
        {renderDayColumn(currDateStr, 'करंट दिन (Current Focus)', 'Day 0', true)}

        {/* Day 3: Tomorrow / Next */}
        {renderDayColumn(nextDateStr, 'अगला दिन (Next)', 'Day + 1', false)}
      </div>
    </div>
  );
}
