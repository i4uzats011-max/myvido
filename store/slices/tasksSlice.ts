import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TaskPriority } from '@/lib/models/Task';

export interface TaskItem {
  _id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  customColor?: string;
  completed: boolean;
  completedAt: string | null;
  date: string;
  dueDate?: string;
  isRoutine?: boolean;
  routineFrequency?: 'daily' | 'weekly' | 'monthly' | null;
  personId?: string;
  personName?: string;
  amount?: number;
  tax?: string;
  sourceType?: string;
  createdAt: string;
}

export interface ReminderItem {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  isRecurring: boolean;
  recurringType: 'daily' | 'weekly' | 'monthly' | null;
  completed: boolean;
  createdAt: string;
}

export interface PriorityColors {
  'urgent-important': string; // Red
  'urgent-not-important': string; // Orange
  'important-not-urgent': string; // Yellow
  'not-urgent-not-important': string; // Green
}

export const defaultPriorityColors: PriorityColors = {
  'urgent-important': '#ef4444', // Red (Urgent & Important)
  'urgent-not-important': '#f97316', // Orange (Urgent, Not Important)
  'important-not-urgent': '#eab308', // Yellow (Important, Not Urgent)
  'not-urgent-not-important': '#22c55e', // Green (Not Urgent, Not Important)
};

interface TasksState {
  items: TaskItem[];
  reminders: ReminderItem[];
  selectedDate: string; // YYYY-MM-DD
  priorityColors: PriorityColors;
  filterPriority: string | null;
  filterPersonId: string | null;
  isLoading: boolean;
  error: string | null;
  complianceItems: Array<{
    id: string;
    date: string;
    title: string;
    category: string;
    priority: string;
    description: string;
    statutoryAct?: string;
    formName?: string;
  }>;
  prayerTimings: {
    sehriEnd: string;
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    iftar: string;
    isha: string;
  } | null;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const initialState: TasksState = {
  items: [],
  reminders: [],
  selectedDate: getTodayString(),
  priorityColors: defaultPriorityColors,
  filterPriority: null,
  filterPersonId: null,
  isLoading: false,
  error: null,
  complianceItems: [],
  prayerTimings: null,
};

// Async Thunks
export const fetchTasksForDate = createAsyncThunk(
  'tasks/fetchTasksForDate',
  async (date: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/tasks?date=${date}`);
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data.tasks;
    } catch {
      return rejectWithValue('Failed to load tasks');
    }
  }
);

export const fetchThreeDaysTasks = createAsyncThunk(
  'tasks/fetchThreeDaysTasks',
  async (centerDate: string, { rejectWithValue }) => {
    try {
      const d = new Date(centerDate);
      const prev = new Date(d);
      prev.setDate(prev.getDate() - 1);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const dPrevStr = prev.toISOString().split('T')[0];
      const dCurrStr = d.toISOString().split('T')[0];
      const dNextStr = next.toISOString().split('T')[0];

      const res = await fetch(`/api/tasks?dates=${dPrevStr},${dCurrStr},${dNextStr}`);
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data.tasks;
    } catch {
      return rejectWithValue('Failed to load 3-day tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: Partial<TaskItem>, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data.task;
    } catch {
      return rejectWithValue('Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, updates }: { id: string; updates: Partial<TaskItem> }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data.task;
    } catch {
      return rejectWithValue('Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return id;
    } catch {
      return rejectWithValue('Failed to delete task');
    }
  }
);

export const fetchComplianceAndPrayers = createAsyncThunk(
  'tasks/fetchComplianceAndPrayers',
  async (date: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/compliance?date=${date}`);
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error);
      return data;
    } catch {
      return rejectWithValue('Failed to load compliance and prayer timings');
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setPriorityColor: (
      state,
      action: PayloadAction<{ priority: keyof PriorityColors; color: string }>
    ) => {
      state.priorityColors[action.payload.priority] = action.payload.color;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('zen_priority_colors', JSON.stringify(state.priorityColors));
        } catch {}
      }
    },
    loadPriorityColorsFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('zen_priority_colors');
          if (saved) {
            state.priorityColors = { ...defaultPriorityColors, ...JSON.parse(saved) };
          }
        } catch {}
      }
    },
    setFilterPriority: (state, action: PayloadAction<string | null>) => {
      state.filterPriority = action.payload;
    },
    setFilterPersonId: (state, action: PayloadAction<string | null>) => {
      state.filterPersonId = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch date tasks
    builder
      .addCase(fetchTasksForDate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasksForDate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasksForDate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch 3-day tasks
    builder
      .addCase(fetchThreeDaysTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchThreeDaysTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchThreeDaysTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create task
    builder.addCase(createTask.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
    });

    // Update task
    builder.addCase(updateTask.fulfilled, (state, action) => {
      const idx = state.items.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) {
        state.items[idx] = action.payload;
      }
    });

    // Delete task
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.items = state.items.filter((t) => t._id !== action.payload);
    });

    // Compliance & Prayers
    builder.addCase(fetchComplianceAndPrayers.fulfilled, (state, action) => {
      state.complianceItems = action.payload.items || [];
      state.prayerTimings = action.payload.prayerTimings || null;
    });
  },
});

export const {
  setSelectedDate,
  setPriorityColor,
  loadPriorityColorsFromStorage,
  setFilterPriority,
  setFilterPersonId,
} = tasksSlice.actions;

export default tasksSlice.reducer;
